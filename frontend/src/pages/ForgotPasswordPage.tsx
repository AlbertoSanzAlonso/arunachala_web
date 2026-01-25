import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                // We might not want to reveal if email exists or not for security, 
                // but for this demo we'll show generic success or specific error if needed.
                const data = await response.json();
                throw new Error(data.detail || 'Error al procesar solicitud');
            }

            setMessage('Si el email existe, recibirás un enlace de recuperación.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Recuperar Contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Introduce tu email para recibir un enlace de recuperación.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {!message ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email</label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 ${isLoading ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-green-700 text-center bg-green-50 p-4 rounded-lg">
                        <p>{message}</p>
                        <p className="mt-4 text-sm">Revisa tu terminal del backend para ver el enlace (modo demo).</p>
                    </div>
                )}

                <p className="mt-10 text-center text-sm text-gray-500">
                    <Link to="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
