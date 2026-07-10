/**
 * Prerender dinámico para bots: sirve HTML con texto real sin esperar un rebuild.
 * Los usuarios normales siguen recibiendo la SPA de React.
 */
const BOT_UA =
  /googlebot|google-inspectiontool|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|slackbot|whatsapp|telegrambot|applebot|pinterest|redditbot|discordbot/i;

const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, '') ||
  'https://api.yogayterapiasarunachala.es';

const BLOG_CATEGORIES = new Set(['yoga', 'therapy', 'general']);

function shouldPrerender(pathname) {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (path === '/blog/') return true;

  const blogMatch = path.match(/^\/blog\/([^/]+)\/$/);
  if (blogMatch && !BLOG_CATEGORIES.has(blogMatch[1])) return true;

  if (/^\/meditaciones\/[^/]+\/$/.test(path)) return true;

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
  matcher: ['/blog/:path*', '/meditaciones/:path*'],
};
