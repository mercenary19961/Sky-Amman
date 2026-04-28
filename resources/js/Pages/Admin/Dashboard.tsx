import { Head, Link, usePage } from '@inertiajs/react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    Building2,
    MessageSquare,
    AlertTriangle,
    Image as ImageIcon,
    Search,
    ExternalLink,
    EyeOff,
    Share2,
    Plus,
    FileText,
    Settings as SettingsIcon,
    MailOpen,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';
import type { DashboardPageProps, ContentHealthItem } from '@/types/admin/dashboard';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
    under_development: 'Under Development',
    ready: 'Ready',
    investment_opportunity: 'Investment',
};

const TYPE_LABELS: Record<string, string> = {
    buy: 'Buy',
    rent: 'Rent',
    build: 'Build',
    investment: 'Investment',
    general: 'General',
};

const SOCIAL_LABELS: Record<string, string> = {
    linkedin_url: 'LinkedIn',
    instagram_url: 'Instagram',
    facebook_url: 'Facebook',
    twitter_url: 'X (Twitter)',
    youtube_url: 'YouTube',
    tiktok_url: 'TikTok',
};

const TYPE_COLORS: Record<string, string> = {
    buy: 'bg-sky-500',
    rent: 'bg-violet-500',
    build: 'bg-amber-500',
    investment: 'bg-emerald-500',
    general: 'bg-zinc-400',
};

const CATEGORY_COLORS: Record<string, string> = {
    under_development: 'bg-amber-500',
    ready: 'bg-emerald-500',
    investment_opportunity: 'bg-sky-500',
};

function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    accent = false,
    warning = false,
}: {
    label: string;
    value: number;
    sub?: string;
    icon: React.ElementType;
    accent?: boolean;
    warning?: boolean;
}) {
    return (
        <div
            className={cn(
                'rounded-lg border p-5 flex items-start gap-4',
                warning
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                    : 'bg-white dark:bg-zinc-800 border-ink/5 dark:border-white/10',
            )}
        >
            <div
                className={cn(
                    'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                    warning
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                        : accent
                          ? 'bg-primary/10 text-primary'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-ink-muted',
                )}
            >
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <div className={cn('text-2xl font-bold tabular-nums', warning && 'text-amber-700 dark:text-amber-400')}>
                    {value}
                </div>
                <div className="text-sm font-medium text-ink">{label}</div>
                {sub && <div className="text-xs text-ink-muted mt-0.5">{sub}</div>}
            </div>
        </div>
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

function BarRow({ label, count, max, colorClass }: { label: string; count: number; max: number; colorClass: string }) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-xs text-ink-muted text-right">{label}</div>
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', colorClass)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="w-6 shrink-0 text-xs font-medium tabular-nums text-ink">{count}</div>
        </div>
    );
}

function HealthItem({ items, editPath, label, hash }: { items: ContentHealthItem[]; editPath: string; label: string; hash?: string }) {
    if (items.length === 0) return null;
    return (
        <div>
            <p className="text-xs font-medium text-ink-muted mb-1.5">{label}</p>
            <ul className="space-y-1">
                {items.map(item => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-ink truncate flex-1">{item.title_en}</span>
                        <Link
                            href={`${editPath}${item.id}/edit${hash ?? ''}`}
                            className="shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5"
                        >
                            Fix <ExternalLink size={10} />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ── Custom tooltip for the area chart ─────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-zinc-900 text-white text-xs px-3 py-2 rounded shadow-lg">
            <div className="font-medium">{label ? formatDateLabel(label) : ''}</div>
            <div className="text-zinc-300">{payload[0].value} {payload[0].value === 1 ? 'inquiry' : 'inquiries'}</div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { stats, dailyInquiries, inquiriesByType, projectsByCategory, contentHealth, recentInquiries } =
        usePage<DashboardPageProps>().props;

    const maxInquiryType = Math.max(...inquiriesByType.map(r => r.count), 1);
    const maxCategory = Math.max(...projectsByCategory.map(r => r.count), 1);

    const totalHealthIssues =
        contentHealth.projectsMissingImages.length +
        contentHealth.projectsMissingSeo.length +
        contentHealth.emptySocialKeys.length +
        contentHealth.hiddenPages.length +
        contentHealth.hiddenSections.length;

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Quick actions */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Link
                    href="/admin/projects/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                    <Plus size={15} />
                    Add Project
                </Link>
                <Link
                    href="/admin/content"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink rounded text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                    <FileText size={15} />
                    Edit Content
                </Link>
                <Link
                    href="/admin/settings"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-ink/10 dark:border-white/10 text-ink rounded text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                    <SettingsIcon size={15} />
                    Settings
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Active Projects"
                    value={stats.activeProjects}
                    sub={`${stats.totalProjects} total`}
                    icon={Building2}
                    accent
                />
                <StatCard
                    label="Total Inquiries"
                    value={stats.totalInquiries}
                    sub={`${stats.unreadInquiries} unread`}
                    icon={MessageSquare}
                />
                <StatCard
                    label="This Week"
                    value={stats.inquiriesThisWeek}
                    sub="new inquiries"
                    icon={MailOpen}
                />
                {stats.projectsWithoutImages > 0 ? (
                    <StatCard
                        label="Missing Images"
                        value={stats.projectsWithoutImages}
                        sub="active projects"
                        icon={AlertTriangle}
                        warning
                    />
                ) : (
                    <StatCard
                        label="Image Coverage"
                        value={stats.activeProjects}
                        sub="all have images"
                        icon={ImageIcon}
                        accent
                    />
                )}
            </div>

            {/* Chart + inquiry breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Area chart */}
                <SectionCard title="Inquiries — Last 30 Days" className="lg:col-span-2">
                    {stats.totalInquiries === 0 ? (
                        <div className="h-44 flex items-center justify-center text-sm text-ink-muted">
                            No inquiries yet. They'll show up here once the contact form goes live.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={176}>
                            <AreaChart data={dailyInquiries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="inquiryGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94C4EE" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#94C4EE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDateLabel}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={6}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#94C4EE"
                                    strokeWidth={2}
                                    fill="url(#inquiryGradient)"
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#94C4EE' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </SectionCard>

                {/* Inquiries by type */}
                <SectionCard title="By Request Type">
                    {inquiriesByType.length === 0 ? (
                        <p className="text-sm text-ink-muted">No inquiries yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {inquiriesByType.map(row => (
                                <BarRow
                                    key={row.type}
                                    label={TYPE_LABELS[row.type] ?? row.type}
                                    count={row.count}
                                    max={maxInquiryType}
                                    colorClass={TYPE_COLORS[row.type] ?? 'bg-zinc-400'}
                                />
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Projects by category + content health + recent inquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                {/* Projects by category */}
                <SectionCard title="Projects by Category">
                    {projectsByCategory.length === 0 ? (
                        <p className="text-sm text-ink-muted">No projects yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {projectsByCategory.map(row => (
                                <BarRow
                                    key={row.category}
                                    label={CATEGORY_LABELS[row.category] ?? row.category}
                                    count={row.count}
                                    max={maxCategory}
                                    colorClass={CATEGORY_COLORS[row.category] ?? 'bg-zinc-400'}
                                />
                            ))}
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-ink/5 dark:border-white/10">
                        <Link
                            href="/admin/projects"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                            Manage projects <ExternalLink size={10} />
                        </Link>
                    </div>
                </SectionCard>

                {/* Content health */}
                <SectionCard
                    title={`Content Health${totalHealthIssues > 0 ? ` · ${totalHealthIssues} issue${totalHealthIssues !== 1 ? 's' : ''}` : ''}`}
                    className="lg:col-span-2"
                >
                    {totalHealthIssues === 0 ? (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Everything looks good.</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Missing images */}
                            {contentHealth.projectsMissingImages.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <ImageIcon size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">No Gallery Images</span>
                                    </div>
                                    <HealthItem
                                        items={contentHealth.projectsMissingImages}
                                        editPath="/admin/projects/"
                                        label=""
                                        hash="#section-gallery"
                                    />
                                </div>
                            )}

                            {/* Missing SEO */}
                            {contentHealth.projectsMissingSeo.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <Search size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Missing SEO Title</span>
                                    </div>
                                    <HealthItem
                                        items={contentHealth.projectsMissingSeo}
                                        editPath="/admin/projects/"
                                        label=""
                                        hash="#section-seo"
                                    />
                                </div>
                            )}

                            {/* Empty social links */}
                            {contentHealth.emptySocialKeys.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <Share2 size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Social Links Not Set</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {contentHealth.emptySocialKeys.map(key => (
                                            <Link
                                                key={key}
                                                href="/admin/settings#section-social"
                                                className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-ink-muted hover:text-primary transition-colors"
                                            >
                                                {SOCIAL_LABELS[key] ?? key}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Hidden pages / sections */}
                            {(contentHealth.hiddenPages.length > 0 || contentHealth.hiddenSections.length > 0) && (
                                <div>
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <EyeOff size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Hidden from Site</span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {contentHealth.hiddenPages.map(p => (
                                            <div key={p.slug} className="flex items-center justify-between gap-2">
                                                <span className="text-sm text-ink">{p.title_en} <span className="text-xs text-ink-muted">(page)</span></span>
                                                <Link href={`/admin/content#${p.slug}`} className="shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5">
                                                    Fix <ExternalLink size={10} />
                                                </Link>
                                            </div>
                                        ))}
                                        {contentHealth.hiddenSections.map(s => (
                                            <div key={`${s.page}-${s.section}`} className="flex items-center justify-between gap-2">
                                                <span className="text-sm text-ink capitalize">{s.section.replace(/_/g, ' ')} <span className="text-xs text-ink-muted">on {s.page}</span></span>
                                                <Link href={`/admin/content#${s.page}`} className="shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5">
                                                    Fix <ExternalLink size={10} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Recent inquiries */}
            <SectionCard title="Recent Inquiries">
                {recentInquiries.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                        No inquiries yet. They'll appear here once visitors submit the contact form.
                    </p>
                ) : (
                    <div className="overflow-x-auto -mx-5 -mb-5">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-ink/5 dark:border-white/10 text-xs font-medium text-ink-muted">
                                    <th className="text-start px-5 py-2.5 font-medium">Name</th>
                                    <th className="text-start px-3 py-2.5 font-medium">Type</th>
                                    <th className="text-start px-3 py-2.5 font-medium hidden sm:table-cell">Project</th>
                                    <th className="text-start px-3 py-2.5 font-medium hidden md:table-cell">When</th>
                                    <th className="text-end px-5 py-2.5 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5 dark:divide-white/5">
                                {recentInquiries.map(inq => (
                                    <tr key={inq.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="font-medium text-ink">{inq.name}</div>
                                            <div className="text-xs text-ink-muted">{inq.email}</div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="capitalize text-ink-muted">{TYPE_LABELS[inq.request_type] ?? inq.request_type}</span>
                                        </td>
                                        <td className="px-3 py-3 hidden sm:table-cell text-ink-muted">
                                            {inq.project?.title_en ?? '—'}
                                        </td>
                                        <td className="px-3 py-3 hidden md:table-cell text-ink-muted whitespace-nowrap">
                                            {inq.created_at}
                                        </td>
                                        <td className="px-5 py-3 text-end">
                                            {inq.is_read ? (
                                                <span className="text-xs text-ink-muted">Read</span>
                                            ) : (
                                                <span className="inline-block w-2 h-2 rounded-full bg-primary" title="Unread" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
        </AdminLayout>
    );
}
