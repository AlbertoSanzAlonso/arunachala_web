"""Renderizado HTML para crawlers (prerender dinámico sin rebuild)."""
import html
import re
from typing import Optional

import markdown
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import Content

SITE_BASE = settings.FRONTEND_URL.rstrip("/")
API_PUBLIC = "https://api.yogayterapiasarunachala.es"

BLOG_CATEGORIES = {"yoga", "therapy", "general"}


def _escape(text: Optional[str]) -> str:
    return html.escape(text or "", quote=True)


def _get_image_url(url: Optional[str]) -> str:
    if not url:
        return ""
    if url.startswith("http"):
        return url
    return f"{API_PUBLIC}{url if url.startswith('/') else '/' + url}"


def _prepare_markdown(content: str) -> str:
    if not content:
        return ""
    text = (
        content.replace("\\n", "\n")
        .replace("\\\\n", "\n")
        .replace("\r\n", "\n")
        .replace("\r", "\n")
        .replace('\\"', '"')
        .replace("\u00a0", " ")
        .replace("\t", " ")
    )
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"\[(imagen|image|img|foto)_?\d*\]", "", text, flags=re.I)
    return text.strip()


def _fix_media_urls(content: str) -> str:
    def md_repl(match):
        return f"{match.group(1)}{_get_image_url(match.group(2))}{match.group(3)}"

    def img_repl(match):
        return f'{match.group(1)}{_get_image_url(match.group(2))}{match.group(3)}'

    content = re.sub(r"(!\[.*?\]\()([^)]+)(\))", md_repl, content)
    content = re.sub(r'(<img[^>]+src=["\'])([^"\']+)(["\'][^>]*>)', img_repl, content, flags=re.I)
    return content


def _is_html(text: str) -> bool:
    trimmed = text.strip()
    return trimmed.startswith("<") and ">" in trimmed


def render_body(raw_body: Optional[str]) -> str:
    processed = _prepare_markdown(raw_body or "")
    if not processed:
        return ""
    if _is_html(processed):
        return _fix_media_urls(processed)
    markdown_text = re.sub(r"^#\s+.+(\n|$)", "", processed, count=1).strip()
    return markdown.markdown(
        _fix_media_urls(markdown_text),
        extensions=["extra", "sane_lists"],
    )


def content_public_path(item: Content) -> Optional[str]:
    if item.status != "published" or not item.slug or "sugerencia" in (item.slug or ""):
        return None
    if item.type == "article":
        return f"/blog/{item.slug}/"
    if item.type == "meditation":
        return f"/meditaciones/{item.slug}/"
    return None


def content_public_url(item: Content) -> Optional[str]:
    path = content_public_path(item)
    return f"{SITE_BASE}{path}" if path else None


def _article_links(articles: list[Content], exclude_slug: str, limit: int = 6) -> str:
    items = [
        f'<li><a href="/blog/{a.slug}/">{_escape(a.title)}</a></li>'
        for a in articles
        if a.slug and a.slug != exclude_slug
    ][:limit]
    return "\n          ".join(items)


def build_article_html(item: Content, related: list[Content]) -> str:
    body = render_body(item.body)
    excerpt = _escape(item.excerpt)
    return f"""
    <main class="font-body text-bark min-h-screen bg-bone">
      <article class="max-w-4xl mx-auto px-6 py-16">
        <nav><a href="/blog/">← Volver al blog</a> · <a href="/">Inicio</a></nav>
        <p class="text-sm uppercase tracking-widest text-forest/60 mt-6">{_escape(item.category or 'blog')}</p>
        <h1 class="text-4xl font-serif text-forest mt-4 mb-6">{_escape(item.title)}</h1>
        {f'<p class="text-lg text-bark/80 mb-8">{excerpt}</p>' if excerpt else ''}
        <div class="prose max-w-none">{body}</div>
      </article>
      <nav aria-label="Más artículos" class="max-w-4xl mx-auto px-6 pb-16">
        <h2 class="text-xl font-serif text-forest mb-4">Más artículos</h2>
        <ul>
          {_article_links(related, item.slug or '')}
        </ul>
      </nav>
    </main>"""


def build_meditation_html(item: Content) -> str:
    body = render_body(item.body)
    excerpt = _escape(item.excerpt)
    return f"""
    <main class="font-body text-bark min-h-screen bg-bone">
      <article class="max-w-4xl mx-auto px-6 py-16">
        <nav><a href="/meditaciones/">← Meditaciones</a> · <a href="/">Inicio</a></nav>
        <h1 class="text-4xl font-serif text-forest mt-6 mb-6">{_escape(item.title)}</h1>
        {f'<p class="text-lg text-bark/80 mb-8">{excerpt}</p>' if excerpt else ''}
        <div class="prose max-w-none">{body}</div>
      </article>
    </main>"""


def build_blog_index_html(articles: list[Content]) -> str:
    cards = "".join(
        f"""
        <article>
          <h2><a href="/blog/{a.slug}/">{_escape(a.title)}</a></h2>
          <p>{_escape(a.excerpt or '')}</p>
        </article>"""
        for a in articles
        if a.slug
    )
    return f"""
    <main>
      <h1>Blog | Arunachala Yoga y Terapias</h1>
      <p>Artículos sobre yoga, meditación, terapias holísticas y bienestar.</p>
      {cards}
    </main>"""


def render_page_html(path: str, db: Session) -> Optional[str]:
    """Genera el HTML interno para una ruta pública. None si no aplica."""
    normalized = path if path.endswith("/") else f"{path}/"

    articles = (
        db.query(Content)
        .filter(
            Content.type == "article",
            Content.status == "published",
            Content.slug.is_not(None),
            ~Content.slug.contains("sugerencia"),
        )
        .order_by(Content.created_at.desc())
        .all()
    )

    if normalized == "/blog/":
        return build_blog_index_html(articles)

    blog_match = re.match(r"^/blog/([^/]+)/$", normalized)
    if blog_match:
        slug = blog_match.group(1)
        if slug in BLOG_CATEGORIES:
            return None
        item = (
            db.query(Content)
            .filter(
                Content.slug == slug,
                Content.type == "article",
                Content.status == "published",
            )
            .first()
        )
        if not item:
            return None
        return build_article_html(item, articles)

    meditation_match = re.match(r"^/meditaciones/([^/]+)/$", normalized)
    if meditation_match:
        slug = meditation_match.group(1)
        item = (
            db.query(Content)
            .filter(
                Content.slug == slug,
                Content.type == "meditation",
                Content.status == "published",
            )
            .first()
        )
        if not item:
            return None
        return build_meditation_html(item)

    return None


def wrap_full_html(title: str, description: str, canonical: str, inner_html: str) -> str:
    """Documento HTML completo para crawlers."""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{_escape(title)}</title>
  <meta name="description" content="{_escape(description)}"/>
  <link rel="canonical" href="{_escape(canonical)}"/>
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large"/>
  <meta property="og:title" content="{_escape(title)}"/>
  <meta property="og:description" content="{_escape(description)}"/>
  <meta property="og:url" content="{_escape(canonical)}"/>
</head>
<body>
  <div id="root">{inner_html}</div>
</body>
</html>"""


def render_full_page(path: str, db: Session) -> Optional[str]:
    """HTML completo listo para servir a bots."""
    normalized = path if path.endswith("/") else f"{path}/"
    canonical = f"{SITE_BASE}{normalized}"

    if normalized == "/blog/":
        articles = (
            db.query(Content)
            .filter(
                Content.type == "article",
                Content.status == "published",
                Content.slug.is_not(None),
            )
            .order_by(Content.created_at.desc())
            .all()
        )
        inner = build_blog_index_html(articles)
        title = "Blog | Arunachala Yoga y Terapias"
        description = "Artículos sobre yoga, meditación, terapias holísticas y bienestar."
        return wrap_full_html(title, description, canonical, inner)

    blog_match = re.match(r"^/blog/([^/]+)/$", normalized)
    if blog_match:
        slug = blog_match.group(1)
        if slug in BLOG_CATEGORIES:
            return None
        item = (
            db.query(Content)
            .filter(
                Content.slug == slug,
                Content.type == "article",
                Content.status == "published",
            )
            .first()
        )
        if not item:
            return None
        articles = (
            db.query(Content)
            .filter(
                Content.type == "article",
                Content.status == "published",
                Content.slug.is_not(None),
            )
            .order_by(Content.created_at.desc())
            .all()
        )
        inner = build_article_html(item, articles)
        title = f"{item.title} | Arunachala Yoga y Terapias"
        description = (item.seo_description or item.excerpt or item.title or "")[:160]
        return wrap_full_html(title, description, canonical, inner)

    meditation_match = re.match(r"^/meditaciones/([^/]+)/$", normalized)
    if meditation_match:
        slug = meditation_match.group(1)
        item = (
            db.query(Content)
            .filter(
                Content.slug == slug,
                Content.type == "meditation",
                Content.status == "published",
            )
            .first()
        )
        if not item:
            return None
        inner = build_meditation_html(item)
        title = f"{item.title} | Arunachala Yoga y Terapias"
        description = (item.seo_description or item.excerpt or item.title or "")[:160]
        return wrap_full_html(title, description, canonical, inner)

    return None
