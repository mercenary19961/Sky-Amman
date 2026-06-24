import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, GripVertical, X, User as UserIcon, ImagePlus } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/cn';

interface MemberItem {
    id: number;
    name_en: string | null;
    name_ar: string | null;
    role_en: string | null;
    role_ar: string | null;
    sort_order: number;
    is_active: boolean;
    image_url: string | null;
}

interface DepartmentsProps {
    members: MemberItem[];
    [key: string]: unknown;
}

type EditingState = MemberItem | 'new' | null;

// Keep in sync with DepartmentMemberController::validateData.
const NAME_MAX = 120;
const ROLE_MAX = 120;

/** Group heading above a pair of EN/AR fields (e.g. "Name", "Role"). */
function GroupLabel({ label }: { label: string }) {
    return (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink dark:text-zinc-100">
            {label} <span className="text-red-500">*</span>
            <span className="font-normal text-[11px] text-ink-muted">— at least one language</span>
        </div>
    );
}

/** Field label with a live "used / max" counter that warns as it fills up. */
function LabelWithCount({ label, value, max }: { label: string; value: string; max: number }) {
    const len = value.length;
    return (
        <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-medium text-ink-muted">{label}</label>
            <span
                className={cn(
                    'text-[11px] tabular-nums',
                    len >= max ? 'text-red-500 font-medium' : len >= max * 0.85 ? 'text-amber-500' : 'text-ink-muted',
                )}
            >
                {len}/{max}
            </span>
        </div>
    );
}

export default function DepartmentsIndex() {
    const { members } = usePage<DepartmentsProps>().props;

    const [items, setItems] = useState<MemberItem[]>(members);
    useEffect(() => setItems(members), [members]);

    const [editing, setEditing] = useState<EditingState>(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((v) => v.id === active.id);
        const newIndex = items.findIndex((v) => v.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        router.post(
            '/admin/department-members/reorder',
            { ids: reordered.map((v) => v.id) },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <AdminLayout title="Head of Departments">
            <Head title="Head of Departments" />

            <div className="max-w-5xl">
                <div className="mb-6">
                    <p className="text-sm text-ink-muted max-w-xl">
                        The team members shown in the homepage "Head of Departments" section. Each has a photo and a
                        bilingual name + role. Drag the handle to reorder.
                        <span className="block mt-1 text-ink-muted">
                            {items.length} member{items.length !== 1 ? 's' : ''}
                        </span>
                    </p>
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-ink-muted">No team members found.</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={items.map((v) => v.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((m) => (
                                    <SortableCard
                                        key={m.id}
                                        item={m}
                                        onEdit={() => setEditing(m)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <FormDrawer editing={editing} onClose={() => setEditing(null)} />
        </AdminLayout>
    );
}

function Avatar({ url, name, className }: { url: string | null; name: string; className?: string }) {
    if (url) {
        return <img src={url} alt={name} draggable={false} className={cn('object-cover', className)} />;
    }
    return (
        <div className={cn('grid place-items-center bg-primary/15 text-primary', className)}>
            <UserIcon size={22} />
        </div>
    );
}

function SortableCard({
    item,
    onEdit,
}: {
    item: MemberItem;
    onEdit: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const name = item.name_en || item.name_ar || 'Unnamed';
    const role = item.role_en || item.role_ar || '';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative rounded-lg overflow-hidden border bg-white dark:bg-zinc-800 transition-all',
                'border-ink/5 dark:border-white/10',
                isDragging && 'opacity-60 scale-95 z-10',
            )}
        >
            <div className="p-4 flex items-start gap-3">
                <Avatar url={item.image_url} name={name} className="h-14 w-14 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-ink dark:text-zinc-100">{name}</div>
                    <p className="mt-0.5 text-xs text-primary truncate">{role}</p>
                </div>

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                    className="p-1 rounded text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5"
                >
                    <GripVertical size={14} />
                </button>
            </div>

            <div className="px-4 pb-3 flex items-center justify-end border-t border-ink/5 dark:border-white/10 pt-2.5">
                <button
                    type="button"
                    onClick={onEdit}
                    title="Edit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors"
                >
                    <Pencil size={14} /> Edit
                </button>
            </div>
        </div>
    );
}

function FormDrawer({ editing, onClose }: { editing: EditingState; onClose: () => void }) {
    const open = editing !== null;
    const isNew = editing === 'new';
    const item = editing && editing !== 'new' ? editing : null;

    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [roleEn, setRoleEn] = useState('');
    const [roleAr, setRoleAr] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const baseline = useRef(''); // snapshot of the text fields at open, for the dirty check

    useEffect(() => {
        setNameEn(item?.name_en ?? '');
        setNameAr(item?.name_ar ?? '');
        setRoleEn(item?.role_en ?? '');
        setRoleAr(item?.role_ar ?? '');
        setFile(null);
        setPreview(item?.image_url ?? null);
        baseline.current = JSON.stringify([item?.name_en ?? '', item?.name_ar ?? '', item?.role_en ?? '', item?.role_ar ?? '']);
        if (fileRef.current) fileRef.current.value = '';
    }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

    const onPickFile = (f: File | null) => {
        setFile(f);
        setPreview(f ? URL.createObjectURL(f) : item?.image_url ?? null);
    };

    const hasName = nameEn.trim() !== '' || nameAr.trim() !== '';
    const hasRole = roleEn.trim() !== '' || roleAr.trim() !== '';
    const hasPhoto = file !== null || preview !== null;
    // Photo is optional for new members and for the current photo-less ones, but a
    // member that ALREADY has a photo must keep one (there's no remove path, so
    // this is really just signposting the rule).
    const photoRequired = !isNew && !!item?.image_url;
    // Only enable once something changed since the drawer opened (text edited or a new photo picked).
    const isDirty = file !== null || JSON.stringify([nameEn, nameAr, roleEn, roleAr]) !== baseline.current;
    const canSubmit = hasName && hasRole && (!photoRequired || hasPhoto) && isDirty && !processing;

    const missing = [
        !hasName && 'a name',
        !hasRole && 'a role',
        photoRequired && !hasPhoto && 'a photo',
    ].filter(Boolean) as string[];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setProcessing(true);

        const data: Record<string, string | File> = {
            name_en: nameEn,
            name_ar: nameAr,
            role_en: roleEn,
            role_ar: roleAr,
        };
        if (file) data.image = file;

        const opts = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        };

        if (isNew) {
            router.post('/admin/department-members', data, opts);
        } else if (item) {
            router.post(`/admin/department-members/${item.id}`, { ...data, _method: 'put' }, opts);
        }
    };

    const inputCls =
        'w-full rounded-md border border-ink/15 dark:border-white/15 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40';

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-zinc-800 border-s border-ink/5 dark:border-white/10 shadow-xl flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                    >
                        <div className="h-16 flex items-center justify-between px-5 border-b border-ink/5 dark:border-white/10">
                            <h2 className="font-semibold text-ink dark:text-zinc-100">
                                {isNew ? 'Add team member' : 'Edit team member'}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1.5 rounded text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Photo — optional for new/photo-less members, required once a member has one */}
                            <div>
                                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                                    Photo {photoRequired && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        url={preview}
                                        name={nameEn || 'Member'}
                                        className="h-20 w-20 shrink-0 rounded-full border border-ink/10 dark:border-white/10"
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 dark:border-white/15 px-3 py-1.5 text-sm text-ink dark:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            <ImagePlus size={15} /> {preview ? 'Change photo' : 'Upload photo'}
                                        </button>
                                        <span className="text-[11px] text-ink-muted">JPG, PNG or WebP · max 10MB · optional</span>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                                    />
                                </div>
                            </div>

                            <div>
                                <GroupLabel label="Name" />
                                <div className="space-y-3">
                                    <div>
                                        <LabelWithCount label="English" value={nameEn} max={NAME_MAX} />
                                        <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} maxLength={NAME_MAX} autoFocus placeholder="e.g. Eng. Mahmoud Abu Sarhan" className={inputCls} />
                                    </div>
                                    <div>
                                        <LabelWithCount label="Arabic" value={nameAr} max={NAME_MAX} />
                                        <input type="text" value={nameAr} onChange={(e) => setNameAr(e.target.value)} maxLength={NAME_MAX} dir="rtl" placeholder="م. محمود أبو سرحان" className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <GroupLabel label="Role" />
                                <div className="space-y-3">
                                    <div>
                                        <LabelWithCount label="English" value={roleEn} max={ROLE_MAX} />
                                        <input type="text" value={roleEn} onChange={(e) => setRoleEn(e.target.value)} maxLength={ROLE_MAX} placeholder="e.g. Chief Executive Officer" className={inputCls} />
                                    </div>
                                    <div>
                                        <LabelWithCount label="Arabic" value={roleAr} max={ROLE_MAX} />
                                        <input type="text" value={roleAr} onChange={(e) => setRoleAr(e.target.value)} maxLength={ROLE_MAX} dir="rtl" placeholder="الرئيس التنفيذي" className={inputCls} />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-ink-muted">
                                If you fill only one language for a field, it&rsquo;s shown for both on the site. New
                                members appear on the homepage right away.
                            </p>

                            {missing.length > 0 && (
                                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                    Add {missing.join(', ')} to continue.
                                </p>
                            )}
                        </form>

                        <div className="p-5 border-t border-ink/5 dark:border-white/10 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm rounded-md text-ink-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={!canSubmit}
                                className="px-4 py-2 text-sm font-medium rounded-md bg-primary-strong text-white hover:bg-primary-strong-hover transition-colors disabled:opacity-50"
                            >
                                {isNew ? 'Add' : 'Save'}
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
