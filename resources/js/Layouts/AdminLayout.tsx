import { useState, useEffect, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    LogOut,
    LayoutDashboard,
    FileText,
    Building2,
    MessageSquare,
    Settings as SettingsIcon,
    Users as UsersIcon,
    History,
    Video,
    Quote,
    Contact,
    Images,
    Menu,
} from 'lucide-react';
import { AdminSidebar } from '@/Components/Layout/AdminSidebar';
import { UndoToast } from '@/Components/Admin/UndoToast';
import type { PageProps } from '@/types';

// Ordered longest-first so more-specific paths match before shorter prefixes.
const PAGE_ICONS: Array<[path: string, icon: React.ComponentType<{ size?: number }>, exact?: boolean]> = [
    ['/admin',           LayoutDashboard, true],
    ['/admin/testimonial-videos', Video],
    ['/admin/testimonials', Quote],
    ['/admin/department-members', Contact],
    ['/admin/page-images', Images],
    ['/admin/content',   FileText],
    ['/admin/projects',  Building2],
    ['/admin/contacts',  MessageSquare],
    ['/admin/settings',  SettingsIcon],
    ['/admin/users',     UsersIcon],
    ['/admin/change-log', History],
];

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

// Persist sidebar collapsed state across Inertia navigations
let globalSidebarCollapsed = false;

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { url } = usePage<PageProps>();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(globalSidebarCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggle = () => {
        const next = !sidebarCollapsed;
        setSidebarCollapsed(next);
        globalSidebarCollapsed = next;
        setMobileOpen(false);
    };

    const PageIcon = PAGE_ICONS.find(([path, , exact]) =>
        exact ? url === path : url.startsWith(path),
    )?.[1];

    const logout = () => { router.post('/admin/logout'); };

    return (
        <div className="dark min-h-screen bg-surface-muted text-ink" dir="ltr">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileOpen}
                onToggle={handleToggle}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div
                className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}
            >
                <header className="sticky top-0 z-20 h-16 bg-white dark:bg-zinc-800 border-b border-ink/5 dark:border-white/10 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink-muted"
                            title="Open menu"
                        >
                            <Menu size={20} />
                        </button>
                        {PageIcon && (
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <PageIcon size={16} />
                            </div>
                        )}
                        <h1 className="text-lg font-semibold truncate">{title}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors shrink-0"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Sign out</span>
                    </button>
                </header>
                <main className="p-6">{children}</main>
            </div>

            <UndoToast />
        </div>
    );
}
