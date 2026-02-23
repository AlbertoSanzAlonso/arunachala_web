import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowTrendingUpIcon, UsersIcon, DocumentDuplicateIcon, CheckCircleIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config';

const stats: any[] = [];

interface ActivityItem {
    id: number;
    type: string;
    action: string;
    title: string;
    timestamp: string;
}

interface ActivitySuggestion {
    id: number;
    title: string;
    description: string;
    type: string;
    vote_results?: Record<string, number>;
    user_comments?: { text: string; option: string; date: string; votes?: number }[];
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
    const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
    const [generalProposals, setGeneralProposals] = useState<{ text: string; votes: number; date: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [selectedComment, setSelectedComment] = useState<{ text: string; option: string; date: string; votes?: number } | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [finishedActivities, setFinishedActivities] = useState<any[]>([]);
    const [ongoingCourses, setOngoingCourses] = useState<any[]>([]);

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

        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/activities`);
                if (response.ok) {
                    const data: ActivitySuggestion[] = await response.json();
                    setSuggestions(data.filter(a => a.type === 'sugerencia'));
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        const fetchGeneralProposals = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/suggestions/general-proposals`);
                if (response.ok) {
                    const data = await response.json();
                    setGeneralProposals(data);
                }
            } catch (error) {
                console.error('Error fetching general proposals:', error);
            }
        };

        const fetchActivityData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/activities?active_only=false`);
                if (response.ok) {
                    const data = await response.json();
                    const now = new Date();

                    // Finished courses awaiting acknowledgement
                    const finished = data.filter((a: any) =>
                        a.type === 'curso' &&
                        a.end_date &&
                        new Date(a.end_date) < now
                    );
                    setFinishedActivities(finished);

                    // Ongoing courses (courses that have started and haven't finished yet)
                    const ongoing = data.filter((a: any) =>
                        a.type === 'curso' &&
                        a.start_date &&
                        new Date(a.start_date) <= now &&
                        (!a.end_date || new Date(a.end_date) >= now)
                    );
                    setOngoingCourses(ongoing);
                }
            } catch (error) {
                console.error('Error fetching activity data:', error);
            }
        };

        fetchRecentActivity();
        fetchSuggestions();
        fetchGeneralProposals();
        fetchActivityData();
    }, []);

    const acknowledgeFinish = async (id: number) => {
        try {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/activities/${id}/acknowledge-finish`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setFinishedActivities(prev => prev.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Error acknowledging finish:', error);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight mb-4 sm:mb-8">
                Vista General
            </h2>

            {/* Notification Banner */}
            {notification && (
                <div className="mb-4 sm:mb-6 rounded-xl bg-green-50 p-4 border border-green-200 shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 sm:mr-3" />
                            <p className="text-xs sm:text-sm font-medium text-green-800">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-green-600 hover:text-green-800 transition-colors p-1"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Finished Courses Notifications */}
            {finishedActivities.length > 0 && (
                <div className="mb-6 sm:mb-8 space-y-3">
                    {finishedActivities.map(activity => (
                        <div key={activity.id} className="rounded-xl bg-amber-50 p-3 sm:p-4 border border-amber-200 shadow-sm flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center min-w-0">
                                <div className="p-2 bg-amber-100 rounded-lg mr-3 sm:mr-4 shrink-0">
                                    <CalendarIcon className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-amber-900 truncate">Curso finalizado: {activity.title}</h4>
                                    <p className="text-[10px] sm:text-xs text-amber-700 truncate sm:whitespace-normal">La fecha del curso ha concluido.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => acknowledgeFinish(activity.id)}
                                className="p-2 hover:bg-amber-100 rounded-full text-amber-500 hover:text-amber-700 transition-colors shrink-0"
                                title="Cerrar aviso"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Ongoing Courses Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Cursos en Marcha</h3>
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full">Actual</span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : ongoingCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ongoingCourses.map(course => (
                            <div key={course.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 group hover:shadow-md transition-all">
                                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors shrink-0">
                                    <CalendarIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">{course.title}</h4>
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Finaliza el {course.end_date ? new Date(course.end_date).toLocaleDateString('es-ES') : 'indefinida'}</p>
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] sm:text-[10px] font-bold text-green-600 uppercase tracking-widest">En curso</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center border border-dashed border-gray-200">
                        <p className="text-sm text-gray-400 italic">No hay ningún curso en marcha en este momento.</p>
                    </div>
                )}
            </div>

            {/* Metrics removed by request */}

            {/* Historial del Sitio */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Historial del Sitio</h3>
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full">Registro</span>
                </div>

                <div className="bg-white shadow-sm rounded-2xl p-4 sm:p-6 border border-gray-100">
                    {isLoading ? (
                        <p className="text-gray-500 text-center py-4">Cargando actividad...</p>
                    ) : activities.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {activities.map((activity, index) => (
                                <li key={`${activity.type}-${activity.id}-${activity.action}-${activity.timestamp}-${index}`} className="py-4 flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="text-gray-700 text-sm font-medium">{activity.title}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs italic">{formatTimeAgo(activity.timestamp)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Actividades en curso (Sugerencias) */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Actividades en curso</h3>
                </div>

                {isLoadingSuggestions ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 italic">No hay votaciones o sugerencias activas actualmente.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {suggestions.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                                <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2 italic">{item.description}</p>
                                </div>

                                <div className="p-6 flex-grow space-y-6">
                                    <div>
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Votaciones Actuales</h5>
                                        <div className="space-y-4">
                                            {Object.entries(item.vote_results || {})
                                                .filter(([option]) => option !== 'custom')
                                                .map(([option, count]) => {
                                                    const totalVotes = Object.values(item.vote_results || {}).reduce((a, b) => a + b, 0);
                                                    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                                                    return (
                                                        <div key={option} className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="font-medium text-gray-700">{option}</span>
                                                                <span className="text-gray-500 font-bold">{count} {count === 1 ? 'voto' : 'votos'}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {item.vote_results?.['custom'] && item.vote_results['custom'] > 0 && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                                                💡 Propuestas Personalizadas
                                                <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[10px]">
                                                    {item.vote_results['custom']}
                                                </span>
                                            </h5>
                                            <div className="space-y-2">
                                                {(item.user_comments || [])
                                                    .filter(c => c.option === 'custom')
                                                    .slice(0, 3)
                                                    .map((comment, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => {
                                                                setSelectedComment(comment);
                                                                setShowCommentModal(true);
                                                            }}
                                                            className="bg-gradient-to-r from-primary-50 to-white p-3 rounded-xl border border-primary-200 cursor-pointer hover:shadow-md hover:border-primary-400 transition-all group/custom"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
                                                                <div className="flex-grow min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover/custom:text-primary-700 transition-colors">
                                                                        {comment.text}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1.5">
                                                                        {comment.votes && comment.votes > 1 && (
                                                                            <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                                                <span>{comment.votes}</span>
                                                                                <span className="text-[9px]">{comment.votes === 1 ? 'voto' : 'votos'}</span>
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[9px] text-gray-400 font-medium">
                                                                            {new Date(comment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {item.user_comments && item.user_comments.filter(c => c.option !== 'custom').length > 0 && (
                                    <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {item.user_comments
                                                .filter(c => c.option !== 'custom')
                                                .slice(0, 3)
                                                .map((comment, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group/comm"
                                                        onClick={() => {
                                                            setSelectedComment(comment);
                                                            setShowCommentModal(true);
                                                        }}
                                                    >
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-200 group-hover/comm:bg-primary-500 transition-colors"></div>
                                                        <div className="flex justify-between items-start mb-1 gap-4">
                                                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-tighter bg-primary-50 px-2 py-0.5 rounded cursor-default">
                                                                {comment.option}
                                                            </span>
                                                            <span className="text-[9px] text-gray-400 font-medium">
                                                                {new Date(comment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-650 leading-relaxed italic line-clamp-2">
                                                            "{comment.text}"
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Propuestas Nuevas */}
            {generalProposals.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">💡 Propuestas Nuevas</h3>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {generalProposals.length} {generalProposals.length === 1 ? 'propuesta' : 'propuestas'}
                        </span>
                    </div>

                    <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
                        <div className="space-y-3">
                            {generalProposals.map((proposal, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setSelectedComment({
                                            text: proposal.text,
                                            option: 'custom',
                                            date: proposal.date,
                                            votes: proposal.votes
                                        });
                                        setShowCommentModal(true);
                                    }}
                                    className="bg-gradient-to-r from-primary-50 to-white p-4 rounded-xl border border-primary-200 cursor-pointer hover:shadow-md hover:border-primary-400 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl flex-shrink-0 mt-0.5">💡</span>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 transition-colors truncate">
                                                {proposal.text}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[9px] text-gray-400 font-medium">
                                                    {new Date(proposal.date).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Comentario Expandido */}
            {showCommentModal && selectedComment && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={() => setShowCommentModal(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-2">
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                        {selectedComment.option === 'custom' ? 'Propuesta Personalizada' : `Votó por: ${selectedComment.option}`}
                                    </span>
                                    <h4 className="text-xs text-gray-400 font-medium">
                                        Enviado el {new Date(selectedComment.date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </h4>
                                </div>
                                <button onClick={() => setShowCommentModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-primary-500 rounded-full" />
                                <p className="text-gray-700 text-lg leading-relaxed italic pl-2">
                                    "{selectedComment.text.replace(/^\[Propuesta: .*?\]\s*/, '')}"
                                </p>
                            </div>
                        </div>
                        <div className="px-8 py-4 flex justify-end bg-gray-50">
                            <button onClick={() => setShowCommentModal(false)} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
