
export interface Content {
    id: number;
    title: string;
    slug: string;
    type: 'article' | 'meditation' | 'service' | 'announcement';
    category?: 'yoga' | 'therapy' | 'general';
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    excerpt?: string;
    body?: string;
    thumbnail_url?: string;
    media_url?: string;
    tags?: string[] | string;
    author?: {
        id: number;
        first_name: string;
        last_name?: string;
    };
    author_id?: number;
    translations?: any;
}

export const ITEMS_PER_PAGE = 10;

export type TabType = 'all' | 'yoga_article' | 'therapy_article' | 'meditation' | 'announcement';

export const TABS: { name: string; value: TabType }[] = [
    { name: 'Todos', value: 'all' },
    { name: 'Artículos Yoga', value: 'yoga_article' },
    { name: 'Artículos Terapia', value: 'therapy_article' },
    { name: 'Meditaciones', value: 'meditation' },
    { name: 'Noticias', value: 'announcement' },
];
