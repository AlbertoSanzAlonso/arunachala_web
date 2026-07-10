/**
 * Genera seo-routes.json y sitemap-links.html en public/ antes del build.
 * Usa la API de producción por defecto; override con REACT_APP_API_URL.
 */
const fs = require('fs');
const path = require('path');

const API_BASE = (process.env.REACT_APP_API_URL || 'https://api.yogayterapiasarunachala.es').replace(/\/$/, '');
const BASE_URL = 'https://www.yogayterapiasarunachala.es';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const STATIC_ROUTES = [
  {
    path: '/',
    title: 'Arunachala Yoga y Terapias | Centro de Bienestar en Cornellà',
    description:
      'Centro de Yoga, Terapias y Masajes en Cornellà de Llobregat. Clases de Hatha Yoga, sesiones de Ayurveda y masajes profesionales para el bienestar integral dirigido por Susana Pérez Gil.',
  },
  {
    path: '/clases-de-yoga/',
    title: 'Clases de Yoga en Barcelona | Aruṇāchala',
    description:
      'Descubre nuestras clases de yoga en Cornellà de Llobregat. Hatha Yoga, Vinyasa y meditación para todos los niveles.',
  },
  {
    path: '/terapias-y-masajes/',
    title: 'Masaje y Terapias en Cornellà | Arunachala Yoga y Terapias',
    description:
      'Centro de masajes y terapias holísticas en Cornellà de Llobregat: masaje tailandés, reiki, terapia floral y más con Susana Pérez Gil en Aruṇāchala.',
  },
  {
    path: '/terapias/masajes/',
    title: 'Masajes terapéuticos en Cornellà | Arunachala Yoga y Terapias',
    description:
      'Masajes terapéuticos, tailandés, deportivo y relajante en Aruṇāchala Cornellà. Libera tensiones y recupera vitalidad con Susana Pérez Gil.',
  },
  {
    path: '/terapias/terapias-holisticas/',
    title: 'Terapias holísticas en Cornellà | Arunachala Yoga y Terapias',
    description:
      'Reiki, técnica metamórfica, terapia floral y más en Aruṇāchala Cornellà. Acompañamiento en tu proceso de sanación y autoconocimiento.',
  },
  {
    path: '/actividades/',
    title: 'Actividades y cursos en Cornellà | Arunachala Yoga y Terapias',
    description:
      'Talleres, cursos, retiros y eventos de yoga y bienestar en Aruṇāchala Cornellà. Consulta fechas, precios y reserva tu plaza.',
  },
  {
    path: '/blog/',
    title: 'Blog | Aruṇāchala Yoga y Terapias',
    description:
      'Descubre artículos sobre yoga, meditación, terapias holísticas y bienestar en nuestro blog.',
  },
  {
    path: '/blog/yoga/',
    title: 'Blog de Yoga | Arunachala Yoga y Terapias',
    description: 'Artículos, consejos y reflexiones sobre la práctica del yoga en Cornellà y bienestar integral.',
  },
  {
    path: '/blog/therapy/',
    title: 'Blog de Terapias | Arunachala Yoga y Terapias',
    description: 'Artículos sobre terapias holísticas, masajes y bienestar en Aruṇāchala Cornellà.',
  },
  {
    path: '/blog/general/',
    title: 'Blog General | Arunachala Yoga y Terapias',
    description: 'Reflexiones, noticias y contenido general sobre yoga, meditación y bienestar.',
  },
  {
    path: '/nuestro-espacio/',
    title: 'Nuestro Espacio | Arunachala Yoga y Terapias',
    description: 'Conoce el centro Aruṇāchala en Cornellà de Llobregat: un espacio acogedor para yoga, terapias y bienestar.',
  },
  {
    path: '/meditaciones/',
    title: 'Meditaciones | Arunachala Yoga y Terapias',
    description: 'Escucha meditaciones guiadas de Aruṇāchala Yoga y Terapias para tu práctica diaria.',
  },
  {
    path: '/promociones/',
    title: 'Promociones | Arunachala Yoga y Terapias',
    description: 'Ofertas y promociones en clases de yoga, masajes y terapias en Aruṇāchala Cornellà.',
  },
  {
    path: '/quienes-somos/',
    title: 'Quiénes Somos | Arunachala Yoga y Terapias',
    description: 'Conoce a Susana Pérez Gil y el equipo de Aruṇāchala, centro de yoga y terapias en Cornellà.',
  },
  {
    path: '/contacto/',
    title: 'Contacto | Yoga y Terapias Aruṇāchala Cornellà',
    description:
      'Contacta con Aruṇāchala Yoga en Cornellà. Reserva tu clase de yoga o sesión de terapia. Estamos en Pasaje de Mateo Oliva, 3.',
  },
  {
    path: '/galeria/clases-de-yoga/',
    title: 'Galería de Yoga | Arunachala Yoga y Terapias',
    description: 'Imágenes de nuestras clases de yoga y del espacio Aruṇāchala en Cornellà.',
  },
  {
    path: '/galeria/terapias-y-masajes/',
    title: 'Galería de Terapias | Arunachala Yoga y Terapias',
    description: 'Galería de fotos de masajes y terapias holísticas en Aruṇāchala Cornellà.',
  },
  {
    path: '/aviso-legal/',
    title: 'Aviso Legal | Arunachala Yoga y Terapias',
    description: 'Aviso legal del sitio web de Arunachala Yoga y Terapias.',
  },
  {
    path: '/politica-de-privacidad/',
    title: 'Política de Privacidad | Arunachala Yoga y Terapias',
    description: 'Política de privacidad y protección de datos de Arunachala Yoga y Terapias.',
  },
];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
}

function truncate(text, max = 160) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trim()}…`;
}

function contentRoutes(items, prefix) {
  return items
    .filter((item) => item.slug && item.status !== 'draft' && !item.slug.includes('sugerencia'))
    .map((item) => ({
      path: `${prefix}/${item.slug}/`,
      title: `${item.seo_title || item.title} | Arunachala Yoga y Terapias`,
      description: truncate(item.seo_description || item.excerpt || item.title),
    }));
}

function activityRoutes(activities) {
  return activities
    .filter((act) => act.slug && act.is_active !== false && !act.slug.includes('sugerencia'))
    .map((act) => ({
      path: `/actividades/?slug=${act.slug}`,
      title: `${act.title} | Arunachala Yoga y Terapias`,
      description: truncate(act.description || act.title),
    }));
}

function buildLinksHtml(routes) {
  const sections = {
    'Páginas principales': routes.filter((r) => !r.path.startsWith('/blog/') && !r.path.startsWith('/meditaciones/') && !r.path.includes('?slug=')),
    'Artículos del blog': routes.filter((r) => r.path.startsWith('/blog/') && r.path !== '/blog/' && !r.path.startsWith('/blog/yoga') && !r.path.startsWith('/blog/therapy') && !r.path.startsWith('/blog/general')),
    Meditaciones: routes.filter((r) => r.path.startsWith('/meditaciones/') && r.path !== '/meditaciones/'),
    Actividades: routes.filter((r) => r.path.includes('?slug=')),
  };

  const lists = Object.entries(sections)
    .filter(([, items]) => items.length > 0)
    .map(
      ([title, items]) => `
    <section>
      <h2>${title}</h2>
      <ul>
        ${items.map((r) => `<li><a href="${BASE_URL}${r.path}">${r.title.replace(' | Arunachala Yoga y Terapias', '')}</a></li>`).join('\n        ')}
      </ul>
    </section>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Mapa del sitio | Arunachala Yoga y Terapias</title>
  <meta name="description" content="Índice de todas las páginas públicas de Arunachala Yoga y Terapias en Cornellà." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${BASE_URL}/sitemap-links.html" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 48rem; margin: 2rem auto; padding: 0 1rem; color: #2F4F4F; }
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; }
    ul { line-height: 1.8; padding-left: 1.25rem; }
    a { color: #5c6b3c; }
  </style>
</head>
<body>
  <h1>Mapa del sitio</h1>
  <p>Índice de páginas de <a href="${BASE_URL}/">Arunachala Yoga y Terapias</a>.</p>
  ${lists}
</body>
</html>`;
}

async function main() {
  console.log(`SEO: fetching content from ${API_BASE}...`);

  const [articles, meditations, activities] = await Promise.all([
    fetchJson(`${API_BASE}/api/content?type=article&status=published`),
    fetchJson(`${API_BASE}/api/content?type=meditation&status=published`),
    fetchJson(`${API_BASE}/api/activities/`),
  ]);

  const routes = [
    ...STATIC_ROUTES,
    ...contentRoutes(articles, '/blog'),
    ...contentRoutes(meditations, '/meditaciones'),
    ...activityRoutes(activities),
  ];

  fs.writeFileSync(path.join(PUBLIC_DIR, 'seo-routes.json'), JSON.stringify(routes, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-links.html'), buildLinksHtml(routes));

  console.log(`SEO: generated ${routes.length} routes → seo-routes.json, sitemap-links.html`);
}

main().catch((err) => {
  console.warn('SEO: could not fetch API, writing static routes only:', err.message);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'seo-routes.json'), JSON.stringify(STATIC_ROUTES, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-links.html'), buildLinksHtml(STATIC_ROUTES));
});
