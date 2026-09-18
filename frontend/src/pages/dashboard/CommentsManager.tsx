import React, { useCallback, useEffect, useState } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon,
    ChatBubbleLeftEllipsisIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config';
import { getContentDetailPath } from '../../utils/contentPaths';
import PageLoader from '../../components/ui/PageLoader';
import ConfirmModal from '../../components/ui/modals/ConfirmModal';

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface AdminComment {
    id: number;
    content_id: number;
    author_name: string;
    body: string;
    status: CommentStatus;
    created_at: string;
    content_title?: string;
    content_slug?: string;
    content_type?: string;
}

const TABS: { key: CommentStatus | 'all'; label: string }[] = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'approved', label: 'Aprobados' },
    { key: 'rejected', label: 'Rechazados' },
    { key: 'all', label: 'Todos' },
];

export default function CommentsManager() {
    const [comments, setComments] = useState<AdminComment[]>([]);
    const [activeTab, setActiveTab] = useState<CommentStatus | 'all'>('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [actionId, setActionId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    const authHeaders = () => {
        const token = sessionStorage.getItem('access_token');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const query = activeTab === 'all' ? '' : `?status=${activeTab}`;
            const response = await fetch(`${API_BASE_URL}/api/comments${query}`, {
                headers: authHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }, [notification]);

    const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
        setActionId(id);
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                setNotification(status === 'approved' ? 'Comentario aprobado' : 'Comentario rechazado');
                await fetchComments();
                window.dispatchEvent(new CustomEvent('comments:pending-changed'));
            }
        } catch (error) {
            console.error('Error updating comment:', error);
        } finally {
            setActionId(null);
        }
    };

    const deleteComment = async (id: number) => {
        setActionId(id);
        try {
            const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (response.ok || response.status === 204) {
                setNotification('Comentario eliminado');
                setConfirmDeleteId(null);
                await fetchComments();
                window.dispatchEvent(new CustomEvent('comments:pending-changed'));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setActionId(null);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return iso;
        }
    };

    const contentPublicUrl = (comment: AdminComment) => {
        if (!comment.content_slug) return null;
        return getContentDetailPath(comment.content_type || 'article', comment.content_slug);
    };

    const statusBadge = (status: CommentStatus) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            approved: 'bg-green-50 text-green-700 ring-green-600/20',
            rejected: 'bg-red-50 text-red-700 ring-red-600/20',
        };
        const labels = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado',
        };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ChatBubbleLeftEllipsisIcon className="h-7 w-7 text-primary-600" />
                        Comentarios
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Modera los comentarios de artículos y noticias antes de publicarlos.
                    </p>
                </div>
            </div>

            {notification && (
                <div className="mb-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                    {notification}
                </div>
            )}

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {isLoading ? (
                <PageLoader />
            ) : comments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <ChatBubbleLeftEllipsisIcon className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">No hay comentarios en esta vista.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {comments.map((comment) => {
                        const publicUrl = contentPublicUrl(comment);
                        const busy = actionId === comment.id;
                        return (
                            <li
                                key={comment.id}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-gray-900">
                                                {comment.author_name}
                                            </span>
                                            {statusBadge(comment.status)}
                                            <span className="text-xs text-gray-400">
                                                {formatDate(comment.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {comment.body}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-1">
                                            <span className="font-medium text-gray-600">
                                                {comment.content_title || `Contenido #${comment.content_id}`}
                                            </span>
                                            {comment.content_type && (
                                                <span className="rounded bg-gray-100 px-1.5 py-0.5 uppercase tracking-wide">
                                                    {comment.content_type === 'announcement' ? 'noticia' : 'artículo'}
                                                </span>
                                            )}
                                            {publicUrl && (
                                                <a
                                                    href={publicUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                                                >
                                                    Ver publicación
                                                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                                        {comment.status !== 'approved' && (
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => updateStatus(comment.id, 'approved')}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                                            >
                                                <CheckCircleIcon className="h-4 w-4" />
                                                Aprobar
                                            </button>
                                        )}
                                        {comment.status !== 'rejected' && (
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => updateStatus(comment.id, 'rejected')}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                            >
                                                <XCircleIcon className="h-4 w-4" />
                                                Rechazar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            disabled={busy}
                                            onClick={() => setConfirmDeleteId(comment.id)}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <ConfirmModal
                isOpen={confirmDeleteId !== null}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    if (confirmDeleteId !== null) deleteComment(confirmDeleteId);
                }}
                title="Eliminar comentario"
                message="Esta acción no se puede deshacer. ¿Eliminar el comentario permanentemente?"
                confirmText="Eliminar"
                type="danger"
            />
        </div>
    );
}
