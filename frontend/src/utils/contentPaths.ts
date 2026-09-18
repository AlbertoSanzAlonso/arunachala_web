export type PublicContentType = 'article' | 'meditation' | 'announcement' | string;

export function getContentListPath(type: PublicContentType): string {
    if (type === 'meditation') return '/meditaciones';
    if (type === 'announcement') return '/noticias';
    return '/blog';
}

export function getContentDetailPath(type: PublicContentType, slug: string, page?: number): string {
    const base =
        type === 'meditation'
            ? `/meditaciones/${slug}`
            : type === 'announcement'
              ? `/noticias/${slug}`
              : `/blog/${slug}`;

    if (page && page > 1) {
        return `${base}?p=${page}`;
    }
    return base;
}
