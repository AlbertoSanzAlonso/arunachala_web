import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const token = sessionStorage.getItem('access_token');
            const storedUser = sessionStorage.getItem('arunachala_user');

            if (token && storedUser) {
                try {
                    // Validate token with backend
                    const response = await fetch('http://localhost:8000/api/auth/me', {
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
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            const response = await fetch('http://localhost:8000/api/auth/token', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            const { access_token, user } = data;

            sessionStorage.setItem('access_token', access_token);
            sessionStorage.setItem('arunachala_user', JSON.stringify(user));
            setUser(user);
        } catch (error) {
            console.error(error);
            throw new Error('Credenciales inválidas');
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('arunachala_user');
        sessionStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    // Session Management
    useEffect(() => {
        let warningTimeout: any;
        let logoutTimeout: any;

        // 30 minutes in ms
        const SESSION_DURATION = 30 * 60 * 1000;
        const WARNING_BEFORE = 2 * 60 * 1000; // Warning 2 mins before

        const resetTimers = () => {
            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);

            if (user) {
                // Set warning timer
                warningTimeout = setTimeout(() => {
                    const confirmExtend = window.confirm("Tu sesión está a punto de expirar por inactividad. ¿Quieres mantener la sesión?");
                    if (confirmExtend) {
                        resetTimers();
                    } else {
                        logout();
                    }
                }, SESSION_DURATION - WARNING_BEFORE);

                // Set hard logout timer
                logoutTimeout = setTimeout(() => {
                    alert("Tu sesión ha expirado por inactividad.");
                    logout();
                }, SESSION_DURATION);
            }
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        const handleActivity = () => resetTimers();

        if (user) {
            events.forEach(event => window.addEventListener(event, handleActivity));
            resetTimers();
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
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
