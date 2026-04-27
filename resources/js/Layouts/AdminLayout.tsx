import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { AdminSidebar } from '@/Components/Layout/AdminSidebar';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const logout = () => {
        router.post('/admin/logout');
    };

    return (
        <div className="min-h-screen flex bg-surface-muted text-ink" dir="ltr">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-ink/5 flex items-center justify-between px-6">
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
