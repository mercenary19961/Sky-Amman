import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { GalleryImage } from '@/types/home';

interface LightboxProps {
    images: GalleryImage[];
    index: number;
    onClose: () => void;
    onChange: (index: number) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

/**
 * Full-screen image viewer: zoom (wheel / buttons / double-click), pan when
 * zoomed, prev/next + keyboard, a thumbnail strip to jump between images, and
 * backdrop/Esc to close. Body scroll is locked while open.
 */
export function Lightbox({ images, index, onClose, onChange }: LightboxProps) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const drag = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
    const stageRef = useRef<HTMLDivElement>(null);

    const count = images.length;
    const current = images[index];

    const resetZoom = useCallback(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const go = useCallback(
        (dir: number) => onChange((index + dir + count) % count),
        [index, count, onChange],
    );

    // Reset zoom whenever the visible image changes.
    useEffect(() => resetZoom(), [index, resetZoom]);

    // Lock body scroll + wire keyboard controls while open.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight') go(1);
            else if (e.key === 'ArrowLeft') go(-1);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose, go]);

    // Wheel zoom — native non-passive listener so we can preventDefault.
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setScale((s) => {
                const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s - e.deltaY * 0.0025 * s));
                if (next <= 1) setOffset({ x: 0, y: 0 });
                return next;
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const zoomBy = (d: number) =>
        setScale((s) => {
            const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + d));
            if (next <= 1) setOffset({ x: 0, y: 0 });
            return next;
        });

    const onPointerDown = (e: React.PointerEvent) => {
        if (scale <= 1) return;
        drag.current = { active: true, startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.current.active) return;
        setOffset({
            x: drag.current.baseX + (e.clientX - drag.current.startX),
            y: drag.current.baseY + (e.clientY - drag.current.startY),
        });
    };
    const onPointerUp = () => {
        drag.current.active = false;
    };

    if (!current) return null;

    return (
        <motion.div
            className="fixed inset-0 z-60 flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 text-white">
                <span className="text-sm tabular-nums text-white/80">
                    {index + 1} / {count}
                </span>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => zoomBy(-0.5)} aria-label="Zoom out" className="rounded-full p-2 transition-colors hover:bg-white/10 cursor-pointer">
                        <Minus size={20} />
                    </button>
                    <button type="button" onClick={() => zoomBy(0.5)} aria-label="Zoom in" className="rounded-full p-2 transition-colors hover:bg-white/10 cursor-pointer">
                        <Plus size={20} />
                    </button>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 transition-colors hover:bg-white/10 cursor-pointer">
                        <X size={22} />
                    </button>
                </div>
            </div>

            {/* Image stage — click empty space to close. */}
            <div
                ref={stageRef}
                className="relative flex-1 overflow-hidden"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
                    onDoubleClick={() => (scale > 1 ? resetZoom() : setScale(2))}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                >
                    <img
                        src={current.url}
                        alt={current.alt}
                        draggable={false}
                        className="max-h-full max-w-full select-none object-contain"
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transition: drag.current.active ? 'none' : 'transform 0.15s ease-out',
                        }}
                    />
                </div>

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => go(-1)}
                            aria-label="Previous"
                            className="absolute inset-s-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 cursor-pointer"
                        >
                            <ChevronLeft className="rtl:rotate-180" />
                        </button>
                        <button
                            type="button"
                            onClick={() => go(1)}
                            aria-label="Next"
                            className="absolute inset-e-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 cursor-pointer"
                        >
                            <ChevronRight className="rtl:rotate-180" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail strip */}
            {count > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => onChange(i)}
                            aria-label={`Image ${i + 1}`}
                            className={cn(
                                'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-16 cursor-pointer',
                                i === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100',
                            )}
                        >
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
