import { prepareMarkdown, fixMediaUrls, isHtmlContent } from 'utils/markdownUtils';
import {
    XMarkIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { getTranslated } from 'utils/translate';
import { getImageUrl } from 'utils/imageUtils';
import ShareButton from 'components/ui/ShareButton';
import ReactMarkdown from 'react-markdown';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import remarkGfm from 'remark-gfm';
import omSymbol from 'assets/images/om_symbol.png';

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

    const prepareArticleContent = (content: string) => {
        if (!content) return { processed: '', isHtml: false };
        
        const isHtml = isHtmlContent(content);
        let processed = prepareMarkdown(content);

        if (isHtml) {
            return {
                processed: fixMediaUrls(processed),
                isHtml: true
            };
        }

        // Pure Markdown path - Strip leading H1
        let markdown = processed.replace(/^#\s+.+(\n|$)/, '').trim();

        return { 
            processed: fixMediaUrls(markdown), 
            isHtml: false
        };
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose} initialFocus={contentRef}>
                <Transition.Child
                    as="div"
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
                            as="div"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                            className="w-full max-w-4xl transform overflow-hidden rounded-[2rem] bg-white text-left align-middle shadow-2xl transition-all relative"
                        >
                            <Dialog.Panel as="div">

                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    <ShareButton
                                        url={`/blog/${article.slug}`}
                                        title={translatedTitle}
                                        text={t('blog.share_text', 'Mira este artículo en Arunachala Yoga')}
                                        className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-forest hover:bg-white shadow-sm transition-all focus:outline-none"
                                        iconClassName="w-6 h-6"
                                    />
                                    <button
                                        ref={closeButtonRef}
                                        onClick={onClose}
                                        className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-800 hover:bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest/20"
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Header Image */}
                                <div className="h-64 md:h-80 bg-forest/10 relative overflow-hidden">
                                    {article.thumbnail_url && !article.thumbnail_url.includes('om_symbol.webp') && !article.thumbnail_url.includes('logo_icon.webp') ? (
                                        <img
                                            src={getImageUrl(article.thumbnail_url)}
                                            alt={translatedTitle}
                                            className="w-full h-full object-contain bg-white"
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
                                                target.src = article.category === 'yoga' ? omSymbol : '/logo_icon.webp';
                                                target.className = "w-48 h-48 object-contain opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest/20 to-matcha/20 px-10">
                                            {article.category === 'yoga' ? (
                                                <img src={omSymbol} alt="Yoga" className="w-48 h-48 object-contain opacity-30" />
                                            ) : (
                                                <img src={'/logo_icon.webp'} alt="Terapia" className="w-48 h-48 object-contain opacity-30" />
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <span className="inline-block bg-forest text-white px-4 py-2 rounded-full text-sm font-headers tracking-wider mb-3">
                                            {getCategoryLabel(article.category)}
                                        </span>
                                        {/* REMOVED DUPLICATE TITLE IN OVERLAY */}
                                    </div>
                                </div>

                                {/* Content */}
                                <div
                                    key={`article-content-${article.id}`}
                                    ref={contentRef}
                                    className="p-6 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar focus:outline-none"
                                    tabIndex={-1}
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
                                    <div className="rich-text-content">
                                        {(() => {
                                                const { processed, isHtml } = prepareArticleContent(translatedBody || '');

                                                if (isHtml) {
                                                    return <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-headers prose-headings:text-forest prose-img:rounded-3xl prose-img:shadow-lg" dangerouslySetInnerHTML={{ __html: processed }} />;
                                                } else {
                                                    return (
                                                        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-headers prose-headings:text-forest prose-img:rounded-3xl prose-img:shadow-lg">
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {processed}
                                                            </ReactMarkdown>
                                                        </div>
                                                    );
                                                }
                                            })()}
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
                                                ? t('blog.cta.description_therapy', 'Ven a cuidar de ti en Arunachala. Un espacio de sanación y calma en Cornellá.')
                                                : t('blog.cta.description_yoga', 'Ven a practicar con nosotros en Arunachala. Un espacio de calma en el corazón de Cornellá.')
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
                            <style>{`
                /* Perfect WYSIWYG Parity - Modal & Editor */
                .rich-text-content { 
                    font-family: "Mulish", sans-serif; 
                    color: #5D4037; 
                    font-size: 1.125rem; 
                    line-height: 1.7;
                }
                .rich-text-content h1 { font-size: 2.25rem; line-height: 1.2; margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 700; color: #2F4F4F; font-family: "Cormorant Garamond", serif; }
                .rich-text-content h2 { font-size: 1.875rem; line-height: 1.3; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; color: #2F4F4F; font-family: "Cormorant Garamond", serif; }
                .rich-text-content h3 { font-size: 1.5rem; line-height: 1.4; margin-top: 1.25rem; margin-bottom: 0.5rem; font-weight: 600; color: #2F4F4F; font-family: "Cormorant Garamond", serif; }
                .rich-text-content p { margin-bottom: 1.25rem; }
                
                /* Lists */
                .rich-text-content ul, .rich-text-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .rich-text-content li { margin-bottom: 0.5rem; }
                .rich-text-content ol[data-list="bullet"],
                .rich-text-content ul[data-list="bullet"] { list-style-type: disc; }
                .rich-text-content li[data-list="bullet"] { list-style-type: disc; }
                .rich-text-content li[data-list="ordered"] { list-style-type: decimal; }
                
                /* Quill Indentation (1-9) */
                .rich-text-content .ql-indent-1 { padding-left: 3em; }
                .rich-text-content .ql-indent-2 { padding-left: 6em; }
                .rich-text-content .ql-indent-3 { padding-left: 9em; }
                
                /* Alignment */
                .rich-text-content .ql-align-center { text-align: center; }
                .rich-text-content .ql-align-right { text-align: right; }
                .rich-text-content .ql-align-justify { text-align: justify; }

                .rich-text-content strong, .rich-text-content b { font-weight: 700; color: #2F4F4F; }
                .rich-text-content em, .rich-text-content i { font-style: italic; }
                .rich-text-content blockquote { 
                    border-left: 4px solid #8FBC8F; 
                    padding-left: 1.5rem; 
                    font-style: italic; 
                    margin: 1.5rem 0; 
                    color: #5D4037;
                }
                .rich-text-content img { border-radius: 1rem; margin: 1.5rem auto; max-width: 100%; height: auto; display: block; }
                .rich-text-content pre { background: #f5f5f0; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; margin-bottom: 1.25rem; font-size: 0.9em; font-family: monospace; }
            `}</style>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ArticleModal;
