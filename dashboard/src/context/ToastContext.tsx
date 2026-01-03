import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    title?: string;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: Toast['type'], message: string, title?: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: Toast['type'], message: string, title?: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, message, title }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    const getIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getBgColor = (type: Toast['type']) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'error': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            case 'info': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
            default: return 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
        }
    };

    return (
        <div className="fixed top-20 right-6 z-[9999] space-y-4 w-96">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-4 p-5 rounded-2xl border-2 shadow-2xl animate-slide-in ${getBgColor(toast.type)}`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(toast.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        {toast.title && (
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {toast.title}
                            </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {toast.message}
                        </p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
