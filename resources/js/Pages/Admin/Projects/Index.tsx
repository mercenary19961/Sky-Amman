import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, Pencil, Search, Archive, AlignLeft, Tag, Activity, ToggleRight, Image as ImageIcon, MessageSquare } from 'lucide-react';
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


export default function ProjectsIndex() {
    const { projects, filters, trashedCount } = usePage<ProjectIndexProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');

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

                {trashedCount > 0 && (
                    <Link
                        href="/admin/projects/trash"
                        className="ms-auto inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                    >
                        <Archive size={15} />
                        Trash ({trashedCount})
                    </Link>
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                {projects.data.length === 0 ? (
                    <div className="py-16 text-center text-ink-muted text-sm">
                        No projects found.{' '}
                        <Link href="/admin/projects/create" className="text-primary hover:underline">
                            Add the first one.
                        </Link>
                    </div>
                ) : (
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
                )}
            </div>

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
