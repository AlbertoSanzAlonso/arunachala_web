const PUBLIC_ACTIVITY_TYPES = new Set(['taller', 'curso', 'evento', 'retiro']);

export function activityPublicPath(activity: {
    id: number;
    slug?: string | null;
    type?: string | null;
}): string {
    const slug = activity.slug?.trim();
    if (
        slug &&
        !slug.includes('sugerencia') &&
        !!activity.type &&
        PUBLIC_ACTIVITY_TYPES.has(activity.type)
    ) {
        return `/actividades/${slug}/`;
    }
    return `/actividades/?activity=${activity.id}`;
}
