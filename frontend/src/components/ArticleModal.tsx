import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '../utils/translate';
import { getImageUrl } from '../utils/imageUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Article {
    id: number;
    title: string;
    slug: string;
    body?: string;
    excerpt: string;
    category: string;
    thumbnail_url: string | null;
    tags: string[];
    created_at: string;
    translations?: any;
    seo_title?: string | null;
    seo_description?: string | null;
}

interface ArticleModalProps {
    article: Article | null;
    isOpen: boolean;
    onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ article, isOpen, onClose }) => {
    const { t, i18n } = useTranslation();

    if (!article) return null;

    const translatedTitle = getTranslated(article, 'title', i18n.language);
    const translatedBody = getTranslated(article, 'body', i18n.language);
    const translatedExcerpt = getTranslated(article, 'excerpt', i18n.language);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            yoga: t('blog.categories.yoga', 'Yoga'),
            therapy: t('blog.categories.therapy', 'Terapias'),
            general: t('blog.categories.general', 'General')
        };
        return labels[category] || category;
    };

    const cleanContent = (content: string) => {
        if (!content) return '';
        let cleaned = content
            .replace(/\\n/g, '\n')
            .replace(/\\\\n/g, '\n')
            .replace(/\\"/g, '"');

        // Remove the first H1 (# Title) if it exists at the start of the content (AI Generated)
        // This allows us to use our own H2 component title for ALL articles (Manual & AI)
        cleaned = cleaned.replace(/^#\s+.+(\n|$)/, '').trim();

        return cleaned;
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all relative">

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-800 hover:bg-white shadow-sm transition-all"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                {/* Header Image */}
                                <div className="h-64 md:h-80 bg-forest/10 relative overflow-hidden">
                                    {article.thumbnail_url ? (
                                        <img
                                            src={getImageUrl(article.thumbnail_url)}
                                            alt={translatedTitle}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest/20 to-matcha/20">
                                            <TagIcon className="w-20 h-20 text-forest/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <span className="inline-block bg-forest/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-headers uppercase tracking-wider mb-3">
                                            {getCategoryLabel(article.category)}
                                        </span>
                                        {/* REMOVED DUPLICATE TITLE IN OVERLAY */}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {/* RESTORED TITLE UNDER IMAGE */}
                                    <h2 className="text-3xl md:text-4xl font-headers text-forest mb-6 leading-tight">
                                        {translatedTitle}
                                    </h2>

                                    {/* Meta Info */}
                                    <div className="flex items-center gap-4 text-sm text-bark/60 mb-6 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span>{formatDate(article.created_at)}</span>
                                        </div>
                                    </div>

                                    {/* Excerpt */}
                                    {translatedExcerpt && (
                                        <div className="text-lg text-bark/80 font-light italic mb-8 pl-4 border-l-4 border-matcha">
                                            {translatedExcerpt}
                                        </div>
                                    )}

                                    {/* Body */}
                                    <div className="prose prose-lg prose-forest max-w-none text-bark/80">
                                        {/<[a-z][\s\S]*>/i.test(translatedBody || '') ? (
                                            <div dangerouslySetInnerHTML={{ __html: cleanContent(translatedBody) }} />
                                        ) : (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {cleanContent(translatedBody)}
                                            </ReactMarkdown>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {(() => {
                                        const lang = i18n.language?.split('-')[0] || 'es';
                                        let translations = article?.translations;
                                        // Handle string formatted translations
                                        if (typeof translations === 'string') {
                                            try {
                                                translations = JSON.parse(translations);
                                            } catch (e) {
                                                // ignore error
                                            }
                                        }

                                        let displayTags = article?.tags || [];

                                        if (translations && translations[lang] && Array.isArray(translations[lang].tags)) {
                                            displayTags = translations[lang].tags;
                                        }

                                        if (!displayTags || displayTags.length === 0) return null;

                                        return (
                                            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
                                                {displayTags.map((tag: string, idx: number) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ArticleModal;
