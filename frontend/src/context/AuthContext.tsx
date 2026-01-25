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
    extendSession: () => void;
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

    const extendSession = () => {
        setShowSessionWarning(false);
        setRemainingTime(120);
    };

    // Session Management
    useEffect(() => {
        let warningTimeout: any;
        let logoutTimeout: any;
        let countdownInterval: any;

        // 30 minutes in ms
        const SESSION_DURATION = 30 * 60 * 1000;
        const WARNING_BEFORE = 2 * 60 * 1000; // Warning 2 mins before

        const resetTimers = () => {
            if (!user) return;

            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);
            clearInterval(countdownInterval);

            // If checking from warning state, don't reset unless explicit extend action
            if (showSessionWarning) {
                // Start countdown if warning is shown
                const expiryTime = Date.now() + WARNING_BEFORE;

                countdownInterval = setInterval(() => {
                    const now = Date.now();
                    const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
                    setRemainingTime(diff);

                    if (diff <= 0) {
                        clearInterval(countdownInterval);
                    }
                }, 1000);

                return;
            }

            // Set warning timer
            warningTimeout = setTimeout(() => {
                setShowSessionWarning(true);
                setRemainingTime(120);
            }, SESSION_DURATION - WARNING_BEFORE);

            // Set hard logout timer
            logoutTimeout = setTimeout(() => {
                logout("Tu sesión ha expirado por inactividad.");
            }, SESSION_DURATION);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Wrap resetTimers to match event listener signature
        const handleActivity = () => {
            // Only reset if NOT in warning mode (if in warning mode, user MUST click "Extend" explicitly)
            if (!showSessionWarning) {
                resetTimers();
            }
        };

        if (user) {
            events.forEach(event => window.addEventListener(event, handleActivity));
            resetTimers();
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);
            clearInterval(countdownInterval);
        };
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
