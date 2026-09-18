import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from 'config';

interface Comment {
    id: number;
    content_id: number;
    author_name: string;
    body: string;
    status: string;
    created_at: string;
}

interface ContentCommentsProps {
    contentId: number;
}

const ContentComments: React.FC<ContentCommentsProps> = ({ contentId }) => {
    const { t, i18n } = useTranslation();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [authorName, setAuthorName] = useState('');
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/${contentId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    }, [contentId]);

    useEffect(() => {
        fetchComments();
        setSubmitted(false);
        setAuthorName('');
        setBody('');
        setSubmitError(null);
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authorName.trim() || !body.trim()) return;

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/content/${contentId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author_name: authorName.trim(),
                    body: body.trim(),
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setAuthorName('');
                setBody('');
            } else {
                const data = await response.json().catch(() => ({}));
                const detail = typeof data.detail === 'string'
                    ? data.detail
                    : t('comments.error');
                setSubmitError(detail);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            setSubmitError(t('comments.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString(i18n.language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return iso;
        }
    };

    return (
        <section className="mt-16 pt-12 border-t border-forest/10" aria-labelledby="comments-heading">
            <div className="text-center mb-10 space-y-3">
                <h2
                    id="comments-heading"
                    className="text-3xl md:text-4xl font-headers text-forest uppercase tracking-wider"
                >
                    {t('comments.title')}
                </h2>
                <p className="text-bark/60 text-sm italic max-w-xl mx-auto">
                    {t('comments.subtitle')}
                </p>
            </div>

            <div className="space-y-8 mb-12">
                {isLoading ? (
                    <p className="text-center text-bark/40 text-sm">{t('comments.loading')}</p>
                ) : comments.length === 0 ? (
                    <p className="text-center text-bark/50 text-sm italic">{t('comments.empty')}</p>
                ) : (
                    comments.map((comment) => (
                        <motion.article
                            key={comment.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/50 border border-forest/10 rounded-[1.5rem] px-6 py-5 md:px-8 md:py-6"
                        >
                            <header className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                                <h3 className="font-headers text-lg text-forest tracking-wide">
                                    {comment.author_name}
                                </h3>
                                <time className="text-[11px] uppercase tracking-widest text-bark/40">
                                    {formatDate(comment.created_at)}
                                </time>
                            </header>
                            <p className="text-bark/80 text-base leading-relaxed whitespace-pre-wrap">
                                {comment.body}
                            </p>
                        </motion.article>
                    ))
                )}
            </div>

            {submitted ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 px-8 bg-matcha/10 rounded-[2rem] border border-matcha/20"
                >
                    <h4 className="text-forest font-headers uppercase tracking-wider mb-2">
                        {t('comments.thanks_title')}
                    </h4>
                    <p className="text-bark/70 text-sm">{t('comments.thanks_desc')}</p>
                    <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-sm text-matcha hover:text-forest underline underline-offset-4 transition-colors"
                    >
                        {t('comments.write_another')}
                    </button>
                </motion.div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-white/40 backdrop-blur-sm p-6 md:p-10 rounded-[2rem] border border-white/20 shadow-lg"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="comment-author"
                            className="text-[10px] font-bold uppercase tracking-widest text-forest/60 ml-1"
                        >
                            {t('comments.name_label')}
                        </label>
                        <input
                            id="comment-author"
                            type="text"
                            required
                            minLength={2}
                            maxLength={80}
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder={t('comments.name_placeholder')}
                            className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 md:px-6 md:py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="comment-body"
                            className="text-[10px] font-bold uppercase tracking-widest text-forest/60 ml-1"
                        >
                            {t('comments.body_label')}
                        </label>
                        <textarea
                            id="comment-body"
                            required
                            minLength={2}
                            maxLength={2000}
                            rows={4}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={t('comments.body_placeholder')}
                            className="w-full bg-white border border-forest/10 rounded-2xl px-5 py-3 md:px-6 md:py-4 text-bark focus:border-matcha focus:ring-4 focus:ring-matcha/10 outline-none transition-all resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !authorName.trim() || !body.trim()}
                        className="w-full py-4 bg-matcha text-white rounded-full font-headers uppercase tracking-widest text-sm hover:bg-forest hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-20"
                    >
                        {isSubmitting ? t('common.sending') : t('comments.submit')}
                    </button>
                    {submitError && (
                        <p className="text-red-500 text-xs text-center font-bold animate-pulse">
                            {submitError}
                        </p>
                    )}
                </form>
            )}
        </section>
    );
};

export default ContentComments;
