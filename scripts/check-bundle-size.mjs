// Bundle-size budget gate. Run AFTER `npm run build` (see the `check:bundle`
// npm script + the CI Frontend job). Fails the build if any single JS chunk
// exceeds the per-chunk cap — the cheap, deterministic guard that would have
// caught the 338 kB recharts chunk before it ever merged.
//
// Why per-chunk (not a total budget): a total cap produces false failures as the
// app legitimately grows more pages/chunks over time. A fat new dependency, the
// thing we actually want to catch, lands in ONE chunk — so a per-chunk ceiling
// flags the regression without punishing normal growth. RAW (not gzipped) size
// is the budget because it's what the cap is reasoned about in; gzip is printed
// alongside as the real transfer cost.
//
// Tune MAX_CHUNK_KB as the app grows. Add a genuine, reviewed exception to
// OVERRIDES rather than raising the global cap for everyone.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const ASSETS_DIR = 'public/build/assets';
const MAX_CHUNK_KB = 300;

/** Per-file raw-KB overrides for reviewed exceptions, e.g. { 'vendor-x': 420 }. */
const OVERRIDES = {};

const kb = (bytes) => Math.round(bytes / 1024);

let files;
try {
    files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.js'));
} catch {
    console.error(`✗ ${ASSETS_DIR} not found — run \`npm run build\` first.`);
    process.exit(1);
}

if (files.length === 0) {
    console.error(`✗ No JS chunks in ${ASSETS_DIR} — did the build succeed?`);
    process.exit(1);
}

const capFor = (name) => {
    const key = Object.keys(OVERRIDES).find((k) => name.startsWith(k));
    return key ? OVERRIDES[key] : MAX_CHUNK_KB;
};

const rows = files
    .map((name) => {
        const buf = readFileSync(join(ASSETS_DIR, name));
        return {
            name,
            raw: statSync(join(ASSETS_DIR, name)).size,
            gz: gzipSync(buf).length,
            cap: capFor(name),
        };
    })
    .sort((a, b) => b.raw - a.raw);

const over = rows.filter((r) => kb(r.raw) > r.cap);

console.log(`\nBundle-size budget — per-chunk cap ${MAX_CHUNK_KB} kB (raw)\n`);
console.log('  raw    gz    chunk');
console.log('  ─────  ────  ─────────────────────────────────────');
for (const r of rows) {
    const flag = kb(r.raw) > r.cap ? '  ✗ OVER' : '';
    console.log(`  ${String(kb(r.raw)).padStart(4)}K ${String(kb(r.gz)).padStart(4)}K  ${r.name}${flag}`);
}
console.log(`\n  Total: ${kb(rows.reduce((s, r) => s + r.raw, 0))}K raw · ${kb(rows.reduce((s, r) => s + r.gz, 0))}K gzipped\n`);

if (over.length > 0) {
    console.error(`✗ ${over.length} chunk(s) over the ${MAX_CHUNK_KB} kB budget:`);
    for (const r of over) console.error(`    ${r.name} — ${kb(r.raw)} kB`);
    console.error('\n  Split the dependency, lazy-load it, or add a reviewed OVERRIDE in this script.');
    process.exit(1);
}

console.log('✓ All chunks within budget.\n');
