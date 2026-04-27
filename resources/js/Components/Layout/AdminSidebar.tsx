import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    Image as ImageIcon,
    Building2,
    MessageSquare,
    Settings as SettingsIcon,
    Users as UsersIcon,
    History,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PageProps } from '@/types';

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Overview',
        items: [{ label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> }],
    },
    {
        label: 'Content',
        items: [
            { label: 'Site Content', path: '/admin/content', icon: <FileText size={18} /> },
            { label: 'Media Library', path: '/admin/media', icon: <ImageIcon size={18} /> },
        ],
    },
    {
        label: 'Business',
        items: [{ label: 'Projects', path: '/admin/projects', icon: <Building2 size={18} /> }],
    },
    {
        label: 'Communication',
        items: [
            { label: 'Contact Submissions', path: '/admin/contacts', icon: <MessageSquare size={18} /> },
        ],
    },
    {
        label: 'System',
        items: [
            { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon size={18} />, adminOnly: true },
            { label: 'Users', path: '/admin/users', icon: <UsersIcon size={18} />, adminOnly: true },
            { label: 'Change Log', path: '/admin/change-log', icon: <History size={18} />, adminOnly: true },
        ],
    },
];

export function AdminSidebar() {
    const { auth } = usePage<PageProps>().props;
    const currentUrl = usePage<PageProps>().url;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <aside className="w-64 shrink-0 bg-white border-e border-ink/5 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-ink/5">
                <span className="font-bold text-primary tracking-wide">SKY AMMAN</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {NAV_GROUPS.map((group) => {
                    const visible = group.items.filter((i) => !i.adminOnly || isAdmin);
                    if (visible.length === 0) return null;
                    return (
                        <div key={group.label}>
                            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                                {group.label}
                            </div>
                            <ul className="space-y-1">
                                {visible.map((item) => {
                                    const active = currentUrl === item.path || (item.path !== '/admin' && currentUrl.startsWith(item.path));
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                href={item.path}
                                                className={cn(
                                                    'flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
                                                    active
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-ink-muted hover:bg-ink/5 hover:text-ink',
                                                )}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-ink/5 text-xs text-ink-muted">
                <div className="font-medium text-ink truncate">{auth.user?.name}</div>
                <div className="truncate">{auth.user?.email}</div>
            </div>
        </aside>
    );
}
