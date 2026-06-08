import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Trash2, AlignLeft, Tag, Clock } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton as ConfirmButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';
import type { ProjectTrashProps, ProjectListItem, ProjectCategory } from '@/types/admin/project';

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
    under_development:      'Under Development',
    ready:                  'Ready',
    investment_opportunity: 'Investment Opportunity',
};


export default function ProjectsTrash() {
    const { projects } = usePage<ProjectTrashProps>().props;

    function restore(id: number) {
        router.post(`/admin/projects/${id}/restore`, {}, { preserveScroll: true });
    }

    function forceDelete(id: number) {
        router.delete(`/admin/projects/${id}/force`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Trash — Projects">
            <Head title="Projects Trash" />

            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/admin/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                >
                    <ArrowLeft size={15} />
                    Back to Projects
                </Link>
                <span className="text-ink/20">|</span>
                <span className="text-sm text-ink-muted">{projects.total} trashed project{projects.total !== 1 ? 's' : ''}</span>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-ink/5 dark:border-white/10 rounded-lg overflow-hidden">
                {projects.data.length === 0 ? (
                    <div className="py-16 text-center text-ink-muted text-sm">
                        Trash is empty.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-surface-muted border-b border-ink/5">
                            <tr>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><AlignLeft size={12} />Title</span>
                                </th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><Tag size={12} />Category</span>
                                </th>
                                <th className="text-start px-4 py-3 font-medium text-ink-muted">
                                    <span className="inline-flex items-center gap-1.5"><Clock size={12} />Deleted</span>
                                </th>
                                <th className="text-end px-4 py-3 font-medium text-ink-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {projects.data.map((project: ProjectListItem) => (
                                <tr key={project.id} className="hover:bg-surface-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-ink">{project.title_en}</div>
                                        <div className="text-ink-muted text-xs mt-0.5">{project.title_ar}</div>
                                    </td>

                                    <td className="px-4 py-3">
                                        <span className="text-xs text-ink-muted">
                                            {CATEGORY_LABELS[project.category]}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-xs text-ink-muted">
                                        {new Date(project.updated_at).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => restore(project.id)}
                                                className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                                                title="Restore"
                                            >
                                                <RotateCcw size={14} />
                                                Restore
                                            </button>
                                            <ConfirmButton
                                                onConfirm={() => forceDelete(project.id)}
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-red-500 transition-colors',
                                                )}
                                                heading="Delete forever?"
                                                actionLabel="Delete forever"
                                                itemLabel={project.title_en}
                                                description="This project and its images will be permanently deleted and cannot be restored."
                                            >
                                                <Trash2 size={14} />
                                                Delete forever
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
