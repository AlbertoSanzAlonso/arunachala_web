import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface UIState {
    isChatOpen: boolean;
    toasts: Toast[];
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isChatOpen: false,
    toasts: [],
    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
    openChat: () => set({ isChatOpen: true }),
    closeChat: () => set({ isChatOpen: false }),
    addToast: (type, message, duration = 5000) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
            toasts: [...state.toasts, { id, type, message, duration }]
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id)
                }));
            }, duration);
        }
    },
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));
