/**
 * Prerenderizado estático post-build (SSG).
 * Genera archivos .html con el texto real de cada artículo para que Google lo indexe
 * sin depender de JavaScript. Equivalente a react-snap pero sin Puppeteer.
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const API_BASE = (process.env.REACT_APP_API_URL || 'https://api.yogayterapiasarunachala.es').replace(/\/$/, '');
const SITE_BASE = 'https://www.yogayterapiasarunachala.es';

const PRIVATE_PREFIXES = ['/dashboard', '/login', '/forgot-password', '/reset-password', '/newsletter', '/unsubscribe', '/confirmar-suscripcion'];

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function prepareMarkdown(content) {
  if (!content) return '';
  return content
    .replace(/\\n/g, '\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\[(imagen|image|img|foto)_?\d*\]/gi, '')
    .trim();
}

function fixMediaUrls(content) {
  if (!content) return '';
  let fixed = content;
  fixed = fixed.replace(/(!\[.*?\]\()([^)]+)(\))/g, (_, p1, p2, p3) => `${p1}${getImageUrl(p2)}${p3}`);
  fixed = fixed.replace(/(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi, (_, p1, p2, p3) => `${p1}${getImageUrl(p2)}${p3}`);
  return fixed;
}

function isHtmlContent(text) {
  if (!text) return false;
  const trimmed = text.trim();
  return trimmed.startsWith('<') && trimmed.includes('>');
}

function renderBody(rawBody) {
  if (!rawBody) return '';
  const processed = prepareMarkdown(rawBody);
  if (isHtmlContent(processed)) {
    return fixMediaUrls(processed);
  }
  const markdown = processed.replace(/^#\s+.+(\n|$)/, '').trim();
  return marked.parse(fixMediaUrls(markdown));
}

function routeToOutputFile(routePath) {
  const withoutQuery = routePath.split('?')[0];
  const segments = withoutQuery.replace(/\/$/, '').split('/').filter(Boolean);
  if (segments.length === 0) {
    return path.join(BUILD_DIR, 'index.html');
  }
  return path.join(BUILD_DIR, ...segments, 'index.html');
}

function isPrerenderable(routePath) {
  if (routePath.includes('?')) return false;
  return !PRIVATE_PREFIXES.some((prefix) => routePath === `${prefix}/` || routePath.startsWith(`${prefix}/`));
}

function setMeta(html, route) {
  const canonical = `${SITE_BASE}${route.path.split('?')[0]}`;
  let out = html;

  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`],
    [/name="description" content="[^"]*"/, `name="description" content="${escapeHtml(route.description)}"`],
    [/property="og:url" content="[^"]*"/, `property="og:url" content="${canonical}"`],
    [/property="og:title" content="[^"]*"/, `property="og:title" content="${escapeHtml(route.title)}"`],
    [/property="og:description" content="[^"]*"/, `property="og:description" content="${escapeHtml(route.description)}"`],
    [/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${escapeHtml(route.title)}"`],
    [/name="twitter:description" content="[^"]*"/, `name="twitter:description" content="${escapeHtml(route.description)}"`],
    [/name="robots" content="[^"]*"/, `name="robots" content="${route.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'}"`],
  ];

  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }

  if (/<link rel="canonical" href="[^"]*"/.test(out)) {
    out = out.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`);
  } else {
    out = out.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n</head>`);
  }

  return out;
}

function buildArticleLinks(articles, limit = 8) {
  return articles
    .slice(0, limit)
    .map((a) => `<li><a href="/blog/${a.slug}/">${escapeHtml(a.title)}</a></li>`)
    .join('\n            ');
}

function buildHomeExtras(articles) {
  const latest = articles.slice(0, 3);
  const cards = latest
    .map(
      (a) => `
        <article>
          <h3><a href="/blog/${a.slug}/">${escapeHtml(a.title)}</a></h3>
          <p>${escapeHtml(a.excerpt || '')}</p>
        </article>`
    )
    .join('\n');

  return `
    <section aria-label="Últimos artículos del blog">
      <h2>Blog de Yoga y Bienestar</h2>
      ${cards}
      <p><a href="/blog/">Ver todos los artículos</a></p>
    </section>`;
}

function buildBlogIndexExtras(articles) {
  const items = articles
    .map(
      (a) => `
        <article>
          <h2><a href="/blog/${a.slug}/">${escapeHtml(a.title)}</a></h2>
          <p>${escapeHtml(a.excerpt || '')}</p>
        </article>`
    )
    .join('\n');

  return `
    <main>
      <h1>Blog | Arunachala Yoga y Terapias</h1>
      <p>Artículos sobre yoga, meditación, terapias holísticas y bienestar.</p>
      ${items}
    </main>`;
}

function buildArticlePage(article, allArticles) {
  const bodyHtml = renderBody(article.body);
  const related = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 6);

  return `
    <main class="font-body text-bark min-h-screen bg-bone">
      <article class="max-w-4xl mx-auto px-6 py-16">
        <nav><a href="/blog/">← Volver al blog</a> · <a href="/">Inicio</a></nav>
        <p class="text-sm uppercase tracking-widest text-forest/60 mt-6">${escapeHtml(article.category || 'blog')}</p>
        <h1 class="text-4xl font-serif text-forest mt-4 mb-6">${escapeHtml(article.title)}</h1>
        ${article.excerpt ? `<p class="text-lg text-bark/80 mb-8">${escapeHtml(article.excerpt)}</p>` : ''}
        <div class="prose max-w-none">${bodyHtml}</div>
      </article>
      <nav aria-label="Más artículos" class="max-w-4xl mx-auto px-6 pb-16">
        <h2 class="text-xl font-serif text-forest mb-4">Más artículos</h2>
        <ul>
          ${buildArticleLinks(related, 6)}
        </ul>
      </nav>
    </main>`;
}

function buildMeditationPage(item) {
  const bodyHtml = renderBody(item.body);
  return `
    <main class="font-body text-bark min-h-screen bg-bone">
      <article class="max-w-4xl mx-auto px-6 py-16">
        <nav><a href="/meditaciones/">← Meditaciones</a> · <a href="/">Inicio</a></nav>
        <h1 class="text-4xl font-serif text-forest mt-6 mb-6">${escapeHtml(item.title)}</h1>
        ${item.excerpt ? `<p class="text-lg text-bark/80 mb-8">${escapeHtml(item.excerpt)}</p>` : ''}
        <div class="prose max-w-none">${bodyHtml}</div>
      </article>
    </main>`;
}

function isPublicActivity(activity) {
  return (
    activity &&
    activity.slug &&
    activity.is_active !== false &&
    activity.type !== 'sugerencia' &&
    !String(activity.slug).includes('sugerencia')
  );
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function jsonLdScript(data) {
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${payload}</script>`;
}

function buildNewsIndex(news) {
  const items = news
    .filter((item) => item.slug)
    .map(
      (item) => `
        <article>
          <h2><a href="/noticias/${item.slug}/">${escapeHtml(item.title)}</a></h2>
          <p>${escapeHtml(item.excerpt || '')}</p>
        </article>`
    )
    .join('\n');
  return `
    <main>
      <h1>Noticias | Arunachala Yoga y Terapias</h1>
      <p>Noticias y avisos del centro Aruṇāchala en Cornellà.</p>
      ${items}
    </main>`;
}

function buildNewsPage(item, allNews) {
  const related = allNews.filter((entry) => entry.slug && entry.slug !== item.slug).slice(0, 6);
  return `
    <main>
      <article>
        <nav><a href="/noticias/">← Noticias</a> · <a href="/">Inicio</a></nav>
        <h1>${escapeHtml(item.title)}</h1>
        ${item.excerpt ? `<p>${escapeHtml(item.excerpt)}</p>` : ''}
        <div class="prose">${renderBody(item.body)}</div>
      </article>
      <nav>
        <h2>Otras noticias</h2>
        <ul>
          ${related.map((entry) => `<li><a href="/noticias/${entry.slug}/">${escapeHtml(entry.title)}</a></li>`).join('\n')}
        </ul>
      </nav>
    </main>`;
}

function buildActivitiesIndex(activities) {
  const items = activities
    .filter(isPublicActivity)
    .map(
      (activity) => `
        <article>
          <h2><a href="/actividades/${activity.slug}/">${escapeHtml(activity.title)}</a></h2>
          <p>${escapeHtml(plainText(activity.description).slice(0, 220))}</p>
          <p>${escapeHtml(activity.type || '')}${activity.start_date ? ` · ${formatDate(activity.start_date)}` : ''}</p>
        </article>`
    )
    .join('\n');
  return `
    <main>
      <h1>Actividades y cursos en Cornellà</h1>
      <p>Talleres, cursos, retiros y eventos de yoga y bienestar en Aruṇāchala.</p>
      ${items}
    </main>`;
}

function buildActivityPage(activity) {
  const facts = [
    activity.start_date ? `<li>Inicio: ${formatDate(activity.start_date)}</li>` : '',
    activity.end_date ? `<li>Fin: ${formatDate(activity.end_date)}</li>` : '',
    `<li>Lugar: ${escapeHtml(activity.location || 'Centro Arunachala, Cornellà de Llobregat')}</li>`,
    activity.price ? `<li>Precio: ${escapeHtml(activity.price)}</li>` : '',
  ].join('');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: activity.title,
    description: String(activity.description || activity.title).replace(/<[^>]+>/g, ' ').slice(0, 300),
    url: `${SITE_BASE}/actividades/${activity.slug}/`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: activity.location || 'Arunachala Yoga y Terapias',
      address: 'Pasaje de Mateo Oliva 3, 08940 Cornellà de Llobregat, Barcelona',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Arunachala Yoga y Terapias',
      url: SITE_BASE,
    },
  };
  if (activity.start_date) schema.startDate = activity.start_date;
  if (activity.end_date) schema.endDate = activity.end_date;
  return `
    ${jsonLdScript(schema)}
    <main>
      <article>
        <nav><a href="/actividades/">← Actividades</a> · <a href="/">Inicio</a></nav>
        <h1>${escapeHtml(activity.title)}</h1>
        <ul>${facts}</ul>
        <div class="prose">${renderBody(activity.description)}</div>
      </article>
    </main>`;
}

function treatmentBlocks(items) {
  return items
    .filter((item) => item && item.is_active !== false)
    .map((item) => {
      const meta = [item.duration_min ? `${item.duration_min} min` : '', item.price || ''].filter(Boolean).join(' · ');
      return `
        <article>
          <h2>${escapeHtml(item.name)}</h2>
          ${meta ? `<p>${escapeHtml(meta)}</p>` : ''}
          <div>${renderBody(item.description || item.excerpt || '')}</div>
          ${item.benefits ? `<h3>Beneficios</h3><div>${renderBody(item.benefits)}</div>` : ''}
        </article>`;
    })
    .join('\n');
}

function buildYogaLanding(classes) {
  const blocks = (classes || [])
    .map((yogaClass) => {
      const slots = (yogaClass.schedules || [])
        .filter((slot) => slot.is_active !== false)
        .map((slot) => `<li>${escapeHtml(slot.day_of_week)} ${escapeHtml(slot.start_time)}–${escapeHtml(slot.end_time)}</li>`)
        .join('');
      return `
        <article>
          <h2>${escapeHtml(yogaClass.name)}</h2>
          <div>${renderBody(yogaClass.description || '')}</div>
          ${slots ? `<ul>${slots}</ul>` : ''}
        </article>`;
    })
    .join('\n');
  return `
    <main>
      <h1>Clases de Yoga en Cornellà</h1>
      <p>Hatha Yoga, Vinyasa y meditación para todos los niveles en Aruṇāchala, Cornellà de Llobregat.</p>
      ${blocks}
      <p><a href="/blog/yoga/">Blog de yoga</a></p>
    </main>`;
}

function buildTherapiesHub(massages, therapies) {
  const cards = (items, href) =>
    items
      .filter((item) => item && item.is_active !== false)
      .map(
        (item) => `
        <article>
          <h2><a href="${href}">${escapeHtml(item.name)}</a></h2>
          <p>${escapeHtml(item.excerpt || '')}</p>
        </article>`
      )
      .join('\n');
  return `
    <main>
      <h1>Masaje y terapias en Cornellà</h1>
      <p>Centro de masajes y terapias holísticas en Cornellà de Llobregat, con Susana Pérez Gil.</p>
      <section>
        <h2>Masajes</h2>
        ${cards(massages, '/terapias/masajes/')}
        <p><a href="/terapias/masajes/">Ver todos los masajes</a></p>
      </section>
      <section>
        <h2>Terapias holísticas</h2>
        ${cards(therapies, '/terapias/terapias-holisticas/')}
        <p><a href="/terapias/terapias-holisticas/">Ver terapias holísticas</a></p>
      </section>
    </main>`;
}

function buildPromotions(promotions) {
  const cards = (promotions || [])
    .filter((promo) => promo && promo.is_active !== false && !promo.is_tarifa)
    .map(
      (promo) => `
        <article>
          <h2>${escapeHtml(promo.title)}</h2>
          <div>${renderBody(promo.description || '')}</div>
        </article>`
    )
    .join('\n');
  return `
    <main>
      <h1>Promociones de yoga y terapias</h1>
      <p>Ofertas del centro Aruṇāchala en Cornellà.</p>
      ${cards}
    </main>`;
}

function buildAboutPage() {
  return `
    <main>
      <h1>¿Quién soy?</h1>
      <p>Mi nombre es Susana Pérez Gil y acompaño a personas a través del Yoga y las Terapias Manuales en Aruṇāchala, Cornellà de Llobregat.</p>
      <p>El camino empezó hace más de 25 años. La formación incluye Quiromasaje, Drenaje Linfático, Reflexología, Técnica Metamórfica, Reiki y la Formación de Profesora de Yoga. El centro tomó el nombre de la montaña sagrada Aruṇāchala, en Tiruvannamalai.</p>
      <p><a href="/contacto/">Contacto</a> · <a href="/clases-de-yoga/">Clases de yoga</a> · <a href="/terapias-y-masajes/">Masajes y terapias</a></p>
    </main>`;
}

function buildSpacePage() {
  return `
    <main>
      <h1>Nuestro espacio de yoga en Cornellà</h1>
      <p>Sala diáfana, luz natural y un ambiente pensado para la calma en Pasaje de Mateo Oliva 3, Cornellà de Llobregat.</p>
      <ul>
        <li>Tranvía T1 y T2 (El Pedró).</li>
        <li>Autobús 57, 68, 94 o 95.</li>
        <li>Metro línea 5 (Cornellà Centre).</li>
      </ul>
      <p><a href="/contacto/">Contactar</a></p>
    </main>`;
}

function buildContactPage() {
  return `
    <main>
      <h1>Contacto</h1>
      <p>Reserva tu clase de yoga o tu sesión de terapia en Aruṇāchala.</p>
      <ul>
        <li>Pasaje de Mateo Oliva 3, 08940 Cornellà de Llobregat, Barcelona.</li>
        <li>Teléfono y WhatsApp: <a href="tel:+34678481971">+34 678 481 971</a></li>
        <li>Email: <a href="mailto:yogayterapiasarunachala@gmail.com">yogayterapiasarunachala@gmail.com</a></li>
      </ul>
    </main>`;
}

function buildStaticPage(route) {
  return `
    <main class="font-body text-bark min-h-screen bg-bone">
      <article class="max-w-4xl mx-auto px-6 py-16">
        <nav><a href="/">← Inicio</a></nav>
        <h1 class="text-4xl font-serif text-forest mt-6 mb-6">${escapeHtml(route.title.replace(' | Arunachala Yoga y Terapias', '').replace(' | Aruṇāchala Yoga y Terapias', ''))}</h1>
        <p class="text-lg text-bark/80">${escapeHtml(route.description)}</p>
      </article>
    </main>`;
}

function injectRoot(html, innerHtml) {
  const wrapped = `<div class="seo-prerender">${innerHtml}</div>`;
  if (html.includes('<div id="root"></div>')) {
    return html.replace('<div id="root"></div>', `<div id="root">${wrapped}</div>`);
  }
  return html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${wrapped}</div>`);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function fetchJsonOr(url, fallback) {
  try {
    return await fetchJson(url);
  } catch (err) {
    console.warn(`Prerender: ${url} — ${err.message}`);
    return fallback;
  }
}

async function main() {
  const templatePath = path.join(BUILD_DIR, 'index.html');
  const routesPath = path.join(BUILD_DIR, 'seo-routes.json');

  if (!fs.existsSync(templatePath)) {
    console.warn('Prerender: build/index.html no encontrado, omitiendo.');
    return;
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const routes = fs.existsSync(routesPath) ? JSON.parse(fs.readFileSync(routesPath, 'utf8')) : [];

  console.log('Prerender: obteniendo contenido de la API...');
  const [articles, meditations, news, activities, yogaClasses, massages, therapies, promotions] = await Promise.all([
    fetchJson(`${API_BASE}/api/content?type=article&status=published`),
    fetchJson(`${API_BASE}/api/content?type=meditation&status=published`),
    fetchJsonOr(`${API_BASE}/api/content?type=announcement&status=published`, []),
    fetchJsonOr(`${API_BASE}/api/activities/`, []),
    fetchJsonOr(`${API_BASE}/api/yoga-classes`, []),
    fetchJsonOr(`${API_BASE}/api/treatments/massages`, []),
    fetchJsonOr(`${API_BASE}/api/treatments/therapies`, []),
    fetchJsonOr(`${API_BASE}/api/promotions/`, []),
  ]);

  const articlesBySlug = Object.fromEntries(
    articles.filter((a) => a.slug).map((a) => [a.slug, a])
  );
  const meditationsBySlug = Object.fromEntries(
    meditations.filter((m) => m.slug).map((m) => [m.slug, m])
  );
  const newsBySlug = Object.fromEntries(
    news.filter((item) => item.slug).map((item) => [item.slug, item])
  );
  const activitiesBySlug = Object.fromEntries(
    activities.filter(isPublicActivity).map((activity) => [activity.slug, activity])
  );

  let count = 0;

  for (const route of routes) {
    if (!isPrerenderable(route.path)) continue;

    let innerHtml = '';

    const blogMatch = route.path.match(/^\/blog\/([^/]+)\/$/);
    const meditationMatch = route.path.match(/^\/meditaciones\/([^/]+)\/$/);
    const newsMatch = route.path.match(/^\/noticias\/([^/]+)\/$/);
    const activityMatch = route.path.match(/^\/actividades\/([^/]+)\/$/);

    if (route.path === '/') {
      innerHtml = buildHomeExtras(articles);
    } else if (route.path === '/blog/') {
      innerHtml = buildBlogIndexExtras(articles);
    } else if (route.path === '/noticias/') {
      innerHtml = buildNewsIndex(news);
    } else if (route.path === '/actividades/') {
      innerHtml = buildActivitiesIndex(activities);
    } else if (route.path === '/clases-de-yoga/') {
      innerHtml = buildYogaLanding(yogaClasses);
    } else if (route.path === '/terapias-y-masajes/') {
      innerHtml = buildTherapiesHub(massages, therapies);
    } else if (route.path === '/terapias/masajes/') {
      innerHtml = `<main><h1>Masajes terapéuticos en Cornellà</h1><p>Sesiones con cita previa en Aruṇāchala.</p>${treatmentBlocks(massages)}</main>`;
    } else if (route.path === '/terapias/terapias-holisticas/') {
      innerHtml = `<main><h1>Terapias holísticas en Cornellà</h1><p>Reiki, técnica metamórfica, terapia floral y más en Aruṇāchala.</p>${treatmentBlocks(therapies)}</main>`;
    } else if (route.path === '/promociones/') {
      innerHtml = buildPromotions(promotions);
    } else if (route.path === '/quienes-somos/') {
      innerHtml = buildAboutPage();
    } else if (route.path === '/nuestro-espacio/') {
      innerHtml = buildSpacePage();
    } else if (route.path === '/contacto/') {
      innerHtml = buildContactPage();
    } else if (blogMatch && articlesBySlug[blogMatch[1]]) {
      innerHtml = buildArticlePage(articlesBySlug[blogMatch[1]], articles);
    } else if (meditationMatch && meditationsBySlug[meditationMatch[1]]) {
      innerHtml = buildMeditationPage(meditationsBySlug[meditationMatch[1]]);
    } else if (newsMatch && newsBySlug[newsMatch[1]]) {
      innerHtml = buildNewsPage(newsBySlug[newsMatch[1]], news);
    } else if (activityMatch && activitiesBySlug[activityMatch[1]]) {
      innerHtml = buildActivityPage(activitiesBySlug[activityMatch[1]]);
    } else if (!blogMatch && !meditationMatch && !newsMatch && !activityMatch) {
      innerHtml = buildStaticPage(route);
    } else {
      continue;
    }

    const outputFile = routeToOutputFile(route.path);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });

    const html = injectRoot(setMeta(template, route), innerHtml);
    fs.writeFileSync(outputFile, html);
    count += 1;
  }

  console.log(`Prerender: ${count} páginas HTML generadas con contenido estático.`);
}

main().catch((err) => {
  console.error('Prerender: error —', err.message);
  process.exit(1);
});
