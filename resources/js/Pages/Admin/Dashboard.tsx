import { Head, Link, router, usePage } from '@inertiajs/react';
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
import type { DashboardPageProps, ContentHealthItem, DailyInquiry } from '@/types/admin/dashboard';

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
    facebook_url: 'Meta (Facebook)',
    twitter_url: 'X (Twitter)',
    youtube_url: 'YouTube',
    tiktok_url: 'TikTok',
};

const IG_CRED_LABELS: Record<string, string> = {
    instagram_access_token: 'Instagram Access Token',
    instagram_user_id: 'Instagram User ID',
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

/** SEO-gap list: each row shows the record name + which fields are empty, with a
 *  Fix link. `to(item)` builds the deep-link target (project edit vs. content page). */
function SeoHealthList<T extends { title_en: string; missing: string[] }>(
    { items, to }: { items: T[]; to: (item: T) => string },
) {
    if (items.length === 0) return null;
    return (
        <ul className="space-y-1">
            {items.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1">
                        <span className="text-sm text-ink truncate">{item.title_en}</span>
                        <span className="block text-[11px] text-ink-muted truncate">missing: {item.missing.join(', ')}</span>
                    </span>
                    <Link href={to(item)} className="shrink-0 text-[11px] text-primary hover:underline flex items-center gap-0.5">
                        Fix <ExternalLink size={10} />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

// ── Daily-inquiries bar chart ─────────────────────────────────────────────────

/**
 * Plain-CSS bar chart, same approach as the Cookie Consent "Decisions per day"
 * trend — no charting library (dropped recharts, which was 338kB for this one
 * graph). Each bar reveals its date + count on hover; first/last dates anchor
 * the 30-day range.
 */
const CHART_H = 176;

function InquiriesTrend({ data }: { data: DailyInquiry[] }) {
    const peak = Math.max(1, ...data.map((d) => d.count));

    return (
        <div>
            <div className="flex items-end gap-px" style={{ height: CHART_H }} role="img" aria-label="Daily inquiries, last 30 days">
                {data.map((d) => (
                    <div key={d.date} className="group relative flex-1">
                        <div
                            className="w-full rounded-t-sm bg-primary/30 group-hover:bg-primary transition-colors"
                            style={{ height: `${Math.max(2, (d.count / peak) * CHART_H)}px` }}
                        />
                        <span className="pointer-events-none absolute bottom-full inset-s-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block dark:bg-zinc-900">
                            {formatDateLabel(d.date)}: {d.count} {d.count === 1 ? 'inquiry' : 'inquiries'}
                        </span>
                    </div>
                ))}
            </div>
            {data.length > 0 && (
                <div className="mt-1.5 flex justify-between text-[10px] text-ink-muted">
                    <span>{formatDateLabel(data[0].date)}</span>
                    <span>{formatDateLabel(data[data.length - 1].date)}</span>
                </div>
            )}
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
        contentHealth.pagesMissingSeo.length +
        contentHealth.projectsMissingSeo.length +
        contentHealth.projectsMissingOg.length +
        contentHealth.emptySocialKeys.length +
        contentHealth.missingInstagramCreds.length +
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
                        <InquiriesTrend data={dailyInquiries} />
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

                            {/* Pages — incomplete SEO */}
                            {contentHealth.pagesMissingSeo.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <Search size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Pages · Incomplete SEO</span>
                                    </div>
                                    <SeoHealthList
                                        items={contentHealth.pagesMissingSeo}
                                        to={(p) => `/admin/content#${p.slug}`}
                                    />
                                </div>
                            )}

                            {/* Projects — incomplete SEO */}
                            {contentHealth.projectsMissingSeo.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <Search size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Projects · Incomplete SEO</span>
                                    </div>
                                    <SeoHealthList
                                        items={contentHealth.projectsMissingSeo}
                                        to={(p) => `/admin/projects/${p.id}/edit#section-seo`}
                                    />
                                </div>
                            )}

                            {/* Projects — no OG image */}
                            {contentHealth.projectsMissingOg.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <ImageIcon size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Projects · No OG Image</span>
                                    </div>
                                    <HealthItem
                                        items={contentHealth.projectsMissingOg}
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

                            {/* Missing Instagram Graph API credentials → Media Room IG grid silently hides */}
                            {contentHealth.missingInstagramCreds.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-2">
                                        <AlertTriangle size={13} />
                                        <span className="text-xs font-semibold uppercase tracking-wide">Media Room IG Grid Disabled</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {contentHealth.missingInstagramCreds.map(key => (
                                            <Link
                                                key={key}
                                                href="/admin/settings#section-media_room"
                                                className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-ink-muted hover:text-primary transition-colors"
                                            >
                                                {IG_CRED_LABELS[key] ?? key}
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
                                    <tr
                                        key={inq.id}
                                        onClick={() => router.visit(`/admin/contacts/${inq.id}`)}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                                    >
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
