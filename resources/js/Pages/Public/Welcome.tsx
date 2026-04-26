import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <main className="min-h-screen flex items-center justify-center bg-white text-gray-900">
                <div className="text-center px-6">
                    <h1 className="text-4xl font-semibold mb-3">Sky Amman</h1>
                    <p className="text-gray-600">Foundation scaffolded. Pages coming soon.</p>
                </div>
            </main>
        </>
    );
}
