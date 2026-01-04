import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setIsOpen(true);
            setResolveCallback(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolveCallback?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveCallback?.(false);
    };

    const getButtonColor = (type?: string) => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700';
            case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
            default: return 'bg-brand-500 hover:bg-brand-600';
        }
    };

    const getIconColor = (type?: string) => {
        switch (type) {
            case 'danger': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            case 'warning': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
            default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        }
    };

    const getIcon = (type?: string) => {
        switch (type) {
            case 'danger':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Confirm Modal */}
            {isOpen && options && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 p-3 rounded-full ${getIconColor(options.type)}`}>
                                    {getIcon(options.type)}
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {options.title || 'Konfirmasi'}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                        {options.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                {options.cancelText || 'Batal'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 px-4 text-white rounded-xl font-medium transition ${getButtonColor(options.type)}`}
                            >
                                {options.confirmText || 'Ya, Lanjutkan'}
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fade-in {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes scale-in {
                            from { transform: scale(0.95); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                        .animate-fade-in { animation: fade-in 0.2s ease-out; }
                        .animate-scale-in { animation: scale-in 0.2s ease-out; }
                    `}</style>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
}
