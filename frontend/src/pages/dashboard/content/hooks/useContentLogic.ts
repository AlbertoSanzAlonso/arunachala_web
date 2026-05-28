
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../../../../config';
import { useSearchParams } from 'react-router-dom';
import { Content, TabType, TABS } from '../types';
import { useContentFilters } from './useContentFilters';
import { useContentUI } from './useContentUI';
import { useContentPersistence } from './useContentPersistence';

export const useContentLogic = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Data Fetching
    const { data: contents = [], isLoading: isGlobalLoading } = useQuery<Content[]>({
        queryKey: ['contents'],
        queryFn: async () => {
            const token = sessionStorage.getItem('access_token');
            const response = await fetch(`${API_BASE_URL}/api/content`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error fetching contents');
            return response.json();
        }
    });

    // 2. Specialized Hooks
    const filters = useContentFilters(contents);
    const setFilterTab = filters.setCurrentTab;
    const ui = useContentUI(filters.currentTab);
    const { handleOpenModal } = ui;
    const persistence = useContentPersistence();

    // 3. Selection State (Kept here as it bridges filters and actions)
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(id)) newSelected.delete(id);
            else newSelected.add(id);
            return newSelected;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds(prev => {
            if (prev.size === filters.filteredContents.length) return new Set();
            return new Set(filters.filteredContents.map(c => c.id));
        });
    }, [filters.filteredContents]);

    // 4. Integrated Handlers
    const handleCloseModal = useCallback((open?: boolean) => {
        if (open === true) {
            ui.setIsModalOpen(true);
        } else {
            ui.setIsModalOpen(false);
            setSearchParams({});
        }
    }, [ui, setSearchParams]);

    const onSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        persistence.handleSave(ui.formData, ui.editingContent, (data) => {
            handleCloseModal(); // This handles closing and clearing URL params
            if (!ui.editingContent && ui.formData.status === 'draft') {
                ui.setLastCreatedContent(data);
                ui.setShowPublicationPrompt(true);
            }
        });
    }, [persistence, ui, handleCloseModal]);

    const onDelete = useCallback(() => {
        persistence.handleDelete(ui.contentToDelete, selectedIds, () => {
            ui.setIsDeleteModalOpen(false);
            ui.setContentToDelete(null);
            setSelectedIds(new Set());
        });
    }, [persistence, ui, selectedIds]);

    const onQuickPublish = useCallback(() => {
        if (ui.lastCreatedContent) {
            persistence.handleQuickPublish(ui.lastCreatedContent.id, () => {
                ui.setShowPublicationPrompt(false);
            });
        }
    }, [persistence, ui]);

    // 5. Tab from URL (?tab=meditation, etc.)
    const tabFromUrl = searchParams.get('tab');

    const setCurrentTab = useCallback((tab: TabType) => {
        setFilterTab(tab);
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (tab === 'all') {
                next.delete('tab');
            } else {
                next.set('tab', tab);
            }
            return next;
        }, { replace: true });
    }, [setFilterTab, setSearchParams]);

    useEffect(() => {
        if (!tabFromUrl) return;
        const isValidTab = TABS.some(t => t.value === tabFromUrl);
        if (isValidTab) {
            setFilterTab(tabFromUrl as TabType);
        }
    }, [tabFromUrl, setFilterTab]);

    // 6. Auto-open logic from URL
    const initialSlug = searchParams.get('slug');
    const initialEditId = searchParams.get('edit');

    useEffect(() => {
        if (contents.length > 0) {
            if (initialSlug) {
                const content = contents.find(c => c.slug === initialSlug);
                if (content) handleOpenModal(content);
            } else if (initialEditId) {
                const content = contents.find(c => String(c.id) === String(initialEditId));
                if (content) handleOpenModal(content);
            }
        }
    }, [contents, initialSlug, initialEditId, handleOpenModal]);

    return {
        // Data & Loading
        contents,
        isGlobalLoading,
        ...filters,
        setCurrentTab,
        ...ui,
        ...persistence,
        
        // Selection
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        
        // Overridden Handlers (to include local state logic)
        handleSave: onSave,
        handleDelete: onDelete,
        handleQuickPublish: onQuickPublish,
        setIsModalOpen: handleCloseModal,
        handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => 
            persistence.handleFileUpload(e, (url) => ui.setFormData(prev => ({ ...prev, media_url: url }))),
        handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                ui.setImageSrc(reader.result as string);
                ui.setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };
};
