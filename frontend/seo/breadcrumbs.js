/**
 * Fuente compartida para BreadcrumbList (prerender post-build).
 * Mantener en sync con src/utils/seoBreadcrumbs.ts
 */
const SEO_BASE_URL = 'https://www.yogayterapiasarunachala.es';

const HOME = { name: 'Inicio', path: '/' };

const STATIC_BREADCRUMBS = {
  '/clases-de-yoga/': [HOME, { name: 'Clases de Yoga', path: '/clases-de-yoga/' }],
  '/terapias-y-masajes/': [HOME, { name: 'Terapias y Masajes', path: '/terapias-y-masajes/' }],
  '/terapias/masajes/': [
    HOME,
    { name: 'Terapias y Masajes', path: '/terapias-y-masajes/' },
    { name: 'Masajes', path: '/terapias/masajes/' },
  ],
  '/terapias/terapias-holisticas/': [
    HOME,
    { name: 'Terapias y Masajes', path: '/terapias-y-masajes/' },
    { name: 'Terapias Holísticas', path: '/terapias/terapias-holisticas/' },
  ],
  '/blog/': [HOME, { name: 'Blog', path: '/blog/' }],
  '/blog/yoga/': [HOME, { name: 'Blog', path: '/blog/' }, { name: 'Yoga', path: '/blog/yoga/' }],
  '/blog/therapy/': [HOME, { name: 'Blog', path: '/blog/' }, { name: 'Terapias', path: '/blog/therapy/' }],
  '/blog/general/': [HOME, { name: 'Blog', path: '/blog/' }, { name: 'General', path: '/blog/general/' }],
  '/galeria/clases-de-yoga/': [
    HOME,
    { name: 'Clases de Yoga', path: '/clases-de-yoga/' },
    { name: 'Galería', path: '/galeria/clases-de-yoga/' },
  ],
  '/galeria/terapias-y-masajes/': [
    HOME,
    { name: 'Terapias y Masajes', path: '/terapias-y-masajes/' },
    { name: 'Galería', path: '/galeria/terapias-y-masajes/' },
  ],
  '/actividades/': [HOME, { name: 'Actividades', path: '/actividades/' }],
  '/nuestro-espacio/': [HOME, { name: 'Nuestro Espacio', path: '/nuestro-espacio/' }],
  '/quienes-somos/': [HOME, { name: 'Quiénes Somos', path: '/quienes-somos/' }],
  '/contacto/': [HOME, { name: 'Contacto', path: '/contacto/' }],
  '/meditaciones/': [HOME, { name: 'Meditaciones', path: '/meditaciones/' }],
  '/promociones/': [HOME, { name: 'Promociones', path: '/promociones/' }],
  '/aviso-legal/': [HOME, { name: 'Aviso Legal', path: '/aviso-legal/' }],
  '/politica-de-privacidad/': [HOME, { name: 'Política de Privacidad', path: '/politica-de-privacidad/' }],
};

function normalizeSeoPath(pathname) {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_BASE_URL}${item.path === '/' ? '/' : item.path}`,
    })),
  };
}

function resolveBreadcrumbs(pathname, current) {
  const path = normalizeSeoPath(pathname);
  if (path === '/') return null;

  const exact = STATIC_BREADCRUMBS[path];
  if (exact) {
    if (current && exact[exact.length - 1].path !== current.path) {
      return [...exact, current];
    }
    return exact;
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)\/$/);
  if (blogMatch && !['yoga', 'therapy', 'general'].includes(blogMatch[1])) {
    const base = STATIC_BREADCRUMBS['/blog/'];
    if (current) return [...base, current];
    return [...base, { name: blogMatch[1].replace(/-/g, ' '), path }];
  }

  const meditationMatch = path.match(/^\/meditaciones\/([^/]+)\/$/);
  if (meditationMatch) {
    const base = STATIC_BREADCRUMBS['/meditaciones/'];
    if (current) return [...base, current];
    return [...base, { name: meditationMatch[1].replace(/-/g, ' '), path }];
  }

  return current ? [HOME, current] : null;
}

module.exports = {
  buildBreadcrumbSchema,
  resolveBreadcrumbs,
};
