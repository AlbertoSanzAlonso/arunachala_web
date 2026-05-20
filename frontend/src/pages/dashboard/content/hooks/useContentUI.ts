
import { useState, useCallback } from 'react';
import { marked } from 'marked';
import { Content, TabType } from '../types';
import { prepareMarkdown, isHtmlContent } from '../../../../utils/markdownUtils';

export const useContentUI = (currentTab: TabType) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [editorSalt, setEditorSalt] = useState('');
    const [showPublicationPrompt, setShowPublicationPrompt] = useState(false);
    const [lastCreatedContent, setLastCreatedContent] = useState<Content | null>(null);

    // Crop State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    // Modal Confirmation States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contentToDelete, setContentToDelete] = useState<number | null>(null);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);

    const [formData, setFormData] = useState<Partial<Content>>({
        title: '',
        type: 'article',
        category: 'yoga',
        status: 'draft',
        body: '',
        excerpt: '',
        thumbnail_url: '',
        media_url: '',
        tags: []
    });

    const handleOpenModal = useCallback((content?: Content) => {
        if (content) {
            setEditingContent(content);
            let body = content.body || '';

            if (body && !isHtmlContent(body)) {
                body = prepareMarkdown(body);
                const bodyWithoutH1 = body.replace(/^#\s+.+(\n|$)/, '').trim();
                const isMarkdown = /^#\s/m.test(body) || /[*_]/.test(body) || /\[.+\]\(.+\)/.test(body) || /^##+\s/m.test(body) || /^\s*[-*]\s+/m.test(body);
                if (isMarkdown) {
                    body = marked.parse(bodyWithoutH1) as string;
                } else {
                    body = bodyWithoutH1.trim().split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
                }
            }

            const normalizedTranslations = content.translations ? { ...content.translations } : {};
            Object.keys(normalizedTranslations).forEach(lang => {
                const trans = normalizedTranslations[lang];
                if (trans && trans.body && !isHtmlContent(trans.body)) {
                    normalizedTranslations[lang] = {
                        ...trans,
                        body: marked.parse(prepareMarkdown(trans.body)) as string
                    };
                }
            });

            let excerpt = content.excerpt || '';
            if (excerpt && (excerpt.includes('**') || excerpt.includes('##') || excerpt.includes('_'))) {
                 excerpt = excerpt.replace(/\*\*|_|##+\s/g, '').trim();
            }
            
            const normalizedTags = Array.isArray(content.tags) 
                ? content.tags 
                : (typeof content.tags === 'string' ? JSON.parse(content.tags) : []);
            
            const thumbnail_url =
                content.thumbnail_url?.startsWith('blob:') || content.thumbnail_url?.startsWith('file:')
                    ? ''
                    : (content.thumbnail_url || '');
            const media_url =
                content.media_url?.startsWith('blob:') || content.media_url?.startsWith('file:')
                    ? ''
                    : (content.media_url || '');

            setEditorSalt(Math.random().toString(36).substring(7));
            setFormData({ ...content, body, excerpt, tags: normalizedTags, translations: normalizedTranslations, thumbnail_url, media_url });
        } else {
            setEditingContent(null);
            setEditorSalt(Math.random().toString(36).substring(7));
            setFormData({
                title: '',
                type: currentTab === 'meditation' ? 'meditation' : (currentTab === 'announcement' ? 'announcement' : 'article'),
                category: currentTab === 'yoga_article' ? 'yoga' : (currentTab === 'therapy_article' ? 'therapy' : 'yoga'),
                status: 'draft',
                body: '',
                excerpt: '',
                thumbnail_url: '',
                media_url: '',
                tags: [],
                translations: {}
            });
        }
        setIsModalOpen(true);
    }, [currentTab]);

    const openDeleteModal = useCallback((id?: number) => {
        if (id) setContentToDelete(id);
        setIsDeleteModalOpen(true);
    }, []);

    return {
        isModalOpen, setIsModalOpen,
        editingContent, setEditingContent,
        editorSalt, setEditorSalt,
        showPublicationPrompt, setShowPublicationPrompt,
        lastCreatedContent, setLastCreatedContent,
        imageSrc, setImageSrc,
        isCropModalOpen, setIsCropModalOpen,
        isDeleteModalOpen, setIsDeleteModalOpen,
        contentToDelete, setContentToDelete,
        showCloseConfirm, setShowCloseConfirm,
        formData, setFormData,
        handleOpenModal,
        openDeleteModal
    };
};
