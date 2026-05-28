/**
 * Post-build: genera un index.html por ruta con <title>, meta, canonical y OG únicos.
 * Vercel (trailingSlash) sirve cada carpeta como página estática para rastreadores.
 */
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.yogayterapiasarunachala.es';
const BUILD_DIR = path.join(__dirname, '../build');
const INDEX_PATH = path.join(BUILD_DIR, 'index.html');
const STATIC_ROUTES_PATH = path.join(__dirname, 'static-routes.json');
const API_URL = process.env.PRERENDER_API_URL || 'https://api.yogayterapiasarunachala.es';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectMeta(html, route) {
  const canonical = `${BASE_URL}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const robots = route.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large';

  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`
  );
  out = out.replace(
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${robots}" />`
  );
  out = out.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  out = out.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );
  out = out.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  );
  out = out.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  out = out.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  if (out.includes('rel="canonical"')) {
    out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, canonicalTag);
  } else {
    out = out.replace('</head>', `    ${canonicalTag}\n</head>`);
  }

  return out;
}

function routeToDir(routePath) {
  if (routePath === '/') return BUILD_DIR;
  const segments = routePath.replace(/^\/|\/$/g, '').split('/');
  return path.join(BUILD_DIR, ...segments);
}

async function fetchContentRoutes() {
  const routes = [];
  try {
    const res = await fetch(`${API_URL}/api/content?status=published`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    for (const item of items) {
      if (!item.slug || String(item.slug).includes('sugerencia')) continue;
      const prefix = item.type === 'meditation' ? '/meditaciones' : '/blog';
      const excerpt =
        (item.excerpt && String(item.excerpt).trim()) ||
        (item.meta_description && String(item.meta_description).trim()) ||
        `Contenido de bienestar en Arunachala Yoga y Terapias, Cornellà.`;
      const title = `${item.title} | Arunachala Yoga y Terapias`;

      routes.push({
        path: `${prefix}/${item.slug}/`,
        title,
        description: excerpt.slice(0, 160),
      });
    }
    console.log(`prerender-meta: ${routes.length} rutas (blog/meditaciones)`);
  } catch (err) {
    console.warn(`prerender-meta: sin rutas blog/meditaciones (${err.message})`);
  }
  return routes;
}

/** Rutas con query (?slug=) solo para seo-routes.json / seo-bootstrap (sin HTML propio). */
async function fetchActivityMetaRoutes() {
  const routes = [];
  try {
    const res = await fetch(`${API_URL}/api/activities`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const activities = await res.json();

    for (const act of activities) {
      if (!act.slug || String(act.slug).includes('sugerencia') || act.is_active === false) continue;
      const title = act.title || 'Actividad';
      const description = (
        (act.description && String(act.description).replace(/<[^>]+>/g, ' ').trim()) ||
        `Actividad de bienestar en Arunachala Yoga y Terapias, Cornellà.`
      ).slice(0, 160);

      routes.push({
        path: `/actividades/?slug=${act.slug}`,
        title: `${title} | Arunachala Yoga y Terapias`,
        description,
      });
    }
    console.log(`prerender-meta: ${routes.length} meta rutas (actividades con slug)`);
  } catch (err) {
    console.warn(`prerender-meta: sin meta actividades (${err.message})`);
  }
  return routes;
}

async function main() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('prerender-meta: no existe build/index.html — ejecuta npm run build antes');
    process.exit(1);
  }

  const template = fs.readFileSync(INDEX_PATH, 'utf8');
  const staticRoutes = JSON.parse(fs.readFileSync(STATIC_ROUTES_PATH, 'utf8'));
  const contentRoutes = await fetchContentRoutes();
  const activityMetaRoutes = await fetchActivityMetaRoutes();
  const htmlRoutes = [...staticRoutes, ...contentRoutes];
  const allRoutes = [...htmlRoutes, ...activityMetaRoutes];

  const seen = new Set();
  let written = 0;

  for (const route of htmlRoutes) {
    if (seen.has(route.path)) continue;
    seen.add(route.path);

    const html = injectMeta(template, route);
    const dir = routeToDir(route.path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    written++;
  }

  fs.writeFileSync(
    path.join(BUILD_DIR, 'seo-routes.json'),
    JSON.stringify(allRoutes),
    'utf8'
  );

  console.log(`prerender-meta: ${written} archivos index.html, ${allRoutes.length} entradas en seo-routes.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
