import { Head, router } from '@inertiajs/react';
import { Check, X, SlidersHorizontal, Globe } from 'lucide-react';
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
        from: number | null;
        to: number | null;
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

const ACTION_STYLES: Record<ConsentRow['action'], string> = {
    accept_all: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    reject_all: 'bg-rose-50 text-rose-700 ring-rose-200',
    custom: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export default function ConsentIndex({ stats, records, filters, periods }: Props) {
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

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                        Every choice made on the cookie banner, kept as proof of consent.
                    </p>

                    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                        {periods.map((d) => (
                            <button
                                key={d}
                                onClick={() => visit({ days: d })}
                                className={cn(
                                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                    filters.days === d
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700',
                                )}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>

                {stats.total === 0 ? (
                    <EmptyState days={stats.days} />
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard label="Decisions" value={stats.total.toLocaleString()} hint={`last ${stats.days} days`} />
                            <StatCard
                                label="Accepted all"
                                value={`${stats.actions.accept_all.pct}%`}
                                hint={`${stats.actions.accept_all.count.toLocaleString()} visitors`}
                                icon={<Check size={16} className="text-emerald-600" />}
                            />
                            <StatCard
                                label="Rejected all"
                                value={`${stats.actions.reject_all.pct}%`}
                                hint={`${stats.actions.reject_all.count.toLocaleString()} visitors`}
                                icon={<X size={16} className="text-rose-600" />}
                            />
                            <StatCard
                                label="Customised"
                                value={`${stats.actions.custom.pct}%`}
                                hint={`${stats.actions.custom.count.toLocaleString()} visitors`}
                                icon={<SlidersHorizontal size={16} className="text-amber-600" />}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                                <h2 className="text-sm font-semibold text-slate-900">Decisions per day</h2>
                                <Trend data={stats.trend} />
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-5">
                                    <h2 className="text-sm font-semibold text-slate-900">Opt-in rate by category</h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Share of visitors who allowed each category.
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        <Meter label="Analytics" pct={stats.categories.analytics} />
                                        <Meter label="Marketing" pct={stats.categories.marketing} />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-5">
                                    <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                                        <Globe size={14} className="text-slate-400" />
                                        Language
                                    </h2>
                                    <div className="mt-4 space-y-3">
                                        <Meter label="English" pct={stats.locales.en} />
                                        <Meter label="Arabic" pct={stats.locales.ar} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Consent log
                            <span className="ms-2 font-normal text-slate-400">
                                {records.total.toLocaleString()} records
                            </span>
                        </h2>

                        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                            {([null, 'accept_all', 'reject_all', 'custom'] as const).map((a) => (
                                <button
                                    key={a ?? 'all'}
                                    onClick={() => visit({ action: a })}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition',
                                        filters.action === a
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700',
                                    )}
                                >
                                    {a ? ACTION_LABELS[a] : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {records.data.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-400">
                            No records match this filter.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-start text-xs uppercase tracking-wide text-slate-400">
                                        <th className="px-5 py-3 text-start font-medium">When</th>
                                        <th className="px-5 py-3 text-start font-medium">Choice</th>
                                        <th className="px-5 py-3 text-start font-medium">Analytics</th>
                                        <th className="px-5 py-3 text-start font-medium">Marketing</th>
                                        <th className="px-5 py-3 text-start font-medium">Lang</th>
                                        <th className="px-5 py-3 text-start font-medium">IP</th>
                                        <th className="px-5 py-3 text-start font-medium">Policy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.data.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/70">
                                            <td className="whitespace-nowrap px-5 py-3 text-slate-600">
                                                {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={cn(
                                                        'inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1',
                                                        ACTION_STYLES[r.action],
                                                    )}
                                                >
                                                    {ACTION_LABELS[r.action]}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3"><YesNo on={r.analytics} /></td>
                                            <td className="px-5 py-3"><YesNo on={r.marketing} /></td>
                                            <td className="px-5 py-3 uppercase text-slate-500">{r.locale}</td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                                {r.ip_address ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-400">v{r.policy_version}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {records.links.length > 3 && (
                        <div className="flex flex-wrap gap-1 border-t border-slate-200 px-5 py-3">
                            {records.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-xs transition',
                                        link.active
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-500 hover:bg-slate-100 disabled:opacity-40',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon?: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                {icon}
                {label}
            </span>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
        </div>
    );
}

function Meter({ label, pct }: { label: string; pct: number }) {
    return (
        <div>
            <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="tabular-nums text-slate-500">{pct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
            </div>
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
        <div className="mt-4 flex h-32 items-end gap-px" role="img" aria-label="Daily consent decisions">
            {data.map((d) => (
                <div key={d.date} className="group relative flex-1">
                    <div
                        className="w-full rounded-t-sm bg-sky-200 transition group-hover:bg-sky-400"
                        style={{ height: `${Math.max(2, (d.total / peak) * 128)}px` }}
                    />
                    <span className="pointer-events-none absolute bottom-full start-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[11px] text-white group-hover:block">
                        {d.date}: {d.total}
                    </span>
                </div>
            ))}
        </div>
    );
}

function YesNo({ on }: { on: boolean }) {
    return on ? (
        <Check size={16} className="text-emerald-600" aria-label="allowed" />
    ) : (
        <X size={16} className="text-slate-300" aria-label="declined" />
    );
}

function EmptyState({ days }: { days: number }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No consent decisions in the last {days} days</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Records appear here once visitors respond to the cookie banner. If this stays empty after the
                site has had traffic, check that the banner is rendering on the public site.
            </p>
        </div>
    );
}
