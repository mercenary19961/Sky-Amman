import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Search, Archive, AlignLeft, Tag, Activity, ToggleRight, Image as ImageIcon, MessageSquare, LayoutGrid, List } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton as ConfirmButton } from '@/Components/Admin/ConfirmDeleteButton';
import { Select } from '@/Components/Admin/Select';
import { cn } from '@/lib/cn';
import type { ProjectIndexProps, ProjectListItem, ProjectCategory, ProjectListingStatus } from '@/types/admin/project';

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
    under_development:    'Under Development',
    ready:                'Ready',
    investment_opportunity: 'Investment Opportunity',
};

const CATEGORY_COLORS: Record<ProjectCategory, string> = {
    under_development:    'bg-primary/10 text-primary',
    ready:                'bg-emerald-100 text-emerald-700',
    investment_opportunity: 'bg-amber-100 text-amber-700',
};

const STATUS_LABELS: Record<ProjectListingStatus, string> = {
    for_sale:  'For Sale',
    for_rent:  'For Rent',
    sold:      'Sold',
    reserved:  'Reserved',
};

const STATUS_COLORS: Record<ProjectListingStatus, string> = {
    for_sale:  'bg-emerald-100 text-emerald-700',
    for_rent:  'bg-primary/10 text-primary',
    sold:      'bg-ink/10 text-ink-muted',
    reserved:  'bg-orange-100 text-orange-700',
};

function Badge({ label, color }: { label: string; color: string }) {
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', color)}>
            {label}
        </span>
    );
}

/** Empty-image placeholder icon, sized by the wrapper. */
function ImgPlaceholder({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-center text-ink-muted', className)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
            </svg>
        </div>
    );
}

type ViewMode = 'card' | 'list';
const VIEW_KEY = 'admin:projects:view';

export default function ProjectsIndex() {
    const { projects, filters, trashedCount } = usePage<ProjectIndexProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    // Card grid is the default; the choice persists across visits. Initial render
    // is 'card' on both server and client, then we sync to the saved preference.
    const [view, setView] = useState<ViewMode>('card');
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem(VIEW_KEY);
        if (saved === 'card' || saved === 'list') setView(saved);
    }, []);
    function changeView(v: ViewMode) {
        setView(v);
        if (typeof window !== 'undefined') localStorage.setItem(VIEW_KEY, v);
    }

    function applyFilter(key: string, value: string) {
        router.get('/admin/projects', { ...filters, [key]: value || undefined, page: undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter('search', search);
    }

    function deleteProject(id: number) {
        router.delete(`/admin/projects/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Projects">
            <Head title="Projects" />

            {/* Top bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <Link
                    href="/admin/projects/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-zinc-900 rounded text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                    <Plus size={16} />
                    Add Project
                </Link>

                {/* Search */}
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title…"
                            className="pl-8 pr-3 py-2 text-sm border border-ink/10 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-zinc-800 dark:text-zinc-100"
                        />
                    </div>
                    <button type="submit" className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 dark:text-zinc-100 border border-ink/10 rounded hover:bg-surface-muted transition-colors">
                        Search
                    </button>
                </form>

                {/* Category filter */}
                <Select
                    className="w-52"
                    value={filters.category ?? ''}
                    onChange={(v) => applyFilter('category', v)}
                    options={[
                        { value: '', label: 'All Categories' },
                        { value: 'under_development', label: 'Under Development' },
                        { value: 'ready', label: 'Ready' },
                        { value: 'investment_opportunity', label: 'Investment Opportunity' },
                    ]}
                />

                {/* Status filter */}
                <Select
                    className="w-40"
                    value={filters.listing_status ?? ''}
                    onChange={(v) => applyFilter('listing_status', v)}
                    options={[
                        { value: '', label: 'All Statuses' },
                        { value: 'for_sale', label: 'For Sale' },
                        { value: 'for_rent', label: 'For Rent' },
                        { value: 'sold', label: 'Sold' },
                        { value: 'reserved', label: 'Reserved' },
                    ]}
                />

                {/* Active filter */}
                <Select
                    className="w-44"
                    value={filters.active ?? ''}
                    onChange={(v) => applyFilter('active', v)}
                    options={[
                        { value: '', label: 'Active & Inactive' },
                        { value: '1', label: 'Active only' },
                        { value: '0', label: 'Inactive only' },
                    ]}
                />

                {/* View toggle — card (default) vs. table. */}
                <div className="ms-auto inline-flex items-center rounded-md border border-ink/10 dark:border-white/10 bg-white dark:bg-zinc-800 p-0.5">
                    <button
                        type="button"
                        onClick={() => changeView('card')}
                        title="Card view"
                        aria-pressed={view === 'card'}
                        className={cn(
                            'inline-flex items-center justify-center rounded p-1.5 transition-colors',
                            view === 'card' ? 'bg-primary text-zinc-900' : 'text-ink-muted hover:text-ink',
                        )}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => changeView('list')}
                        title="List view"
                        aria-pressed={view === 'list'}
                        className={cn(
                            'inline-flex items-center justify-center rounded p-1.5 transition-colors',
                            view === 'list' ? 'bg-primary text-zinc-900' : 'text-ink-muted hover:text-ink',
                        )}
                    >
                        <List size={16} />
                    </button>
                </div>

                {trashedCount > 0 && (
                    <Link
                        href="/admin/projects/trash"
                        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                    >
                        <Archive size={15} />
                        Trash ({trashedCount})
                    </Link>
                )}
            </div>

            {projects.data.length === 0 ? (
                <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg py-16 text-center text-ink-muted text-sm">
                    No projects found.{' '}
                    <Link href="/admin/projects/create" className="text-primary hover:underline">
                        Add the first one.
                    </Link>
                </div>
            ) : view === 'card' ? (
                /* Card grid (default) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {projects.data.map((project: ProjectListItem) => (
                        <ProjectCard key={project.id} project={project} onDelete={() => deleteProject(project.id)} />
                    ))}
                </div>
            ) : (
                /* Table view */
                <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-surface-muted border-b border-ink/5">
                            <tr>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted w-12"></th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><AlignLeft size={12} />Title</span>
                                </th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><Tag size={12} />Category</span>
                                </th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><Activity size={12} />Status</span>
                                </th>
                                <th className="text-center px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><ToggleRight size={12} />Active</span>
                                </th>
                                <th className="text-center px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><ImageIcon size={12} />Images</span>
                                </th>
                                <th className="text-center px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><MessageSquare size={12} />Inquiries</span>
                                </th>
                                <th className="text-end px-4 py-3 font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {projects.data.map((project: ProjectListItem) => (
                                <tr key={project.id} className="hover:bg-surface-muted/50 transition-colors">
                                    {/* Thumbnail */}
                                    <td className="px-4 py-3">
                                        {project.featured_image ? (
                                            <img
                                                src={project.featured_image.url}
                                                alt=""
                                                className="w-10 h-10 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-surface-muted flex items-center justify-center text-ink-muted">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="9" cy="9" r="2" />
                                                    <path d="m21 15-5-5L5 21" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>

                                    {/* Title */}
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{project.title_en}</div>
                                        <div className="text-ink-muted text-xs mt-0.5">{project.title_ar}</div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-3">
                                        <Badge
                                            label={CATEGORY_LABELS[project.category]}
                                            color={CATEGORY_COLORS[project.category]}
                                        />
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        {project.listing_status ? (
                                            <Badge
                                                label={STATUS_LABELS[project.listing_status]}
                                                color={STATUS_COLORS[project.listing_status]}
                                            />
                                        ) : (
                                            <span className="text-ink-muted text-xs">—</span>
                                        )}
                                    </td>

                                    {/* Active */}
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            'inline-block w-2 h-2 rounded-full',
                                            project.is_active ? 'bg-emerald-500' : 'bg-ink/20',
                                        )} />
                                    </td>

                                    {/* Images count */}
                                    <td className="px-4 py-3 text-center text-ink-muted">
                                        {project.images_count}
                                    </td>

                                    {/* Inquiries count */}
                                    <td className="px-4 py-3 text-center text-ink-muted">
                                        {project.inquiries_count}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link
                                                href={`/admin/projects/${project.id}/edit`}
                                                className="text-ink-muted hover:text-primary transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={15} />
                                            </Link>
                                            <ConfirmButton
                                                onConfirm={() => deleteProject(project.id)}
                                                className="text-ink-muted hover:text-red-500 transition-colors"
                                                title="Delete"
                                                heading="Move project to trash?"
                                                actionLabel="Delete"
                                                itemLabel={project.title_en}
                                                description="The project will be moved to Trash. You can restore it from there."
                                            >
                                                <Trash2 size={15} />
                                            </ConfirmButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {projects.last_page > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
                    <span>
                        Showing {projects.from}–{projects.to} of {projects.total}
                    </span>
                    <div className="flex items-center gap-1">
                        {projects.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={cn(
                                        'px-3 py-1.5 rounded border text-xs transition-colors',
                                        link.active
                                            ? 'bg-primary text-zinc-900 border-primary'
                                            : 'bg-white dark:bg-zinc-800 border-ink/10 dark:border-white/10 hover:bg-surface-muted',
                                    )}
                                />
                            ) : (
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-3 py-1.5 rounded border text-xs bg-white dark:bg-zinc-800 border-ink/10 dark:border-white/10 text-ink/30 cursor-default"
                                />
                            )
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function ProjectCard({ project, onDelete }: { project: ProjectListItem; onDelete: () => void }) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-ink/5 dark:border-white/10 bg-white dark:bg-zinc-800 transition-all hover:shadow-md">
            {/* Cover */}
            <div className="relative aspect-video bg-surface-muted">
                {project.featured_image ? (
                    <img src={project.featured_image.url} alt="" className="h-full w-full object-cover" />
                ) : (
                    <ImgPlaceholder className="h-full w-full" />
                )}

                {/* Listing status — top start */}
                {project.listing_status && (
                    <span className="absolute top-2 inset-s-2">
                        <Badge label={STATUS_LABELS[project.listing_status]} color={cn(STATUS_COLORS[project.listing_status], 'shadow-sm')} />
                    </span>
                )}

                {/* Active state — top end */}
                <span className="absolute top-2 inset-e-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-ink shadow-sm">
                    <span className={cn('w-1.5 h-1.5 rounded-full', project.is_active ? 'bg-emerald-500' : 'bg-ink/30')} />
                    {project.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-3">
                <div className="font-semibold text-ink truncate">{project.title_en}</div>
                <div className="mt-0.5 truncate text-xs text-ink-muted" dir="rtl">{project.title_ar}</div>

                <div className="mt-2">
                    <Badge label={CATEGORY_LABELS[project.category]} color={CATEGORY_COLORS[project.category]} />
                </div>

                {/* Footer: counts + actions */}
                <div className="mt-3 flex items-center justify-between border-t border-ink/5 dark:border-white/10 pt-2.5 text-xs text-ink-muted">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1" title="Images">
                            <ImageIcon size={13} />{project.images_count}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Inquiries">
                            <MessageSquare size={13} />{project.inquiries_count}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="text-ink-muted hover:text-primary transition-colors"
                            title="Edit"
                        >
                            <Pencil size={15} />
                        </Link>
                        <ConfirmButton
                            onConfirm={onDelete}
                            className="text-ink-muted hover:text-red-500 transition-colors"
                            title="Delete"
                            heading="Move project to trash?"
                            actionLabel="Delete"
                            itemLabel={project.title_en}
                            description="The project will be moved to Trash. You can restore it from there."
                        >
                            <Trash2 size={15} />
                        </ConfirmButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
