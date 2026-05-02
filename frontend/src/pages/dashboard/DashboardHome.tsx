import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    XMarkIcon,
    EyeIcon,
    UserGroupIcon,
    TrashIcon,
    EnvelopeIcon,
    ChevronDownIcon,
    BoltIcon,
    Bars3CenterLeftIcon,
    ChatBubbleLeftEllipsisIcon,
    MegaphoneIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Disclosure, Dialog, Transition } from '@headlessui/react';
import { API_BASE_URL } from '../../config';
import EmailSubsModal from './EmailSubsModal';
import ConfirmModal from '../../components/ui/modals/ConfirmModal';

interface ActivityItem {
    id: number;
    type: string;
    action: string;
    title: string;
    timestamp: string;
    author_name?: string;
}

interface ActivitySuggestion {
    id: number;
    title: string;
    description: string;
    type: string;
    vote_results?: Record<string, number>;
    user_comments?: { text: string; option: string; date: string; votes?: number }[];
}

interface Subscription {
    id: number;
    email: string;
    first_name?: string;
    language: string;
    created_at: string;
    is_active: boolean;
    is_confirmed: boolean;
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
    const navigate = useNavigate();
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
    const [generalProposals, setGeneralProposals] = useState<{ id: number; text: string; comments: string; date: string; status: string }[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [subscriberSearch, setSubscriberSearch] = useState('');
    const [hideSuggestionsAlert, setHideSuggestionsAlert] = useState(() => {
        return parseInt(localStorage.getItem('dash_dismissed_proposals') || '0', 10);
    });
    const [hideSubscribersAlert, setHideSubscribersAlert] = useState(() => {
        return parseInt(localStorage.getItem('dash_dismissed_subscribers') || '0', 10);
    });
    const [lastSubViewTime, setLastSubViewTime] = useState(() => {
        return localStorage.getItem('dash_last_sub_view') || new Date(Date.now() - 7 * 86400000).toISOString();
    });
    const [lastBlogDismissTime, setLastBlogDismissTime] = useState(() => {
        return parseInt(localStorage.getItem('dash_dismissed_blog_time') || '0', 10);
    });
    const [confirmShareId, setConfirmShareId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [selectedComment, setSelectedComment] = useState<{ id?: number; text: string; comments?: string; option: string; date: string; votes?: number } | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState<ActivitySuggestion | null>(null);
    const [showPollComments, setShowPollComments] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [rankings, setRankings] = useState<any[]>([]);
    const [activitiesLimit, setActivitiesLimit] = useState(5);
    const [rankingsLimit, setRankingsLimit] = useState(5);

    // New bulk actions
    const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isDeletingSubs, setIsDeletingSubs] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
        confirmText?: string;
    } | null>(null);

    const fetchData = useCallback(async () => {
        const token = sessionStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Stats
        fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers })
            .then(res => res.json())
            .then(setStats)
            .catch(console.error);

        // 2. Recent Activity
        fetch(`${API_BASE_URL}/api/dashboard/recent-activity?limit=${activitiesLimit}`, { headers })
            .then(res => res.json())
            .then(setActivities)
            .finally(() => setIsLoading(false));

        // 3. Suggestions (Active Polls)
        fetch(`${API_BASE_URL}/api/activities`)
            .then(res => res.json())
            .then(data => setSuggestions(data.filter((a: any) => a.type === 'sugerencia')))
            .finally(() => setIsLoadingSuggestions(false));

        // 4. General Proposals
        fetch(`${API_BASE_URL}/api/suggestions/general-proposals`, { headers })
            .then(res => res.json())
            .then(setGeneralProposals)
            .catch(console.error);

        // 5. Rankings
        fetch(`${API_BASE_URL}/api/content/ranking?limit=${rankingsLimit}`)
            .then(res => res.json())
            .then(setRankings)
            .catch(console.error);


        // 7. Subscriptions
        fetch(`${API_BASE_URL}/api/subscriptions/`, { headers })
            .then(res => res.json())
            .then(setSubscriptions)
            .catch(console.error);
    }, [activitiesLimit, rankingsLimit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (location.state?.notification) {
            setNotification(location.state.notification);
            const timer = setTimeout(() => setNotification(null), 5000);
            window.history.replaceState({}, document.title);
            return () => clearTimeout(timer);
        }
    }, [location]);



    const deleteGeneralProposal = async (id: number) => {
        setConfirmAction({
            title: 'Eliminar Propuesta',
            message: '¿Estás seguro de que quieres eliminar esta propuesta? No se podrá recuperar.',
            confirmText: 'Eliminar',
            type: 'danger',
            onConfirm: async () => {
                const token = sessionStorage.getItem('access_token');
                const res = await fetch(`${API_BASE_URL}/api/suggestions/general-proposals?id=${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setGeneralProposals(prev => prev.filter(p => p.id !== id));
                    setConfirmDeleteId(null);
                    setNotification({ type: 'success', message: '✅ Propuesta eliminada' });
                }
                setConfirmAction(null);
            }
        });
    };

    const shareGeneralProposal = async (id: number) => {
        const token = sessionStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/api/suggestions/general-proposals/${id}/share`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setGeneralProposals(prev => prev.filter(p => p.id !== id));
            setShowCommentModal(false);
            setConfirmShareId(null);
            setNotification({ type: 'success', message: '✅ Sugerencia publicada como votación en la sección de Actividades' });
            fetchData();
        } else {
            setNotification({ type: 'error', message: '❌ Error al compartir la sugerencia' });
        }
    };

    const deleteSubscription = async (email: string) => {
        const token = sessionStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/api/subscriptions/${email}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setSubscriptions(prev => prev.filter(s => s.email !== email));
        }
    };

    const currentLastSubView = new Date(lastSubViewTime).getTime();
    const newSubscribers = subscriptions.filter(s => {
        const subDate = new Date(s.created_at).getTime();
        return !isNaN(subDate) && subDate > currentLastSubView;
    });
    const newSubscribersCount = newSubscribers.length;

    const unreadProposals = generalProposals.filter(p => p.status === 'pending');

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
        (sub.first_name && sub.first_name.toLowerCase().includes(subscriberSearch.toLowerCase()))
    );

    const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
        const isNewA = new Date(a.created_at) > new Date(lastSubViewTime);
        const isNewB = new Date(b.created_at) > new Date(lastSubViewTime);
        if (isNewA && !isNewB) return -1;
        if (!isNewA && isNewB) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const newBlogActivities = activities.filter(a =>
        a.type === 'content' &&
        a.action === 'created' &&
        a.title.includes('Artículo') &&
        a.author_name === 'ArunachalaBot' &&
        new Date(a.timestamp).getTime() > lastBlogDismissTime
    );

    // Bulk action handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedSubscribers(new Set(filteredSubscriptions.map(s => s.email)));
        } else {
            setSelectedSubscribers(new Set());
        }
    };

    const handleSelectSubscriber = (email: string) => {
        const newSet = new Set(selectedSubscribers);
        if (newSet.has(email)) newSet.delete(email);
        else newSet.add(email);
        setSelectedSubscribers(newSet);
    };

    const handleBulkDelete = async () => {
        if (selectedSubscribers.size === 0) return;
        setConfirmAction({
            title: 'Eliminar Suscriptores',
            message: `¿Estás seguro de que quieres eliminar ${selectedSubscribers.size} suscriptor(es)? Esta acción no se puede deshacer.`,
            confirmText: 'Sí, eliminar',
            type: 'danger',
            onConfirm: async () => {
                setIsDeletingSubs(true);
                const token = sessionStorage.getItem('access_token');
                try {
                    const res = await fetch(`${API_BASE_URL}/api/subscriptions/bulk-delete`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ emails: Array.from(selectedSubscribers) })
                    });
                    if (res.ok) {
                        setSubscriptions(prev => prev.filter(s => !selectedSubscribers.has(s.email)));
                        setSelectedSubscribers(new Set());
                        setNotification({ type: 'success', message: `✅ ${selectedSubscribers.size} suscriptor(es) eliminado(s)` });
                    }
                } catch {
                    setNotification({ type: 'error', message: '❌ Error al eliminar' });
                } finally {
                    setIsDeletingSubs(false);
                    setConfirmAction(null);
                }
            }
        });
    };

    const handleSendBulkEmail = async (subject: string, content: string) => {
        if (selectedSubscribers.size === 0 || !subject || !content) return;
        setIsSendingEmail(true);
        const token = sessionStorage.getItem('access_token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/subscriptions/send-email`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails: Array.from(selectedSubscribers),
                    subject,
                    content
                })
            });
            if (res.ok) {
                setShowEmailModal(false);
                setSelectedSubscribers(new Set());
                setNotification({ type: 'success', message: '✅ Correos en proceso de envío' });
            } else {
                setNotification({ type: 'error', message: '❌ Error enviando mail' });
            }
        } catch {
            setNotification({ type: 'error', message: '❌ Error en la red' });
        } finally {
            setIsSendingEmail(false);
        }
    };

    const deleteActivePoll = async (id: number) => {
        setConfirmAction({
            title: 'Retirar Votación',
            message: '¿Estás seguro de que quieres borrar esta votación o sugerencia activa para que no aparezca en la web?',
            confirmText: 'Retirar',
            type: 'warning',
            onConfirm: async () => {
                const token = sessionStorage.getItem('access_token');
                try {
                    const res = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        setSuggestions(prev => prev.filter(s => s.id !== id));
                        setNotification({ type: 'success', message: '✅ Votación retirada con éxito' });
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setConfirmAction(null);
                }
            }
        });
    };

    const navigateToEdit = (type: string, id: number, category?: string) => {
        if (type === 'content' || type === 'article' || type === 'meditation') {
            const params = new URLSearchParams();
            params.set('edit', id.toString());
            if (category) params.set('category', category);
            window.location.href = `/dashboard/content?${params.toString()}`;
        } else if (type === 'schedule') {
            window.location.href = `/dashboard/schedule`;
        } else if (type === 'yoga_class') {
            window.location.href = `/dashboard/classes`;
        }
    };

    return (
        <div className="space-y-10 sm:space-y-12 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-headers">Vista General</h2>

            {/* Notifications */}
            <div className="space-y-4">
                {notification && (
                    <div className="rounded-xl bg-green-50 p-4 border border-green-200 shadow-sm flex items-center justify-between transition-all">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                            <p className="text-sm font-medium text-green-800">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="text-green-600 hover:text-green-800 p-1"><XMarkIcon className="h-5 w-5" /></button>
                    </div>
                )}
                {newBlogActivities.length > 0 && (
                    <div className="rounded-xl bg-orange-50 p-4 border border-orange-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-orange-100 rounded-lg shrink-0"><MegaphoneIcon className="w-5 h-5 text-orange-600" /></div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-orange-900">Nuevo artículo publicado</h4>
                                <p className="text-xs text-orange-700 break-words">Se ha publicado de forma automática por el asistente de Inteligencia Artificial: {newBlogActivities[0].title.replace('Nuevo Artículo:', '').trim()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button onClick={() => {
                                const latestTime = Math.max(...newBlogActivities.map(a => new Date(a.timestamp).getTime()));
                                localStorage.setItem('dash_dismissed_blog_time', String(latestTime));
                                setLastBlogDismissTime(latestTime);
                                window.location.href = '/dashboard/content?category=blog';
                            }} className="text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors whitespace-nowrap">Ver en Gestor de Contenidos</button>
                            <button onClick={() => {
                                const latestTime = Math.max(...newBlogActivities.map(a => new Date(a.timestamp).getTime()));
                                localStorage.setItem('dash_dismissed_blog_time', String(latestTime));
                                setLastBlogDismissTime(latestTime);
                            }} className="p-2 hover:bg-orange-100 rounded-full text-orange-500 hover:text-orange-700 transition-colors shrink-0" title="Cerrar aviso"><XMarkIcon className="h-5 w-5" /></button>
                        </div>
                    </div>
                )}
                {newSubscribersCount > 0 && newSubscribersCount > hideSubscribersAlert && (
                    <div className="rounded-xl bg-blue-50 p-4 border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-blue-100 rounded-lg shrink-0"><UserGroupIcon className="w-5 h-5 text-blue-600" /></div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-blue-900">Nuevos suscriptores</h4>
                                <p className="text-xs text-blue-700">Has recibido {newSubscribersCount} {newSubscribersCount === 1 ? 'nueva suscripción' : 'nuevas suscripciones'}.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button onClick={() => {
                                localStorage.setItem('dash_dismissed_subscribers', String(newSubscribersCount));
                                setHideSubscribersAlert(newSubscribersCount);
                                document.getElementById('suscripciones-newsletter')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap">Ver suscriptores</button>
                            <button onClick={() => {
                                localStorage.setItem('dash_dismissed_subscribers', String(newSubscribersCount));
                                setHideSubscribersAlert(newSubscribersCount);
                            }} className="p-2 hover:bg-blue-100 rounded-full text-blue-500 hover:text-blue-700 transition-colors shrink-0" title="Cerrar aviso"><XMarkIcon className="h-5 w-5" /></button>
                        </div>
                    </div>
                )}
                {unreadProposals.length > 0 && unreadProposals.length > hideSuggestionsAlert && (
                    <div className="rounded-xl bg-purple-50 p-4 border border-purple-200 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 animate-in slide-in-from-top-2">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className="p-2 bg-purple-100 rounded-lg shrink-0"><EnvelopeIcon className="w-5 h-5 text-purple-600" /></div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-purple-900">Nuevas sugerencias</h4>
                                <p className="text-xs text-purple-700">Tienes {unreadProposals.length} {unreadProposals.length === 1 ? 'sugerencia pendiente' : 'sugerencias pendientes'} por leer en el buzón.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button onClick={() => {
                                localStorage.setItem('dash_dismissed_proposals', String(unreadProposals.length));
                                setHideSuggestionsAlert(unreadProposals.length);
                                document.getElementById('general-proposals')?.scrollIntoView({ behavior: 'smooth' });
                            }} className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors whitespace-nowrap">Ver sugerencias</button>
                            <button onClick={() => {
                                localStorage.setItem('dash_dismissed_proposals', String(unreadProposals.length));
                                setHideSuggestionsAlert(unreadProposals.length);
                            }} className="p-2 hover:bg-purple-100 rounded-full text-purple-500 hover:text-purple-700 transition-colors shrink-0"><XMarkIcon className="h-5 w-5" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* 1. Estado del Contenido */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BoltIcon className="w-6 h-6 text-yellow-500" />
                    Estado del Contenido
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div
                        onClick={() => navigate('/dashboard/content?tab=yoga_article')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-forest transition-colors">Artículos</p>
                        <p className="text-3xl font-bold text-forest mt-1">{stats?.articles ?? 0}</p>
                    </div>
                    <div
                        onClick={() => navigate('/dashboard/content?tab=meditation')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-forest transition-colors">Meditaciones</p>
                        <p className="text-3xl font-bold text-forest mt-1">{stats?.meditations ?? 0}</p>
                    </div>
                    <div
                        onClick={() => navigate('/dashboard/gallery')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-forest transition-colors">Imágenes</p>
                        <p className="text-3xl font-bold text-forest mt-1">{stats?.images ?? 0}</p>
                    </div>
                    <div
                        onClick={() => navigate('/dashboard/schedule')}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-forest transition-colors">Clases</p>
                        <p className="text-3xl font-bold text-forest mt-1">{stats?.yoga_classes ?? 0}</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 2. Historial del Sitio */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Bars3CenterLeftIcon className="w-6 h-6 text-gray-400" />
                            Historial del Sitio
                        </h3>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full">Reciente</span>
                    </div>
                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100 h-[380px] flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}
                                </div>
                            ) : activities.length === 0 ? (
                                <p className="text-gray-500 text-center py-10 italic">No hay actividad reciente</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {activities.map((activity, index) => (
                                        <li
                                            key={index}
                                            onClick={() => navigateToEdit(activity.type, activity.id)}
                                            className="py-4 flex justify-between items-center group first:pt-0 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-forest shrink-0"></div>
                                                <span className="text-gray-700 text-sm font-medium truncate">{activity.title}</span>
                                            </div>
                                            <span className="text-gray-400 text-[10px] italic shrink-0 ml-4">{formatTimeAgo(activity.timestamp)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {!isLoading && activities.length >= 5 && (
                            <div className="pt-4 border-t border-gray-50 text-center">
                                <button
                                    onClick={() => setActivitiesLimit(prev => prev === 20 ? 5 : 20)}
                                    className="text-xs font-bold text-forest hover:text-forest-700 transition-colors uppercase tracking-widest"
                                >
                                    {activitiesLimit === 20 ? 'Ver menos' : 'Ver más'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Ranking de Contenido */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <EyeIcon className="w-6 h-6 text-blue-500" />
                            Más Visualizados
                        </h3>
                    </div>
                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100 h-[380px] flex flex-col">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {rankings.length === 0 ? (
                                <p className="text-gray-500 text-center py-10 italic">Aún no hay visualizaciones</p>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {rankings.map((item, index) => (
                                        <li
                                            key={item.id}
                                            onClick={() => navigateToEdit(item.type, item.id, item.category)}
                                            className="py-4 flex justify-between items-center group first:pt-0 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px] shrink-0">{index + 1}</div>
                                                <div className="min-w-0">
                                                    <p className="text-gray-700 text-sm font-medium truncate">{item.title}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.type === 'article' ? 'Artículo' : 'Meditación'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full text-gray-500 shrink-0">
                                                <EyeIcon className="w-3 h-3" />
                                                <span className="text-[10px] font-bold">{item.view_count || 0}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {!isLoading && rankings.length >= 5 && (
                            <div className="pt-4 border-t border-gray-50 text-center">
                                <button
                                    onClick={() => setRankingsLimit(prev => prev === 20 ? 5 : 20)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                                >
                                    {rankingsLimit === 20 ? 'Ver menos' : 'Ver más'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>


            {/* 4. Actividades en curso (Polls) */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ChatBubbleLeftEllipsisIcon className="w-7 h-7 text-primary-500" />
                        Votaciones Activas
                    </h3>
                    {suggestions.length > 0 && (
                        <span className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-full animate-pulse">
                            {suggestions.length} {suggestions.length === 1 ? 'votación activa' : 'votaciones activas'}
                        </span>
                    )}
                </div>

                {isLoadingSuggestions ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                        <div className="h-64 bg-gray-50 rounded-3xl" />
                        <div className="h-64 bg-gray-50 rounded-3xl" />
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 italic">No hay votaciones activas actualmente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {suggestions.map((item) => (
                            <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-shadow border-t-8 border-t-primary-500">
                                <div className="p-8 pb-4 relative">
                                    <div className="absolute top-4 right-4 group-hover:block transition-all">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteActivePoll(item.id);
                                            }}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Retirar votación de la web"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-3 italic leading-relaxed">{item.description}</p>
                                </div>

                                <div className="p-8 pt-4 space-y-6">
                                    <div className="space-y-4">
                                        {Object.entries(item.vote_results || {}).filter(([k]) => k !== 'custom').map(([option, count]) => {
                                            const total = Object.values(item.vote_results || {}).reduce((a, b) => a + b, 0);
                                            const pc = total > 0 ? (count / total) * 100 : 0;
                                            return (
                                                <div key={option} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                                                        <span className="text-gray-700">{option}</span>
                                                        <span className="text-primary-600">{count} votos ({Math.round(pc)}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                        <div className="bg-primary-500 h-full transition-all duration-1000" style={{ width: `${pc}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {item.user_comments && item.user_comments.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setSelectedPoll(item);
                                                setShowPollComments(true);
                                            }}
                                            className="w-full py-3 bg-primary-50 text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
                                            Ver {item.user_comments.reduce((acc, curr) => acc + (curr.votes || 1), 0)} Comentarios/Propuestas
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 5. Propuestas Nuevas Generales */}
            <section id="general-proposals" className="space-y-6 bg-gradient-to-br from-primary-50/30 to-white p-8 rounded-[40px] border border-primary-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MegaphoneIcon className="w-7 h-7 text-primary-500" />
                            Buzón de Sugerencias
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Nuevas ideas enviadas por los usuarios desde la web.</p>
                    </div>
                    {unreadProposals.length > 0 && (
                        <div className="bg-primary-500 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                            {unreadProposals.length} por leer
                        </div>
                    )}
                </div>

                {generalProposals.length === 0 ? (
                    <div className="text-center py-10">
                        <EnvelopeIcon className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                        <p className="text-gray-400 italic">No hay propuestas pendientes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto max-h-[600px] px-2 py-2 flex-1 items-start content-start">
                        {generalProposals.map((proposal, idx) => (
                            <div key={proposal.id} className={`bg-white rounded-3xl p-6 border overflow-hidden ${proposal.status === 'pending' ? 'border-primary-300 shadow-md bg-primary-50/20' : 'border-primary-100 shadow-sm'} hover:shadow-xl transition-all group relative min-h-[160px] flex flex-col`}>
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${proposal.status === 'pending' ? 'bg-primary-500' : 'bg-gray-200'}`} />
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${proposal.status === 'pending' ? 'text-primary-600 bg-primary-50' : 'text-gray-500 bg-gray-100'}`}>
                                            Propuesta #{idx + 1}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">{formatTimeAgo(proposal.date)}</span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (proposal.status === 'pending') {
                                                const token = sessionStorage.getItem('access_token');
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/suggestions/general-proposals/${proposal.id}/status`, {
                                                        method: 'PUT',
                                                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ status: 'reviewed' })
                                                    });
                                                    if (res.ok) {
                                                        setGeneralProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'reviewed' } : p));
                                                        setHideSuggestionsAlert(prev => {
                                                            const newValue = Math.max(0, prev - 1);
                                                            localStorage.setItem('dash_dismissed_proposals', String(newValue));
                                                            return newValue;
                                                        });
                                                    }
                                                } catch {
                                                    // Network error — don't update local state so it stays pending
                                                }
                                            }
                                            setSelectedComment({
                                                id: proposal.id,
                                                text: proposal.text,
                                                comments: proposal.comments,
                                                option: 'Propuesta General',
                                                date: proposal.date
                                            });
                                            setShowCommentModal(true);
                                        }}
                                        className="text-left group-hover:text-primary-700 transition-colors flex-grow"
                                    >
                                        <p className="text-gray-800 font-semibold leading-relaxed line-clamp-4 italic">"{proposal.text}"</p>
                                        {proposal.comments && (
                                            <p className="mt-2 text-xs text-gray-500 line-clamp-2">💬 {proposal.comments}</p>
                                        )}
                                    </button>
                                    <div className="mt-6 pt-4 border-t border-gray-50">
                                        {confirmShareId === proposal.id ? (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                                <span className="text-xs text-gray-500 sm:flex-grow text-center sm:text-left font-medium">¿Publicar como votación pública?</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => shareGeneralProposal(proposal.id)} className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all">Sí, compartir</button>
                                                    <button onClick={() => setConfirmShareId(null)} className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : confirmDeleteId === proposal.id ? (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                                <span className="text-xs text-gray-500 sm:flex-grow text-center sm:text-left font-medium">¿Eliminar esta propuesta?</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => deleteGeneralProposal(proposal.id)} className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all">Eliminar</button>
                                                    <button onClick={() => setConfirmDeleteId(null)} className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all">Cancelar</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => setConfirmShareId(proposal.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary-600 hover:text-white hover:bg-primary-500 rounded-full border border-primary-200 hover:border-primary-500 transition-all"
                                                    title="Compartir como votación pública"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                        <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.366A2.52 2.52 0 0 1 13 4.5Z" />
                                                    </svg>
                                                    Compartir
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(proposal.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                    title="Descartar propuesta"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 6. Suscripciones y Newsletter */}
            <section id="suscripciones-newsletter" className="space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <EnvelopeIcon className="w-7 h-7 text-bark" />
                            Suscripciones Newsletter
                        </h3>
                    </div>
                    <div className="bg-bark text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        <UserGroupIcon className="w-4 h-4" />
                        {subscriptions.filter(s => s.is_confirmed).length} confirmados / {subscriptions.length} total
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <Disclosure.Button
                                    onClick={() => {
                                        if (!open) {
                                            // Al abrir, marcamos como leídos (reseteamos el contador)
                                            // Usamos un pequeño margen para evitar que fluctuaciones de milisegundos marquen a los actuales como nuevos
                                            const now = new Date();
                                            let maxTime = now.getTime();

                                            if (subscriptions.length > 0) {
                                                const subTimes = subscriptions
                                                    .map(s => {
                                                        const t = new Date(s.created_at).getTime();
                                                        return isNaN(t) ? 0 : t;
                                                    })
                                                    .filter(t => t > 0);

                                                if (subTimes.length > 0) {
                                                    // Guardamos el máximo tiempo encontrado + 1 segundo
                                                    maxTime = Math.max(...subTimes) + 1000;
                                                }
                                            }

                                            // Si por algún motivo maxTime es del futuro lejano o inválido, usamos el tiempo actual
                                            if (isNaN(maxTime) || maxTime > now.getTime() + 86400000) {
                                                maxTime = now.getTime();
                                            }

                                            const nowStr = new Date(maxTime).toISOString();
                                            localStorage.setItem('dash_last_sub_view', nowStr);
                                            localStorage.setItem('dash_dismissed_subscribers', '0'); // Reset alert threshold
                                            setLastSubViewTime(nowStr);
                                            setHideSubscribersAlert(0);
                                        }
                                    }}
                                    className="flex w-full justify-between bg-gray-50/50 px-8 py-6 text-left text-sm font-bold text-gray-900 hover:bg-gray-100 transition-all border-b border-transparent hover:border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <Bars3CenterLeftIcon className="w-5 h-5 text-gray-400" />
                                        <span>Ver lista completa de suscriptores</span>
                                    </div>
                                    <ChevronDownIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500 transition-transform`} />
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-8 pb-8 pt-4">
                                    <div className="mb-6 flex justify-between items-center bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                                        <div className="relative flex-grow max-w-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="text"
                                                name="search"
                                                id="search"
                                                className="block w-full rounded-xl border-0 py-2.5 pl-10 text-gray-900 ring-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                placeholder="Buscar suscriptor..."
                                                value={subscriberSearch}
                                                onChange={(e) => setSubscriberSearch(e.target.value)}
                                            />
                                        </div>
                                        {selectedSubscribers.size > 0 && (
                                            <div className="flex gap-2 shrink-0 animate-fade-in">
                                                <button
                                                    onClick={() => setShowEmailModal(true)}
                                                    className="px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
                                                >
                                                    <EnvelopeIcon className="w-4 h-4" />
                                                    Enviar Email ({selectedSubscribers.size})
                                                </button>
                                                <button
                                                    onClick={handleBulkDelete}
                                                    disabled={isDeletingSubs}
                                                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                    {isDeletingSubs ? 'Eliminando...' : `Eliminar (${selectedSubscribers.size})`}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {filteredSubscriptions.length === 0 ? (
                                        <p className="text-center py-10 text-sm text-gray-400 italic">No se encontraron suscriptores.</p>
                                    ) : (
                                        <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-100 rounded-xl">
                                            <table className="min-w-full divide-y divide-gray-100">
                                                <thead className="bg-gray-50/80 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left w-12">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                                checked={selectedSubscribers.size > 0 && selectedSubscribers.size === filteredSubscriptions.length}
                                                                onChange={handleSelectAll}
                                                            />
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-400">Suscriptor</th>
                                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-400">Estado</th>
                                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-400">Idioma</th>
                                                        <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-gray-400">Fecha</th>
                                                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-gray-400">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 bg-white relative">
                                                    {sortedSubscriptions.map((sub) => {
                                                        const isNew = new Date(sub.created_at) > new Date(lastSubViewTime);
                                                        return (
                                                            <tr key={sub.id} className={`hover:bg-gray-50/50 group ${isNew ? 'bg-blue-50/20' : ''}`}>
                                                                <td className="px-4 py-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                                        checked={selectedSubscribers.has(sub.email)}
                                                                        onChange={() => handleSelectSubscriber(sub.email)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex flex-col">
                                                                            <span className={`text-sm text-gray-900 ${isNew ? 'font-black' : 'font-bold'}`}>{sub.email}</span>
                                                                            <span className={`text-xs ${isNew ? 'text-gray-700 font-bold' : 'text-gray-500'}`}>{sub.first_name || 'Sin nombre'}</span>
                                                                        </div>
                                                                        {isNew && (
                                                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase rounded">Nuevo</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-xs font-bold">
                                                                    {sub.is_confirmed ? (
                                                                        <span className="text-green-600 flex items-center gap-1">
                                                                            <CheckCircleIcon className="w-4 h-4" />
                                                                            Confirmado
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-red-500 flex items-center gap-1 italic opacity-70">
                                                                            <XMarkIcon className="w-4 h-4" />
                                                                            Sin Confirmar
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold rounded-md uppercase">{sub.language}</span>
                                                                </td>
                                                                <td className="px-4 py-4 text-xs text-gray-400">
                                                                    {new Date(sub.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-4 text-right">
                                                                    <button
                                                                        onClick={() => {
                                                                            setConfirmAction({
                                                                                title: 'Eliminar Suscripción',
                                                                                message: `¿Estás seguro de que quieres dar de baja a ${sub.email}?`,
                                                                                confirmText: 'Sí, eliminar',
                                                                                type: 'danger',
                                                                                onConfirm: () => {
                                                                                    deleteSubscription(sub.email);
                                                                                    setConfirmAction(null);
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                                        title="Dar de baja"
                                                                    >
                                                                        <TrashIcon className="w-5 h-5" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                </div>
            </section>

            {/* Modal de Comentario Expandido */}
            <Transition.Root show={showCommentModal} as={React.Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={setShowCommentModal}>
                    <Transition.Child
                        as="div"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-[40px] bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-gray-100">
                                    <div className="p-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {selectedComment?.option}
                                            </span>
                                            <button onClick={() => setShowCommentModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="text-center">
                                                <p className="text-gray-900 text-2xl leading-relaxed italic font-medium">
                                                    "{selectedComment?.text}"
                                                </p>
                                            </div>

                                            {selectedComment?.comments && (
                                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Información Adicional / Comentarios</p>
                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                        {selectedComment.comments}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="pt-6 border-t border-gray-100 text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Fecha de Envío</p>
                                                <p className="text-sm text-gray-600 font-semibold">
                                                    {selectedComment?.date ? new Date(selectedComment.date).toLocaleString('es-ES') : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-gray-50 flex justify-center">
                                        <div className="flex gap-4">
                                            {selectedComment?.id && selectedComment.option === 'Propuesta General' && (
                                                <button
                                                    onClick={() => selectedComment.id && shareGeneralProposal(selectedComment.id)}
                                                    className="px-6 py-3 bg-primary-600 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-primary-700 transition-all shadow-lg"
                                                >
                                                    Compartir Sugerencia
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowCommentModal(false)}
                                                className="px-8 py-3 bg-gray-900 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-xl"
                                            >
                                                Cerrar Ventana
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Modal de Todos los Comentarios de una Votación */}
            <Transition.Root show={showPollComments} as={React.Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={setShowPollComments}>
                    <Transition.Child
                        as="div"
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as="div"
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-[40px] bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-2xl border border-gray-100 flex flex-col max-h-[80vh]">
                                    <div className="p-10 pb-6 border-b border-gray-100 shrink-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 mb-1">Comentarios y Propuestas</h3>
                                                <p className="text-gray-500 italic text-sm">{selectedPoll?.title}</p>
                                            </div>
                                            <button onClick={() => setShowPollComments(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                                <XMarkIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="px-10 py-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                                        {selectedPoll?.user_comments && selectedPoll.user_comments.length > 0 ? (
                                            selectedPoll.user_comments.map((comment, idx) => (
                                                <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${comment.option === 'custom' ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'}`}>
                                                            {comment.option === 'custom' ? 'Propuesta Pública' : comment.option}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold">
                                                            {new Date(comment.date).toLocaleDateString('es-ES')}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-800 text-sm leading-relaxed mb-2">"{comment.text}"</p>
                                                    {comment.votes && comment.votes > 1 && (
                                                        <div className="mt-3 flex items-center gap-1.5">
                                                            <UserGroupIcon className="w-4 h-4 text-primary-500" />
                                                            <span className="text-xs font-bold text-primary-600">{comment.votes} personas apoyan esto</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400 italic">No hay comentarios registrados para esta votación.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-gray-50 flex justify-center shrink-0 border-t border-gray-100">
                                        <button
                                            onClick={() => setShowPollComments(false)}
                                            className="px-8 py-3 bg-gray-900 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-xl"
                                        >
                                            Cerrar Ventana
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <EmailSubsModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onSend={handleSendBulkEmail}
                selectedCount={selectedSubscribers.size}
                isSending={isSendingEmail}
            />

            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmAction?.onConfirm || (() => { })}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
                confirmText={confirmAction?.confirmText}
                type={confirmAction?.type}
            />
        </div>
    );
}
