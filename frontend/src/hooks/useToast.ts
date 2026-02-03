import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/ToastNotification';

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, type, message, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string, duration?: number) => {
        addToast('success', message, duration);
    }, [addToast]);

    const error = useCallback((message: string, duration?: number) => {
        addToast('error', message, duration);
    }, [addToast]);

    const warning = useCallback((message: string, duration?: number) => {
        addToast('warning', message, duration);
    }, [addToast]);

    const info = useCallback((message: string, duration?: number) => {
        addToast('info', message, duration);
    }, [addToast]);

    return {
        toasts,
        removeToast,
        success,
        error,
        warning,
        info,
    };
};
