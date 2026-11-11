/**
 * Prerender dinámico para bots: sirve HTML con texto real sin esperar un rebuild.
 * Los usuarios normales siguen recibiendo la SPA de React.
 * Copia de frontend/middleware.js. Vercel usa este archivo si la raíz del proyecto es el repo.
 */
const BOT_UA =
  /googlebot|google-inspectiontool|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|slackbot|whatsapp|telegrambot|applebot|pinterest|redditbot|discordbot/i;

const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') ||
  'https://api.yogayterapiasarunachala.es';

const BLOG_CATEGORIES = new Set(['yoga', 'therapy', 'general']);

const EXACT_PATHS = new Set([
  '/blog/',
  '/noticias/',
  '/meditaciones/',
  '/actividades/',
  '/clases-de-yoga/',
  '/terapias-y-masajes/',
  '/terapias/masajes/',
  '/terapias/terapias-holisticas/',
  '/quienes-somos/',
  '/nuestro-espacio/',
  '/contacto/',
  '/promociones/',
]);

function shouldPrerender(pathname) {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (EXACT_PATHS.has(path)) return true;
  if (/^\/noticias\/[^/]+\/$/.test(path)) return true;
  if (/^\/meditaciones\/[^/]+\/$/.test(path)) return true;
  if (/^\/actividades\/[^/]+\/$/.test(path)) return true;

  const blogMatch = path.match(/^\/blog\/([^/]+)\/$/);
  if (blogMatch && !BLOG_CATEGORIES.has(blogMatch[1])) return true;

  return false;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return;
  }

  const { pathname } = new URL(request.url);
  if (!shouldPrerender(pathname)) {
    return;
  }

  const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const apiUrl = `${API_BASE}/api/seo/html?path=${encodeURIComponent(normalizedPath)}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Arunachala-Prerender/1.0' },
    });

    if (response.ok) {
      const html = await response.text();
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Prerender': 'dynamic',
        },
      });
    }
  } catch (error) {
    console.error('Prerender middleware error:', error);
  }
}

export const config = {
  matcher: [
    '/blog',
    '/blog/:path*',
    '/noticias',
    '/noticias/:path*',
    '/meditaciones',
    '/meditaciones/:path*',
    '/actividades',
    '/actividades/:path*',
    '/clases-de-yoga',
    '/terapias-y-masajes',
    '/terapias/:path*',
    '/quienes-somos',
    '/nuestro-espacio',
    '/contacto',
    '/promociones',
  ],
};
