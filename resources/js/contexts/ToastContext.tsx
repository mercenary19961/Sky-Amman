import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 4000;

const typeStyles: Record<ToastType, string> = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-sky-600 text-white',
    warning: 'bg-amber-500 text-white',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const flash = usePage<PageProps>().props.flash;

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (message: string, type: ToastType = 'info') => {
            const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;
            setToasts((prev) => [...prev, { id, type, message }]);
            setTimeout(() => removeToast(id), TOAST_DURATION);
        },
        [removeToast],
    );

    // Auto-show server-flashed messages (success/error/info/warning) as toasts.
    useEffect(() => {
        if (flash?.success) addToast(flash.success, 'success');
        if (flash?.error) addToast(flash.error, 'error');
        if (flash?.info) addToast(flash.info, 'info');
        if (flash?.warning) addToast(flash.warning, 'warning');
    }, [flash, addToast]);

    const value: ToastContextType = {
        toast: addToast,
        success: (m) => addToast(m, 'success'),
        error: (m) => addToast(m, 'error'),
        info: (m) => addToast(m, 'info'),
        warning: (m) => addToast(m, 'warning'),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`animate-toast-in flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[420px] ${typeStyles[t.type]}`}
                    >
                        <span className="flex-1 text-sm font-medium">{t.message}</span>
                        <button
                            type="button"
                            onClick={() => removeToast(t.id)}
                            className="shrink-0 opacity-80 hover:opacity-100"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (ctx === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return ctx;
}
