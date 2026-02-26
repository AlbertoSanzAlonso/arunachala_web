import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
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
    const contentRef = React.useRef<HTMLDivElement>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (isOpen && contentRef.current) {
            // Function to force scroll to top
            const resetScroll = () => {
                if (contentRef.current) {
                    contentRef.current.scrollTop = 0;
                }
            };

            // Immediate reset
            resetScroll();

            // Multiple attempts to handle different loading stages/rendering cycles
            const t1 = setTimeout(resetScroll, 0);
            const t2 = setTimeout(resetScroll, 50);
            const t3 = setTimeout(resetScroll, 200);

            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
            };
        }
    }, [isOpen, article?.id, article?.body]);

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

        // Fix image URLs inline (Markdown: ![alt](/static/...) -> ![alt](https://.../static/...))
        cleaned = cleaned.replace(/(!\[.*?\]\()([^)]+)(\))/g, (match, p1, p2, p3) => {
            return `${p1}${getImageUrl(p2)}${p3}`;
        });

        // Fix HTML images (<img src="/static/..." /> -> <img src="https://.../static/..." />)
        cleaned = cleaned.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (match, p1, p2, p3) => {
            return `${p1}${getImageUrl(p2)}${p3}`;
        });

        return cleaned;
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose} initialFocus={closeButtonRef}>
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
                                    ref={closeButtonRef}
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-800 hover:bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest/20"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>

                                {/* Header Image */}
                                <div className="h-64 md:h-80 bg-forest/10 relative overflow-hidden">
                                    {article.thumbnail_url && !article.thumbnail_url.includes('om_symbol.webp') && !article.thumbnail_url.includes('lotus_flower.webp') ? (
                                        <img
                                            src={getImageUrl(article.thumbnail_url)}
                                            alt={translatedTitle}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (target.getAttribute('data-fallback')) {
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        const fileName = article.thumbnail_url?.split('/').pop() || 'Imagen';
                                                        const errDiv = document.createElement('div');
                                                        errDiv.className = "w-full h-full flex items-center justify-center p-8 text-center text-sm text-white/50 italic break-all px-20";
                                                        errDiv.innerText = fileName;
                                                        parent.appendChild(errDiv);
                                                    }
                                                    return;
                                                }
                                                target.setAttribute('data-fallback', 'true');
                                                target.src = article.category === 'yoga'
                                                    ? getImageUrl('/static/gallery/articles/om_symbol.webp')
                                                    : getImageUrl('/static/gallery/articles/lotus_flower.webp');
                                                target.className = "w-48 h-48 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest/20 to-matcha/20 px-10">
                                            {(article.category === 'yoga' || (article.thumbnail_url && article.thumbnail_url.includes('om_symbol.webp'))) ? (
                                                <img src={getImageUrl('/static/gallery/articles/om_symbol.webp')} alt="Yoga" className="w-48 h-48 object-contain opacity-30" />
                                            ) : (article.category === 'therapy' || (article.thumbnail_url && article.thumbnail_url.includes('lotus_flower.webp'))) ? (
                                                <img src={getImageUrl('/static/gallery/articles/lotus_flower.webp')} alt="Terapia" className="w-48 h-48 object-contain opacity-30" />
                                            ) : (
                                                <TagIcon className="w-20 h-20 text-forest/30" />
                                            )}
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
                                <div
                                    key={`article-content-${article.id}`}
                                    ref={contentRef}
                                    className="p-6 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar"
                                >
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

                                        let displayTags = Array.isArray(article?.tags) ? article.tags : [];

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

                                    {/* Call to Action - Fixed at bottom of article */}
                                    <div className="mt-12 bg-forest/5 rounded-2xl p-8 text-center border border-forest/10">
                                        <h3 className="text-2xl font-headers text-forest mb-4">
                                            {t('blog.cta.title', '¿Te ha inspirado este artículo?')}
                                        </h3>
                                        <p className="text-bark/80 mb-6 max-w-2xl mx-auto">
                                            {article.category === 'therapy'
                                                ? t('blog.cta.description_therapy', 'Ven a cuidar de ti en Arunachala. Un espacio de sanación y calma en Cornellà.')
                                                : t('blog.cta.description_yoga', 'Ven a practicar con nosotros en Arunachala. Un espacio de calma en el corazón de Cornellà.')
                                            }
                                        </p>
                                        <Link
                                            to="/contacto"
                                            onClick={onClose}
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-forest text-white rounded-full font-bold hover:bg-matcha transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                        >
                                            {t('blog.cta.button', 'Reservar mi clase')}
                                        </Link>
                                    </div>
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
