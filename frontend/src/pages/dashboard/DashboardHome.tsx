import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowTrendingUpIcon, UsersIcon, DocumentDuplicateIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config';

const stats = [
    { name: 'Visitas Totales', stat: '12,453', change: '12%', changeType: 'increase', icon: UsersIcon },
    { name: 'Páginas Vistas', stat: '45,231', change: '5.4%', changeType: 'increase', icon: DocumentDuplicateIcon },
    { name: 'Ratio de Rebote', stat: '24.57%', change: '3.2%', changeType: 'decrease', icon: ArrowTrendingUpIcon },
];

interface ActivityItem {
    id: number;
    type: string;
    action: string;
    title: string;
    timestamp: string;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    return past.toLocaleDateString('es-ES');
}

export default function DashboardHome() {
    const location = useLocation();
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if there's a notification in the location state
        if (location.state?.notification) {
            setNotification(location.state.notification);

            // Clear the notification after 5 seconds
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);

            // Clear location state to prevent showing notification on refresh
            window.history.replaceState({}, document.title);

            return () => clearTimeout(timer);
        }
    }, [location]);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                const token = sessionStorage.getItem('access_token');
                const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-activity?limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setActivities(data);
                }
            } catch (error) {
                console.error('Error fetching recent activity:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentActivity();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
                Vista General
            </h2>

            {/* Notification Banner */}
            {notification && (
                <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                            <p className="text-sm font-medium text-green-800">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 border border-gray-100"
                    >
                        <dt>
                            <div className="absolute rounded-md bg-primary-500 p-3">
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                            <p
                                className={classNames(
                                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                                    'ml-2 flex items-baseline text-sm font-semibold'
                                )}
                            >
                                {item.changeType === 'increase' ? '↑' : '↓'} {item.change}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Actividad Reciente</h3>
                {isLoading ? (
                    <p className="text-gray-500 text-center py-4">Cargando actividad...</p>
                ) : activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {activities.map((activity, index) => (
                            <li key={`${activity.type}-${activity.id}-${index}`} className="py-4 flex justify-between">
                                <span className="text-gray-700">{activity.title}</span>
                                <span className="text-gray-500 text-sm">{formatTimeAgo(activity.timestamp)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
