import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../config';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    showSessionWarning: boolean;
    remainingTime: number;
    extendSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSessionWarning, setShowSessionWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(120); // 2 minutes in seconds

    useEffect(() => {
        const validateSession = async () => {
            const token = sessionStorage.getItem('access_token');
            const storedUser = sessionStorage.getItem('arunachala_user');

            if (token && storedUser) {
                try {
                    // Validate token with backend
                    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        throw new Error('Session invalid');
                    }
                } catch (error) {
                    console.error('Session validation failed:', error);
                    logout(); // Force clean logout
                }
            }
            setIsLoading(false);
        };

        validateSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            setUser(user);
        } catch (error: any) {
            console.error(error);
            throw error; // Re-throw the error with the original message
        }
    };

    const logout = (message?: string) => {
        setUser(null);
        setShowSessionWarning(false);
        sessionStorage.removeItem('arunachala_user');
        sessionStorage.removeItem('access_token');
        if (message) {
            window.location.href = `/login?message=${encodeURIComponent(message)}`;
        } else {
            window.location.href = '/login';
        }
    };

    const extendSession = async () => {
        try {
            const token = sessionStorage.getItem('access_token');
            if (token) {
                const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    sessionStorage.setItem('access_token', data.access_token);
                    setShowSessionWarning(false);
                    setRemainingTime(120);
                } else {
                    logout("Tu sesión ha expirado.");
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout("Error de conexión durante la renovación de sesión.");
        }
    };

    // Session Management - Idle Detection
    useEffect(() => {
        if (!user || showSessionWarning) return;

        const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
        const WARNING_DURATION = 2 * 60 * 1000;  // 2 minutes
        const IDLE_BEFORE_WARNING = SESSION_DURATION - WARNING_DURATION;

        let warningTimeout: NodeJS.Timeout;

        const startWarning = () => {
            setShowSessionWarning(true);
            setRemainingTime(WARNING_DURATION / 1000);
        };

        const resetIdleTimer = () => {
            if (showSessionWarning) return; // Don't reset if we are already in warning mode
            clearTimeout(warningTimeout);
            warningTimeout = setTimeout(startWarning, IDLE_BEFORE_WARNING);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

        // Initialize timer
        resetIdleTimer();

        // Listen for activity
        const throttledReset = () => {
            resetIdleTimer();
        };

        events.forEach(event => window.addEventListener(event, throttledReset));

        return () => {
            events.forEach(event => window.removeEventListener(event, throttledReset));
            clearTimeout(warningTimeout);
        };
    }, [user, showSessionWarning]);

    // Session Management - Countdown
    useEffect(() => {
        if (!user || !showSessionWarning) return;

        const countdownInterval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    logout("Tu sesión ha expirado por inactividad.");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [user, showSessionWarning]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, showSessionWarning, remainingTime, extendSession }}>
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
