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
  const latest = articles.slice(0, 4);
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
  if (html.includes('<div id="root"></div>')) {
    return html.replace('<div id="root"></div>', `<div id="root">${innerHtml}</div>`);
  }
  return html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${innerHtml}</div>`);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
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
  const [articles, meditations] = await Promise.all([
    fetchJson(`${API_BASE}/api/content?type=article&status=published`),
    fetchJson(`${API_BASE}/api/content?type=meditation&status=published`),
  ]);

  const articlesBySlug = Object.fromEntries(
    articles.filter((a) => a.slug).map((a) => [a.slug, a])
  );
  const meditationsBySlug = Object.fromEntries(
    meditations.filter((m) => m.slug).map((m) => [m.slug, m])
  );

  let count = 0;

  for (const route of routes) {
    if (!isPrerenderable(route.path)) continue;

    let innerHtml = '';

    const blogMatch = route.path.match(/^\/blog\/([^/]+)\/$/);
    const meditationMatch = route.path.match(/^\/meditaciones\/([^/]+)\/$/);

    if (route.path === '/') {
      innerHtml = buildHomeExtras(articles);
    } else if (route.path === '/blog/') {
      innerHtml = buildBlogIndexExtras(articles);
    } else if (blogMatch && articlesBySlug[blogMatch[1]]) {
      innerHtml = buildArticlePage(articlesBySlug[blogMatch[1]], articles);
    } else if (meditationMatch && meditationsBySlug[meditationMatch[1]]) {
      innerHtml = buildMeditationPage(meditationsBySlug[meditationMatch[1]]);
    } else if (!blogMatch && !meditationMatch) {
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
