export interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body?: string;
    category: string;
    thumbnail_url: string | null;
    tags: string[];
    created_at: string;
    updated_at?: string | null;
    prev_slug?: string | null;
    next_slug?: string | null;
    translations?: any;
    seo_title?: string | null;
    seo_description?: string | null;
}
