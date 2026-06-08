import { Link, usePage } from '@inertiajs/react';
import {
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
    GalleryThumbnails,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PageProps } from '@/types';

interface AdminSidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onToggle: () => void;
    onMobileClose: () => void;
}

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    built?: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} />, built: true },
        ],
    },
    {
        label: 'Content',
        items: [
            { label: 'Site Content', path: '/admin/content', icon: <FileText size={18} />, built: true },
            { label: 'Testimonial Videos', path: '/admin/testimonial-videos', icon: <Video size={18} />, built: true },
            { label: 'Testimonials', path: '/admin/testimonials', icon: <Quote size={18} />, built: true },
            { label: 'Head of Departments', path: '/admin/department-members', icon: <Contact size={18} />, built: true },
            { label: 'Page Images', path: '/admin/page-images', icon: <Images size={18} />, built: true },
            { label: 'Projects Gallery', path: '/admin/gallery', icon: <GalleryThumbnails size={18} />, built: true },
        ],
    },
    {
        label: 'Business',
        items: [
            { label: 'Projects', path: '/admin/projects', icon: <Building2 size={18} />, built: true },
        ],
    },
    {
        label: 'Communication',
        items: [
            { label: 'Contact Submissions', path: '/admin/contacts', icon: <MessageSquare size={18} />, built: true },
        ],
    },
    {
        label: 'System',
        items: [
            { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={18} />, adminOnly: true, built: true },
            { label: 'Users', path: '/admin/users', icon: <UsersIcon size={18} />, adminOnly: true, built: true },
            { label: 'Change Log', path: '/admin/change-log', icon: <History size={18} />, adminOnly: true, built: true },
        ],
    },
];

export function AdminSidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: AdminSidebarProps) {
    const { auth } = usePage<PageProps>().props;
    const currentUrl = usePage<PageProps>().url;
    const isAdmin = auth.user?.role === 'admin';

    // Mobile always shows full labels when open. Desktop respects `collapsed`.
    const showLabels = mobileOpen || !collapsed;

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 bg-white dark:bg-zinc-800 border-e border-ink/5 dark:border-white/10 transition-all duration-300 flex flex-col overflow-x-hidden w-64',
                    collapsed ? 'lg:w-16' : 'lg:w-64',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0',
                )}
            >
                <div
                    className={cn(
                        'h-16 flex items-center border-b border-ink/5 dark:border-white/10',
                        showLabels ? 'px-4' : 'px-2',
                    )}
                >
                    {showLabels && (
                        <span className="font-bold text-primary tracking-wide truncate">SKY AMMAN</span>
                    )}
                    <button
                        type="button"
                        onClick={onToggle}
                        className={cn(
                            'hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink-muted',
                            collapsed ? 'mx-auto' : 'ml-auto',
                        )}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="lg:hidden ml-auto inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 transition-colors text-ink-muted"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    {NAV_GROUPS.map((group) => {
                        const visible = group.items.filter((i) => !i.adminOnly || isAdmin);
                        if (visible.length === 0) return null;
                        return (
                            <div key={group.label}>
                                {showLabels && (
                                    <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                                        {group.label}
                                    </div>
                                )}
                                <ul className="space-y-1">
                                    {visible.map((item) => {
                                        if (!item.built) {
                                            return (
                                                <li key={item.path}>
                                                    <span
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-2 rounded text-sm text-ink-muted/50 cursor-default select-none',
                                                            !showLabels && 'justify-center',
                                                        )}
                                                        title={!showLabels ? item.label : undefined}
                                                    >
                                                        <span className="opacity-50 shrink-0">{item.icon}</span>
                                                        {showLabels && (
                                                            <>
                                                                <span className="flex-1">{item.label}</span>
                                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-ink/10 dark:bg-white/10 text-ink-muted">
                                                                    Soon
                                                                </span>
                                                            </>
                                                        )}
                                                    </span>
                                                </li>
                                            );
                                        }

                                        const active =
                                            currentUrl === item.path ||
                                            (item.path !== '/admin' && currentUrl.startsWith(item.path));

                                        return (
                                            <li key={item.path}>
                                                <Link
                                                    href={item.path}
                                                    onClick={onMobileClose}
                                                    className={cn(
                                                        'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                                                        active
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-ink-muted hover:bg-ink/5 dark:hover:bg-white/5 hover:text-ink',
                                                        !showLabels && 'justify-center',
                                                    )}
                                                    title={!showLabels ? item.label : undefined}
                                                >
                                                    <span className="shrink-0">{item.icon}</span>
                                                    {showLabels && <span>{item.label}</span>}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </nav>

                {showLabels && (
                    <div className="px-4 py-4 border-t border-ink/5 dark:border-white/10 text-xs text-ink-muted">
                        <div className="font-medium text-ink truncate">{auth.user?.name}</div>
                        <div className="truncate">{auth.user?.email}</div>
                    </div>
                )}
            </aside>
        </>
    );
}
