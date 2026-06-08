import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { ImagePlus, RotateCcw } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ConfirmDeleteButton } from '@/Components/Admin/ConfirmDeleteButton';
import { cn } from '@/lib/cn';

interface Slot {
    key: string;
    label: string;
    group: string;
    default: string;
    current: string | null; // null = using the committed default
}

interface PageImagesProps {
    slots: Slot[];
    [key: string]: unknown;
}

export default function PageImagesIndex() {
    const { slots } = usePage<PageImagesProps>().props;

    // Group slots by their page (e.g. "About Us").
    const groups = slots.reduce<Record<string, Slot[]>>((acc, s) => {
        (acc[s.group] ??= []).push(s);
        return acc;
    }, {});

    return (
        <AdminLayout title="Page Images">
            <Head title="Page Images" />

            <div className="max-w-5xl">
                <p className="mb-6 max-w-2xl text-sm text-ink-muted">
                    Replace specific decorative images used across the site. Upload a new image to override the built-in
                    one, or reset a slot back to the default. Square images work best for the small slots.
                </p>

                {Object.entries(groups).map(([group, items]) => (
                    <div key={group} className="mb-8">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">{group}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((slot) => (
                                <SlotCard key={slot.key} slot={slot} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

function SlotCard({ slot }: { slot: Slot }) {
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const src = slot.current ?? slot.default;
    const overridden = slot.current !== null;

    const upload = (file: File | null) => {
        if (!file || processing) return;
        setProcessing(true);
        router.post(`/admin/page-images/${slot.key}`, { image: file }, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                setProcessing(false);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    const reset = () =>
        router.delete(`/admin/page-images/${slot.key}`, { preserveScroll: true });

    return (
        <div className="rounded-lg border border-ink/5 dark:border-white/10 bg-white dark:bg-zinc-800 overflow-hidden">
            <div className="relative aspect-square bg-surface-muted">
                <img src={src} alt={slot.label} className="h-full w-full object-cover" />
                <span
                    className={cn(
                        'absolute top-2 inset-s-2 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm',
                        overridden ? 'bg-emerald-500 text-white' : 'bg-white/90 text-zinc-700',
                    )}
                >
                    {overridden ? 'Custom' : 'Default'}
                </span>
            </div>

            <div className="p-3">
                <div className="text-sm font-medium text-ink dark:text-zinc-100">{slot.label}</div>

                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary-strong px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-strong-hover transition-colors disabled:opacity-50"
                    >
                        <ImagePlus size={15} /> {processing ? 'Uploading…' : 'Replace'}
                    </button>

                    {overridden && (
                        <ConfirmDeleteButton
                            onConfirm={reset}
                            className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 dark:border-white/15 px-3 py-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
                            title="Reset to default"
                            heading="Reset this image?"
                            actionLabel="Reset"
                            confirmWord="reset"
                            itemLabel={slot.label}
                            description="The uploaded image will be removed and the built-in default restored."
                        >
                            <RotateCcw size={14} /> Reset
                        </ConfirmDeleteButton>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => upload(e.target.files?.[0] ?? null)}
                    />
                </div>
            </div>
        </div>
    );
}
