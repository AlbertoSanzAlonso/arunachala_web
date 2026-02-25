import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionTracker } from '../hooks/useSessionTracker';

interface User {
    id: string;
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: (message?: string) => void;
    isLoading: boolean;
    showSessionWarning: boolean;
    remainingTime: number;
    extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    // Start session tracking side-effects
    useSessionTracker();

    useEffect(() => {
        store.validateSession();
    }, []);

    return (
        <AuthContext.Provider value={{
            user: store.user,
            isAuthenticated: store.isAuthenticated,
            login: store.login,
            logout: store.logout,
            isLoading: store.isLoading,
            showSessionWarning: store.showSessionWarning,
            remainingTime: store.remainingTime,
            extendSession: store.extendSession
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
