import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps } from '@/types';

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />
            <div className="bg-white border border-ink/5 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Welcome, {auth.user?.name}.</h2>
                <p className="text-ink-muted">
                    The admin panel will gain its content sections in upcoming work.
                    For now, the foundation is in place: auth, locale, settings,
                    site content, projects, and contact submissions are wired up.
                </p>
            </div>
        </AdminLayout>
    );
}
