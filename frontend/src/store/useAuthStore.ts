import { create } from 'zustand';
import { API_BASE_URL } from '../config';

interface User {
    id: string;
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    role: 'admin' | 'user';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    showSessionWarning: boolean;
    remainingTime: number; // in seconds

    // Actions
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setIsLoading: (loading: boolean) => void;
    setShowSessionWarning: (show: boolean) => void;
    setRemainingTime: (time: number) => void;

    login: (email: string, password: string) => Promise<void>;
    logout: (message?: string) => void;
    extendSession: () => Promise<void>;
    validateSession: () => Promise<void>;
}

const SESSION_DURATION = 30 * 60; // 30 minutes in seconds
const WARNING_DURATION = 2 * 60;  // 2 minutes in seconds

export const useAuthStore = create<AuthState>((set, get) => ({
    user: JSON.parse(sessionStorage.getItem('arunachala_user') || 'null'),
    token: sessionStorage.getItem('access_token'),
    isAuthenticated: !!sessionStorage.getItem('access_token'),
    isLoading: true,
    showSessionWarning: false,
    remainingTime: WARNING_DURATION,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => set({ token }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setShowSessionWarning: (show) => set({ showSessionWarning: show }),
    setRemainingTime: (time) => set({ remainingTime: time }),

    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al iniciar sesión');
        }

        const data = await response.json();
        const { access_token, user } = data;

        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('arunachala_user', JSON.stringify(user));

        set({
            user,
            token: access_token,
            isAuthenticated: true,
            showSessionWarning: false
        });
    },

    logout: (message) => {
        sessionStorage.removeItem('arunachala_user');
        sessionStorage.removeItem('access_token');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            showSessionWarning: false
        });

        if (message) {
            window.location.href = `/login?message=${encodeURIComponent(message)}`;
        } else {
            window.location.href = '/login';
        }
    },

    extendSession: async () => {
        const { token } = get();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const { access_token, user } = data;

                sessionStorage.setItem('access_token', access_token);
                sessionStorage.setItem('arunachala_user', JSON.stringify(user));

                set({
                    token: access_token,
                    user,
                    showSessionWarning: false,
                    remainingTime: WARNING_DURATION
                });
            } else {
                get().logout("La sesión no pudo ser extendida.");
            }
        } catch (error) {
            console.error('Failed to extend session:', error);
            get().logout();
        }
    },

    validateSession: async () => {
        const { token } = get();
        if (!token) {
            set({ isLoading: false });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();
                set({ user, isAuthenticated: true });
            } else {
                get().logout();
            }
        } catch (error) {
            console.error('Session validation failed:', error);
            get().logout();
        } finally {
            set({ isLoading: false });
        }
    }
}));
