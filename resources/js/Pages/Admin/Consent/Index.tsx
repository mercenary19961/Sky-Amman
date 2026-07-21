import { Head, router } from '@inertiajs/react';
import { Check, X, SlidersHorizontal } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';

interface ActionStat {
    count: number;
    pct: number;
}

interface Stats {
    total: number;
    days: number;
    actions: Record<'accept_all' | 'reject_all' | 'custom', ActionStat>;
    categories: { analytics: number; marketing: number };
    locales: { en: number; ar: number };
    trend: { date: string; total: number }[];
}

interface ConsentRow {
    id: number;
    action: 'accept_all' | 'reject_all' | 'custom';
    analytics: boolean;
    marketing: boolean;
    locale: string;
    policy_version: string;
    ip_address: string | null;
    url: string | null;
    created_at: string | null;
}

interface Props {
    stats: Stats;
    records: {
        data: ConsentRow[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    filters: { days: number; action: string | null };
    periods: number[];
}

const ACTION_LABELS: Record<ConsentRow['action'], string> = {
    accept_all: 'Accepted all',
    reject_all: 'Rejected all',
    custom: 'Custom',
};

const ACTION_BADGES: Record<ConsentRow['action'], string> = {
    accept_all: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    reject_all: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
    custom: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
};

export default function ConsentIndex({ stats, records, filters, periods }: Props) {
    const empty = stats.total === 0;

    const visit = (params: Record<string, string | number | null>) => {
        router.get('/admin/consent', { days: filters.days, action: filters.action, ...params } as never, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AdminLayout title="Cookie Consent">
            <Head title="Cookie Consent" />

            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-ink-muted">
                        Every choice made on the cookie banner, kept as proof of consent.
                    </p>
                    <Segmented
                        options={periods.map((d) => ({ value: d, label: `${d}d` }))}
                        active={filters.days}
                        onSelect={(days) => visit({ days })}
                    />
                </div>

                {/* Stat row renders even at zero: a stable layout reads better than
                    a collapsing page, and "0 decisions" is itself information. */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Decisions" value={stats.total.toLocaleString()} sub={`last ${stats.days} days`} />
                    <StatCard
                        label="Accepted all"
                        value={`${stats.actions.accept_all.pct}%`}
                        sub={`${stats.actions.accept_all.count.toLocaleString()} visitors`}
                        icon={<Check size={14} />}
                        tone="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        label="Rejected all"
                        value={`${stats.actions.reject_all.pct}%`}
                        sub={`${stats.actions.reject_all.count.toLocaleString()} visitors`}
                        icon={<X size={14} />}
                        tone="text-rose-600 dark:text-rose-400"
                    />
                    <StatCard
                        label="Customised"
                        value={`${stats.actions.custom.pct}%`}
                        sub={`${stats.actions.custom.count.toLocaleString()} visitors`}
                        icon={<SlidersHorizontal size={14} />}
                        tone="text-amber-600 dark:text-amber-400"
                    />
                </div>

                {/* Charts are meaningless with no data — an all-zero trend is just
                    a big empty box, which is what made this page look broken. */}
                {!empty && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <SectionCard title="Decisions per day" className="lg:col-span-2">
                            <Trend data={stats.trend} />
                        </SectionCard>

                        <div className="space-y-4">
                            <SectionCard title="Opt-in rate by category">
                                <div className="space-y-3">
                                    <Meter label="Analytics" pct={stats.categories.analytics} />
                                    <Meter label="Marketing" pct={stats.categories.marketing} />
                                </div>
                            </SectionCard>

                            <SectionCard title="Language">
                                <div className="space-y-3">
                                    <Meter label="English" pct={stats.locales.en} />
                                    <Meter label="Arabic" pct={stats.locales.ar} />
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-ink/5 dark:border-white/10">
                        <h2 className="text-sm font-semibold text-ink">
                            Consent log
                            <span className="ms-2 font-normal text-ink-muted">
                                {records.total.toLocaleString()} {records.total === 1 ? 'record' : 'records'}
                            </span>
                        </h2>

                        <Segmented
                            size="sm"
                            options={[
                                { value: '', label: 'All' },
                                { value: 'accept_all', label: 'Accepted' },
                                { value: 'reject_all', label: 'Rejected' },
                                { value: 'custom', label: 'Custom' },
                            ]}
                            active={filters.action ?? ''}
                            onSelect={(action) => visit({ action: action === '' ? null : action })}
                        />
                    </div>

                    {records.data.length === 0 ? (
                        <Empty days={stats.days} filtered={Boolean(filters.action)} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-ink/5 dark:border-white/10 text-xs font-medium text-ink-muted">
                                            <th className="px-5 py-2.5 text-start font-medium">When</th>
                                            <th className="px-5 py-2.5 text-start font-medium">Choice</th>
                                            <th className="px-5 py-2.5 text-start font-medium">Analytics</th>
                                            <th className="px-5 py-2.5 text-start font-medium">Marketing</th>
                                            <th className="px-5 py-2.5 text-start font-medium">Lang</th>
                                            <th className="px-5 py-2.5 text-start font-medium">IP</th>
                                            <th className="px-5 py-2.5 text-start font-medium">Policy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                                        {records.data.map((r) => (
                                            <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                                <td className="whitespace-nowrap px-5 py-2.5 text-ink-muted">
                                                    {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                                                </td>
                                                <td className="px-5 py-2.5">
                                                    <span className={cn('inline-block whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-medium', ACTION_BADGES[r.action])}>
                                                        {ACTION_LABELS[r.action]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-2.5"><YesNo on={r.analytics} /></td>
                                                <td className="px-5 py-2.5"><YesNo on={r.marketing} /></td>
                                                <td className="px-5 py-2.5 uppercase text-ink-muted">{r.locale}</td>
                                                <td className="px-5 py-2.5 font-mono text-xs text-ink-muted">{r.ip_address ?? '—'}</td>
                                                <td className="px-5 py-2.5 text-ink-muted">v{r.policy_version}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {records.links.length > 3 && (
                                <div className="flex flex-wrap gap-1 border-t border-ink/5 dark:border-white/10 px-5 py-3">
                                    {records.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                            className={cn(
                                                'rounded px-2.5 py-1 text-xs transition-colors',
                                                link.active
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-ink-muted hover:text-primary disabled:opacity-40 disabled:hover:text-ink-muted',
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function SectionCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg', className)}>
            <div className="px-5 py-3.5 border-b border-ink/5 dark:border-white/10">
                <h2 className="text-sm font-semibold text-ink">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function StatCard({ label, value, sub, icon, tone }: {
    label: string;
    value: string;
    sub: string;
    icon?: React.ReactNode;
    tone?: string;
}) {
    return (
        <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg p-5">
            <div className={cn('flex items-center gap-1.5 text-xs font-medium', tone ?? 'text-ink-muted')}>
                {icon}
                {label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-ink tabular-nums">{value}</div>
            <div className="mt-0.5 text-xs text-ink-muted">{sub}</div>
        </div>
    );
}

/** Shared pill group — the period picker and the log filter were drifting apart. */
function Segmented<T extends string | number>({ options, active, onSelect, size = 'md' }: {
    options: { value: T; label: string }[];
    active: T;
    onSelect: (value: T) => void;
    size?: 'sm' | 'md';
}) {
    return (
        <div className="flex gap-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-700/60 p-0.5">
            {options.map((o) => (
                <button
                    key={String(o.value)}
                    onClick={() => onSelect(o.value)}
                    className={cn(
                        'rounded-md font-medium transition-colors',
                        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
                        active === o.value
                            ? 'bg-white dark:bg-zinc-800 text-ink shadow-sm'
                            : 'text-ink-muted hover:text-ink',
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function Meter({ label, pct }: { label: string; pct: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-xs text-ink-muted">{label}</div>
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="w-10 shrink-0 text-end text-xs font-medium tabular-nums text-ink">{pct}%</div>
        </div>
    );
}

/**
 * Bar chart in plain CSS — a charting dependency would be ~50kB for one graph,
 * and the project has kept its bundle deliberately lean.
 */
function Trend({ data }: { data: { date: string; total: number }[] }) {
    const peak = Math.max(1, ...data.map((d) => d.total));

    return (
        <div className="flex h-32 items-end gap-px" role="img" aria-label="Daily consent decisions">
            {data.map((d) => (
                <div key={d.date} className="group relative flex-1">
                    <div
                        className="w-full rounded-t-sm bg-primary/30 group-hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(2, (d.total / peak) * 128)}px` }}
                    />
                    <span className="pointer-events-none absolute bottom-full inset-s-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block dark:bg-zinc-900">
                        {d.date}: {d.total}
                    </span>
                </div>
            ))}
        </div>
    );
}

function YesNo({ on }: { on: boolean }) {
    return on ? (
        <Check size={15} className="text-emerald-600 dark:text-emerald-400" aria-label="allowed" />
    ) : (
        <X size={15} className="text-ink-muted/40" aria-label="declined" />
    );
}

/** One empty state, inside the log card — not a second full-width box above it. */
function Empty({ days, filtered }: { days: number; filtered: boolean }) {
    return (
        <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-ink">
                {filtered ? 'No records match this filter' : `No consent decisions in the last ${days} days`}
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs text-ink-muted">
                {filtered
                    ? 'Try a different choice or a longer period.'
                    : 'Records appear here once visitors respond to the cookie banner. If this stays empty after the site has had traffic, check that the banner is rendering on the public site.'}
            </p>
        </div>
    );
}
