import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastNotificationProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onRemove }) => {
    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'error':
                return <XCircleIcon className="h-6 w-6 text-red-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
            case 'info':
                return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[100] space-y-2 sm:max-w-md w-auto pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -20, x: 100 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.3 }}
                        className={`${getStyles(toast.type)} border rounded-lg shadow-lg p-4 flex items-start gap-3 pointer-events-auto`}
                    >
                        <div className="flex-shrink-0">
                            {getIcon(toast.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 break-words">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => onRemove(toast.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastNotification;
