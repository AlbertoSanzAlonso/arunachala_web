"""Renderizado HTML para crawlers (prerender dinámico sin rebuild)."""
import html
import json
import re
from datetime import datetime
from typing import Optional

import markdown
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.models import (
    Activity,
    Content,
    MassageType,
    Promotion,
    TherapyType,
    YogaClassDefinition,
)

SITE_BASE = settings.FRONTEND_URL.rstrip("/")
API_PUBLIC = "https://api.yogayterapiasarunachala.es"

NAP_NAME = "Aruṇāchala Yoga y Terapias"
NAP_LINE = "Pasaje de Mateo Oliva 3, bajos, 08940 Cornellà de Llobregat, Barcelona"
NAP_PHONE = "+34 678 481 971"
NAP_EMAIL = "yogayterapiasarunachala@gmail.com"

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
    if item.type == "announcement":
        return f"/noticias/{item.slug}/"
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


def build_news_index_html(news: list[Content]) -> str:
    cards = "".join(
        f"""
        <article>
          <h2><a href="/noticias/{a.slug}/">{_escape(a.title)}</a></h2>
          <p>{_escape(a.excerpt or '')}</p>
        </article>"""
        for a in news
        if a.slug
    )
    return f"""
    <main>
      <h1>¿Qué avisos publica el centro?</h1>
      <p>Las noticias de Aruṇāchala recogen avisos propios del centro: cambios de horario, cierres, nuevas clases y actividades en Cornellà de Llobregat. Cada aviso abre con el dato concreto y después explica el detalle. Si un cambio afecta a tu reserva, el teléfono de contacto sigue siendo el {NAP_PHONE}.</p>
      {cards}
    </main>"""


def build_news_html(item: Content, related: list[Content]) -> str:
    body = render_body(item.body)
    excerpt = _escape(item.excerpt)
    related_items = [
        f'<li><a href="/noticias/{a.slug}/">{_escape(a.title)}</a></li>'
        for a in related
        if a.slug and a.slug != item.slug
    ][:6]
    related_links = "\n          ".join(related_items)
    return f"""
    <main class="font-body text-bark min-h-screen bg-bone">
      <article class="max-w-4xl mx-auto px-6 py-16">
        <nav><a href="/noticias/">← Volver a noticias</a> · <a href="/">Inicio</a></nav>
        <p class="text-sm uppercase tracking-widest text-forest/60 mt-6">Noticia</p>
        <h1 class="text-4xl font-serif text-forest mt-4 mb-6">{_escape(item.title)}</h1>
        {f'<p class="text-lg text-bark/80 mb-8">{excerpt}</p>' if excerpt else ''}
        <div class="prose max-w-none">{body}</div>
      </article>
      <nav aria-label="Más noticias" class="max-w-4xl mx-auto px-6 pb-16">
        <h2 class="text-xl font-serif text-forest mb-4">Otras noticias</h2>
        <ul>
          {related_links}
        </ul>
      </nav>
    </main>"""


def _plain(text: Optional[str], limit: int = 0) -> str:
    raw = re.sub(r"<[^>]+>", " ", text or "")
    raw = re.sub(r"\s+", " ", raw).strip()
    if limit and len(raw) > limit:
        return raw[: limit - 1].rstrip() + "…"
    return raw


def _format_dt(value) -> str:
    if not value:
        return ""
    try:
        return value.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return _escape(str(value))


def _iso(value) -> Optional[str]:
    if not value:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _public_activities(db: Session) -> list[Activity]:
    now = datetime.utcnow()
    return (
        db.query(Activity)
        .filter(
            Activity.is_active == True,
            Activity.slug.is_not(None),
            ~Activity.slug.contains("sugerencia"),
            Activity.type != "sugerencia",
            (Activity.end_date == None) | (Activity.end_date >= now),
        )
        .order_by(Activity.start_date.asc().nulls_last(), Activity.created_at.desc())
        .all()
    )


def _active_treatments(model, db: Session):
    return (
        db.query(model)
        .filter(model.is_active == True)
        .order_by(model.name.asc())
        .all()
    )


def build_activity_index_html(activities: list[Activity]) -> str:
    cards = []
    for activity in activities:
        if not activity.slug:
            continue
        when = _format_dt(activity.start_date)
        where = _escape(activity.location or "Centro Arunachala, Cornellà")
        cards.append(
            f"""
        <article>
          <h2><a href="/actividades/{activity.slug}/">{_escape(activity.title)}</a></h2>
          <p>{_escape(_plain(activity.description, 220))}</p>
          <p>{_escape(activity.type or "")}{f" · {when}" if when else ""} · {where}</p>
        </article>"""
        )
    body = "".join(cards) or "<p>Consulta el calendario de talleres y eventos del centro.</p>"
    return f"""
    <main>
      <h1>¿Qué talleres y cursos hay ahora en Aruṇāchala?</h1>
      <p>En esta página Aruṇāchala publica los talleres, cursos, retiros y eventos con fecha, lugar y precio propios del centro. Cada ficha indica si la actividad sigue abierta y cómo reservar plaza. Las sesiones se hacen en Pasaje de Mateo Oliva 3, bajos, Cornellà de Llobregat, salvo que la ficha indique otro lugar. Reservas en el {NAP_PHONE}.</p>
      {body}
    </main>"""


def build_activity_html(item: Activity) -> str:
    body = render_body(item.description)
    when = _format_dt(item.start_date)
    until = _format_dt(item.end_date)
    where = _escape(item.location or "Centro Arunachala, Cornellà de Llobregat")
    price = _escape(item.price or "")
    facts = []
    if when:
        facts.append(f"<li>Inicio: {when}</li>")
    if until:
        facts.append(f"<li>Fin: {until}</li>")
    facts.append(f"<li>Lugar: {where}</li>")
    if price:
        facts.append(f"<li>Precio: {price}</li>")
    return f"""
    <main>
      <article>
        <nav><a href="/actividades/">← Actividades</a> · <a href="/">Inicio</a></nav>
        <p>{_escape(item.type or "actividad")}</p>
        <h1>{_escape(item.title)}</h1>
        <ul>
          {''.join(facts)}
        </ul>
        <div class="prose">{body}</div>
      </article>
    </main>"""


def _activity_event_schema(item: Activity, canonical: str) -> dict:
    data = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": item.title,
        "description": _plain(item.description, 300) or item.title,
        "url": canonical,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "organizer": {
            "@type": "Organization",
            "name": NAP_NAME,
            "url": SITE_BASE,
        },
        "location": {
            "@type": "Place",
            "name": item.location or NAP_NAME,
            "address": NAP_LINE,
        },
    }
    start = _iso(item.start_date)
    end = _iso(item.end_date)
    if start:
        data["startDate"] = start
    if end:
        data["endDate"] = end
    image = _get_image_url(item.image_url)
    if image:
        data["image"] = image
    return data


def _treatment_blocks(items, heading: str) -> str:
    blocks = []
    for item in items:
        description = render_body(item.description or item.excerpt or "")
        benefits = render_body(item.benefits) if item.benefits else ""
        meta = []
        if item.duration_min:
            meta.append(f"{item.duration_min} min")
        if item.price:
            meta.append(_escape(item.price))
        meta_html = f"<p>{' · '.join(meta)}</p>" if meta else ""
        benefits_html = f"<h3>Beneficios</h3><div>{benefits}</div>" if benefits else ""
        blocks.append(
            f"""
        <article>
          <h2>{_escape(item.name)}</h2>
          {meta_html}
          <div>{description}</div>
          {benefits_html}
        </article>"""
        )
    return f"<section><h2>{_escape(heading)}</h2>{''.join(blocks)}</section>"


def build_yoga_landing_html(classes: list[YogaClassDefinition]) -> str:
    blocks = []
    for yoga_class in classes:
        slots = []
        for schedule in yoga_class.schedules or []:
            if schedule.is_active is False:
                continue
            slots.append(
                f"<li>{_escape(schedule.day_of_week)} {_escape(schedule.start_time)}–{_escape(schedule.end_time)}</li>"
            )
        schedule_html = f"<ul>{''.join(slots)}</ul>" if slots else ""
        age = f"<p>{_escape(yoga_class.age_range)}</p>" if yoga_class.age_range else ""
        blocks.append(
            f"""
        <article>
          <h2>{_escape(yoga_class.name)}</h2>
          {age}
          <div>{render_body(yoga_class.description or "")}</div>
          {schedule_html}
        </article>"""
        )
    listing = "".join(blocks) or "<p>Consulta el horario actualizado de clases en el centro.</p>"
    return f"""
    <main>
      <h1>¿Qué clases de yoga hay en Aruṇāchala?</h1>
      <p>En Aruṇāchala, Cornellà de Llobregat, Susana Pérez Gil da clases de hatha yoga y meditación para todos los niveles. Esta página publica el día y la hora de cada clase. La reserva se hace por teléfono o WhatsApp en el {NAP_PHONE}, o por correo en {NAP_EMAIL}. El centro está en Pasaje de Mateo Oliva 3, bajos.</p>
      {listing}
      <p><a href="/galeria/clases-de-yoga/">Galería de yoga</a> · <a href="/blog/yoga/">Blog de yoga</a></p>
    </main>"""


def build_therapies_hub_html(massages: list, therapies: list) -> str:
    def cards(items, href: str) -> str:
        rows = []
        for item in items:
            rows.append(
                f"""
            <article>
              <h2><a href="{href}">{_escape(item.name)}</a></h2>
              <p>{_escape(_plain(item.excerpt or item.description, 220))}</p>
            </article>"""
            )
        return "".join(rows)

    return f"""
    <main>
      <h1>¿Qué masajes y terapias hace Aruṇāchala?</h1>
      <p>Aruṇāchala ofrece masajes y terapias holísticas en Cornellà de Llobregat, siempre con Susana Pérez Gil y con cita previa. El precio vigente de cada sesión está publicado en su ficha, en esta misma web. Puedes pedir hora en el {NAP_PHONE} o en {NAP_EMAIL}. El centro está en Pasaje de Mateo Oliva 3, bajos, 08940 Cornellà de Llobregat.</p>
      <section>
        <h2>Masajes</h2>
        <p>Libera tensiones y recupera la vitalidad de tu cuerpo.</p>
        {cards(massages, "/terapias/masajes/")}
        <p><a href="/terapias/masajes/">Ver todos los masajes</a></p>
      </section>
      <section>
        <h2>Terapias holísticas</h2>
        <p>Acompañamiento en tu proceso de sanación y autoconocimiento.</p>
        {cards(therapies, "/terapias/terapias-holisticas/")}
        <p><a href="/terapias/terapias-holisticas/">Ver terapias holísticas</a></p>
      </section>
    </main>"""


def build_massage_landing_html(massages: list) -> str:
    return f"""
    <main>
      <h1>¿Qué masajes hay en Aruṇāchala y cuánto cuestan?</h1>
      <p>Cada masaje de Aruṇāchala aparece aquí con su duración y el precio que publica el centro. Las sesiones son con cita previa en Pasaje de Mateo Oliva 3, bajos, Cornellà de Llobregat, y las imparte Susana Pérez Gil. Si una ficha no muestra precio, se confirma al reservar en el {NAP_PHONE} o en {NAP_EMAIL}.</p>
      {_treatment_blocks(massages, "Masajes")}
      <p><a href="/terapias-y-masajes/">Volver a masaje y terapias</a></p>
    </main>"""


def build_holistic_landing_html(therapies: list) -> str:
    return f"""
    <main>
      <h1>¿Qué terapias holísticas hay y cuál es su precio?</h1>
      <p>En Aruṇāchala, Cornellà de Llobregat, las terapias holísticas incluyen las técnicas activas de esta página. Cada ficha muestra la duración y el precio vigente del centro. Se reservan con cita previa en el {NAP_PHONE}. La dirección es Pasaje de Mateo Oliva 3, bajos.</p>
      {_treatment_blocks(therapies, "Terapias holísticas")}
      <p><a href="/terapias-y-masajes/">Volver a masaje y terapias</a></p>
    </main>"""


def build_promotions_html(promotions: list[Promotion]) -> str:
    cards = []
    for promo in promotions:
        bits = []
        if promo.discount_percentage:
            bits.append(f"{promo.discount_percentage}%")
        if promo.price:
            bits.append(_escape(promo.price))
        if promo.discount_code:
            bits.append(f"Código {_escape(promo.discount_code)}")
        meta = f"<p>{' · '.join(bits)}</p>" if bits else ""
        cards.append(
            f"""
        <article>
          <h2>{_escape(promo.title)}</h2>
          {meta}
          <div>{render_body(promo.description or "")}</div>
        </article>"""
        )
    listing = "".join(cards) or "<p>No hay promociones activas en este momento.</p>"
    return f"""
    <main>
      <h1>¿Qué promociones hay vigentes en Aruṇāchala?</h1>
      <p>Esta página lista solo las ofertas activas del centro: el descuento, el precio y, si existe, el código. Cuando una promoción termina, deja de mostrarse. Las condiciones las fija Aruṇāchala Yoga y Terapias, en Cornellà de Llobregat. Para usar una oferta, reserva en el {NAP_PHONE} o en {NAP_EMAIL}.</p>
      {listing}
    </main>"""


def build_meditations_index_html(items: list[Content]) -> str:
    cards = "".join(
        f"""
        <article>
          <h2><a href="/meditaciones/{item.slug}/">{_escape(item.title)}</a></h2>
          <p>{_escape(item.excerpt or "")}</p>
        </article>"""
        for item in items
        if item.slug
    )
    return f"""
    <main>
      <h1>¿Qué meditaciones guiadas se pueden escuchar?</h1>
      <p>Aruṇāchala publica aquí meditaciones guiadas y mantras en audio para practicar en casa o antes de una clase. Cada pieza tiene título y una breve explicación, y se reproduce en esta misma página, sin salir de la web. Son materiales del centro de Susana Pérez Gil, en Cornellà de Llobregat.</p>
      {cards}
    </main>"""


def build_about_html() -> str:
    return """
    <main>
      <h1>¿Quién es Susana Pérez Gil?</h1>
      <p>Susana Pérez Gil es la fundadora de Aruṇāchala Yoga y Terapias, en Cornellà de Llobregat. Lleva más de 25 años practicando yoga y se ha formado en quiromasaje, drenaje linfático, reflexología, técnica metamórfica, reiki y como profesora de yoga. En el centro imparte las clases y las sesiones de masaje y terapia.</p>
      <p>Mi nombre es Susana Pérez Gil y desde hace años acompaño a personas a través del Yoga y las Terapias Manuales, integrando cuerpo, mente y dimensión emocional-espiritual.</p>
      <h2>Mi camino hacia Aruṇāchala</h2>
      <p>Mi camino comenzó hace más de 25 años, impulsado por una profunda inspiración por la India, su cultura y su espiritualidad. Empecé a practicar Yoga con un objetivo sencillo: sentirme bien físicamente y mantener una mente estable.</p>
      <h2>Formación y especialidades</h2>
      <p>Me formé en Quiromasaje, Drenaje Linfático, Reflexología y digitopresión, y más adelante en la Técnica Metamórfica y el Reiki. Realicé la Formación de Profesora de Yoga, ampliando la práctica para distintas etapas vitales.</p>
      <p>El Yoga acabó convirtiéndose en el eje de mi vida profesional, junto a los masajes y las terapias. Tras un viaje a la India y el ascenso a la montaña sagrada Aruṇāchala, en Tiruvannamalai, el centro tomó ese nombre: un espacio de yoga, masajes y terapias en Cornellà de Llobregat.</p>
      <p><a href="/contacto/">Contacto</a> · <a href="/clases-de-yoga/">Clases de yoga</a> · <a href="/terapias-y-masajes/">Masajes y terapias</a></p>
    </main>"""


def build_space_html() -> str:
    return f"""
    <main>
      <h1>¿Cómo es el espacio de Aruṇāchala y cómo se llega?</h1>
      <p>Aruṇāchala es una sala diáfana con luz natural en Pasaje de Mateo Oliva 3, bajos, 08940 Cornellà de Llobregat, junto a la plaza Pallars. Se llega en tranvía T1 y T2, parada El Pedró, en autobús 57, 68, 94 o 95, y en metro línea 5, Cornellà Centre. El teléfono del centro es el {NAP_PHONE}.</p>
      <p>La sala principal es diáfana, con luz natural y materiales orgánicos. El ambiente, con aromas suaves y silencio, acompaña la práctica desde que se cruza la puerta.</p>
      <h2>Cómo llegar</h2>
      <ul>
        <li>Dirección: {NAP_LINE}.</li>
        <li>Tranvía: líneas T1 y T2 (El Pedró).</li>
        <li>Autobús: 57, 68, 94 o 95.</li>
        <li>Metro: línea 5 (Cornellà Centre).</li>
      </ul>
      <p><a href="/contacto/">Contactar</a></p>
    </main>"""


def build_contact_html() -> str:
    return f"""
    <main>
      <h1>¿Cómo contactar con Aruṇāchala Yoga y Terapias?</h1>
      <p>Puedes llamar o escribir por WhatsApp al {NAP_PHONE}, o enviar un correo a {NAP_EMAIL}. El centro está en {NAP_LINE}. Las clases de yoga, los masajes y las terapias se confirman con cita previa. El formulario de esta página llega al mismo correo.</p>
      <ul>
        <li>{NAP_NAME}</li>
        <li>Dirección: {NAP_LINE}.</li>
        <li>Teléfono y WhatsApp: <a href="tel:+34678481971">{NAP_PHONE}</a></li>
        <li>Email: <a href="mailto:{NAP_EMAIL}">{NAP_EMAIL}</a></li>
      </ul>
      <p>Las sesiones de masaje y terapias se programan con cita previa.</p>
    </main>"""


def build_home_html(articles: list[Content]) -> str:
    cards = "".join(
        f"""
        <article>
          <h2><a href="/blog/{item.slug}/">{_escape(item.title)}</a></h2>
          <p>{_escape(item.excerpt or "")}</p>
        </article>"""
        for item in articles
        if item.slug
    )
    return f"""
    <main>
      <h1>¿Dónde practicar yoga y terapias en Cornellà de Llobregat?</h1>
      <p>Aruṇāchala Yoga y Terapias es el centro de Susana Pérez Gil en Cornellà de Llobregat. Ofrece clases de hatha yoga para todos los niveles, masajes y terapias holísticas con cita previa. La dirección es {NAP_LINE}. El teléfono y WhatsApp son el {NAP_PHONE}.</p>
      <p>{NAP_NAME}. <a href="tel:+34678481971">{NAP_PHONE}</a>. <a href="mailto:{NAP_EMAIL}">{NAP_EMAIL}</a>.</p>
      <p><a href="/clases-de-yoga/">Clases de yoga</a> · <a href="/terapias-y-masajes/">Masajes y terapias</a> · <a href="/preguntas-frecuentes/">Preguntas frecuentes</a> · <a href="/contacto/">Contacto</a></p>
      <section>
        <h2>Blog de yoga y bienestar</h2>
        {cards}
      </section>
    </main>"""


def _price_items(items, label: str) -> str:
    rows = []
    for item in items:
        price = getattr(item, "price", None)
        if not price:
            continue
        name = getattr(item, "name", None) or getattr(item, "title", "")
        rows.append(f"<li>{_escape(name)}: {_escape(str(price))}</li>")
    if not rows:
        return ""
    return f"<section><h2>{_escape(label)}</h2><ul>{''.join(rows)}</ul></section>"


def build_faq_html(tarifas, massages, therapies) -> str:
    prices = "".join(
        [
            _price_items(tarifas, "Tarifas de yoga"),
            _price_items(massages, "Masajes"),
            _price_items(therapies, "Terapias holísticas"),
        ]
    )
    if not prices:
        prices = f"<p>Ahora mismo no hay precios cargados en la web. Se confirman al reservar en el {NAP_PHONE}.</p>"
    return f"""
    <main>
      <h1>Preguntas frecuentes</h1>
      <p>Respuestas directas sobre el centro. El nombre, la dirección y el teléfono son los mismos en toda la web. {NAP_NAME}. {NAP_LINE}. {NAP_PHONE}. {NAP_EMAIL}.</p>
      <article>
        <h2>¿Dónde está Aruṇāchala Yoga y Terapias?</h2>
        <p>Aruṇāchala Yoga y Terapias está en {NAP_LINE}, junto a la plaza Pallars. El teléfono y WhatsApp son el {NAP_PHONE} y el correo es {NAP_EMAIL}. Es el centro de yoga, masajes y terapias de Susana Pérez Gil.</p>
      </article>
      <article>
        <h2>¿Cómo reservo una clase de yoga o una sesión?</h2>
        <p>La reserva se hace por teléfono o WhatsApp en el {NAP_PHONE}, por correo en {NAP_EMAIL}, o con el formulario de la página de contacto. Las clases, los masajes y las terapias se confirman con cita previa. No hace falta crear una cuenta en la web.</p>
      </article>
      <article>
        <h2>¿Hace falta experiencia para las clases de yoga?</h2>
        <p>No. Las clases de hatha yoga y meditación de Aruṇāchala, en Cornellà de Llobregat, están abiertas a todos los niveles. Susana Pérez Gil adapta la práctica al momento de cada persona. El día y la hora de cada clase están publicados en la página de yoga del centro.</p>
      </article>
      <article>
        <h2>¿Cuánto cuesta una clase de yoga o un masaje?</h2>
        <p>El precio lo publica el propio centro en esta web: en las tarifas de yoga y en la ficha de cada masaje o terapia. Esa cifra es la vigente. Más abajo está la lista actual. Si una sesión no muestra precio, se confirma al reservar en el {NAP_PHONE}.</p>
      </article>
      <article>
        <h2>¿Quién imparte las clases y las terapias?</h2>
        <p>Las imparte Susana Pérez Gil, fundadora de Aruṇāchala Yoga y Terapias. Lleva más de 25 años de práctica de yoga y formación en quiromasaje, drenaje linfático, reflexología, técnica metamórfica, reiki y como profesora de yoga. El centro está en Cornellà de Llobregat.</p>
      </article>
      <article>
        <h2>¿Cómo llego en transporte público?</h2>
        <p>El centro está en {NAP_LINE}. En tranvía, líneas T1 y T2, parada El Pedró. En autobús, líneas 57, 68, 94 o 95. En metro, línea 5, parada Cornellà Centre. El teléfono por si necesitas indicaciones es el {NAP_PHONE}.</p>
      </article>
      <section>
        <h2>Precios publicados por el centro</h2>
        {prices}
      </section>
    </main>"""


def _faq_schema() -> dict:
    pairs = [
        (
            "¿Dónde está Aruṇāchala Yoga y Terapias?",
            f"Aruṇāchala Yoga y Terapias está en {NAP_LINE}. Teléfono {NAP_PHONE}. Correo {NAP_EMAIL}.",
        ),
        (
            "¿Cómo reservo una clase de yoga o una sesión?",
            f"Por teléfono o WhatsApp en el {NAP_PHONE}, por correo en {NAP_EMAIL}, o con el formulario de contacto. Con cita previa.",
        ),
        (
            "¿Hace falta experiencia para las clases de yoga?",
            "No. Las clases de Aruṇāchala están abiertas a todos los niveles.",
        ),
        (
            "¿Cuánto cuesta una clase de yoga o un masaje?",
            f"El precio vigente lo publica el centro en esta web. Si no aparece, se confirma en el {NAP_PHONE}.",
        ),
        (
            "¿Quién imparte las clases y las terapias?",
            "Susana Pérez Gil, fundadora de Aruṇāchala Yoga y Terapias.",
        ),
        (
            "¿Cómo llego en transporte público?",
            f"Tranvía T1 y T2 (El Pedró), autobús 57, 68, 94 o 95, metro línea 5 (Cornellà Centre). Dirección: {NAP_LINE}.",
        ),
    ]
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {"@type": "Answer", "text": answer},
            }
            for question, answer in pairs
        ],
    }


def _render_extended(normalized: str, db: Session) -> Optional[dict]:
    """Landings, actividades y listados que no cubren los artículos."""
    if normalized == "/":
        articles = (
            db.query(Content)
            .filter(
                Content.type == "article",
                Content.status == "published",
                Content.slug.is_not(None),
                ~Content.slug.contains("sugerencia"),
            )
            .order_by(Content.created_at.desc())
            .limit(6)
            .all()
        )
        return {
            "title": "Aruṇāchala Yoga y Terapias | Centro de bienestar en Cornellà",
            "description": f"Centro de Susana Pérez Gil en {NAP_LINE}. Clases de hatha yoga, masajes y terapias con cita previa. Teléfono {NAP_PHONE}.",
            "inner_html": build_home_html(articles),
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "YogaStudio",
                "name": NAP_NAME,
                "url": SITE_BASE,
                "telephone": "+34678481971",
                "email": NAP_EMAIL,
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Pasaje de Mateo Oliva 3, bajos",
                    "addressLocality": "Cornellà de Llobregat",
                    "postalCode": "08940",
                    "addressRegion": "Barcelona",
                    "addressCountry": "ES",
                },
            },
        }

    if normalized == "/preguntas-frecuentes/":
        now = datetime.utcnow()
        tarifas = (
            db.query(Promotion)
            .filter(
                Promotion.is_active == True,
                Promotion.is_tarifa == True,
                (Promotion.start_date == None) | (Promotion.start_date <= now),
                (Promotion.end_date == None) | (Promotion.end_date >= now),
            )
            .all()
        )
        return {
            "title": "Preguntas frecuentes | Aruṇāchala Yoga y Terapias",
            "description": f"Dónde está Aruṇāchala, cómo reservar y los precios publicados por el centro. {NAP_LINE}. {NAP_PHONE}.",
            "inner_html": build_faq_html(tarifas, _active_treatments(MassageType, db), _active_treatments(TherapyType, db)),
            "json_ld": _faq_schema(),
        }

    if normalized == "/meditaciones/":
        items = (
            db.query(Content)
            .filter(
                Content.type == "meditation",
                Content.status == "published",
                Content.slug.is_not(None),
                ~Content.slug.contains("sugerencia"),
            )
            .order_by(Content.created_at.desc())
            .all()
        )
        return {
            "title": "Meditaciones | Arunachala Yoga y Terapias",
            "description": "Meditaciones guiadas y mantras de Aruṇāchala Yoga y Terapias en Cornellà.",
            "inner_html": build_meditations_index_html(items),
        }

    activity_match = re.match(r"^/actividades/([^/]+)/$", normalized)
    if activity_match:
        slug = activity_match.group(1)
        item = (
            db.query(Activity)
            .filter(
                Activity.slug == slug,
                Activity.is_active == True,
                Activity.type != "sugerencia",
            )
            .first()
        )
        if not item or "sugerencia" in (item.slug or ""):
            return None
        canonical = f"{SITE_BASE}{normalized}"
        return {
            "title": f"{item.title} | Arunachala Yoga y Terapias",
            "description": _plain(item.description, 160) or item.title,
            "inner_html": build_activity_html(item),
            "image": _get_image_url(item.image_url),
            "json_ld": _activity_event_schema(item, canonical),
            "og_type": "article",
        }

    if normalized == "/actividades/":
        activities = _public_activities(db)
        return {
            "title": "Actividades y cursos en Cornellà | Arunachala Yoga y Terapias",
            "description": "Talleres, cursos, retiros y eventos de yoga y bienestar en Aruṇāchala Cornellà. Consulta fechas, precios y reserva tu plaza.",
            "inner_html": build_activity_index_html(activities),
            "json_ld": {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": "Actividades",
                "url": f"{SITE_BASE}/actividades/",
                "mainEntity": {
                    "@type": "ItemList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": index + 1,
                            "name": activity.title,
                            "url": f"{SITE_BASE}/actividades/{activity.slug}/",
                        }
                        for index, activity in enumerate(activities)
                        if activity.slug
                    ],
                },
            },
        }

    if normalized == "/clases-de-yoga/":
        classes = db.query(YogaClassDefinition).order_by(YogaClassDefinition.name.asc()).all()
        return {
            "title": "Clases de Yoga en Barcelona | Aruṇāchala",
            "description": "Descubre nuestras clases de yoga en Cornellà de Llobregat. Hatha Yoga, Vinyasa y meditación para todos los niveles.",
            "inner_html": build_yoga_landing_html(classes),
        }

    if normalized == "/terapias-y-masajes/":
        massages = _active_treatments(MassageType, db)
        therapies = _active_treatments(TherapyType, db)
        return {
            "title": "Masaje y Terapias en Cornellà | Arunachala Yoga y Terapias",
            "description": "Centro de masajes y terapias holísticas en Cornellà de Llobregat: masaje tailandés, reiki, terapia floral y más con Susana Pérez Gil en Aruṇāchala.",
            "inner_html": build_therapies_hub_html(massages, therapies),
        }

    if normalized == "/terapias/masajes/":
        massages = _active_treatments(MassageType, db)
        return {
            "title": "Masajes terapéuticos en Cornellà | Arunachala Yoga y Terapias",
            "description": "Masajes terapéuticos, tailandés, deportivo y relajante en Aruṇāchala Cornellà. Libera tensiones y recupera vitalidad con Susana Pérez Gil.",
            "inner_html": build_massage_landing_html(massages),
        }

    if normalized == "/terapias/terapias-holisticas/":
        therapies = _active_treatments(TherapyType, db)
        return {
            "title": "Terapias holísticas en Cornellà | Arunachala Yoga y Terapias",
            "description": "Reiki, técnica metamórfica, terapia floral y más en Aruṇāchala Cornellà. Acompañamiento en tu proceso de sanación y autoconocimiento.",
            "inner_html": build_holistic_landing_html(therapies),
        }

    if normalized == "/promociones/":
        now = datetime.utcnow()
        promotions = (
            db.query(Promotion)
            .filter(
                Promotion.is_active == True,
                Promotion.is_tarifa == False,
                (Promotion.start_date == None) | (Promotion.start_date <= now),
                (Promotion.end_date == None) | (Promotion.end_date >= now),
            )
            .all()
        )
        return {
            "title": "Promociones | Arunachala Yoga y Terapias",
            "description": "Ofertas y promociones en clases de yoga, masajes y terapias en Aruṇāchala Cornellà.",
            "inner_html": build_promotions_html(promotions),
        }

    if normalized == "/quienes-somos/":
        return {
            "title": "Quiénes Somos | Arunachala Yoga y Terapias",
            "description": "Conoce a Susana Pérez Gil y el equipo de Aruṇāchala, centro de yoga y terapias en Cornellà.",
            "inner_html": build_about_html(),
        }

    if normalized == "/nuestro-espacio/":
        return {
            "title": "Nuestro Espacio | Arunachala Yoga y Terapias",
            "description": "Visita el centro Aruṇāchala en Cornellà de Llobregat: sala de yoga luminosa, ambiente tranquilo y cómo llegar en metro, bus o tranvía.",
            "inner_html": build_space_html(),
        }

    if normalized == "/contacto/":
        return {
            "title": "Contacto | Yoga y Terapias Aruṇāchala Cornellà",
            "description": "Contacta con Aruṇāchala Yoga en Cornellà. Reserva tu clase de yoga o sesión de terapia. Estamos en Pasaje de Mateo Oliva, 3.",
            "inner_html": build_contact_html(),
        }

    return None


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
      <h1>¿Qué publica el blog de Aruṇāchala?</h1>
      <p>El blog de Aruṇāchala reúne artículos propios sobre yoga, meditación, masajes y terapias holísticas, escritos desde la práctica del centro en Cornellà de Llobregat. Cada texto abre con la respuesta y después desarrolla el tema. Sirve para preparar una clase o una sesión antes de reservar en el {NAP_PHONE}.</p>
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

    news_items = (
        db.query(Content)
        .filter(
            Content.type == "announcement",
            Content.status == "published",
            Content.slug.is_not(None),
            ~Content.slug.contains("sugerencia"),
        )
        .order_by(Content.created_at.desc())
        .all()
    )

    if normalized == "/noticias/":
        return build_news_index_html(news_items)

    news_match = re.match(r"^/noticias/([^/]+)/$", normalized)
    if news_match:
        slug = news_match.group(1)
        item = (
            db.query(Content)
            .filter(
                Content.slug == slug,
                Content.type == "announcement",
                Content.status == "published",
            )
            .first()
        )
        if not item:
            return None
        return build_news_html(item, news_items)

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

    extended = _render_extended(normalized, db)
    if extended:
        return extended["inner_html"]

    return None


def wrap_full_html(
    title: str,
    description: str,
    canonical: str,
    inner_html: str,
    image: str = "",
    json_ld=None,
    og_type: str = "website",
) -> str:
    """Documento HTML completo para crawlers."""
    image_tags = ""
    if image:
        safe_image = _escape(image)
        image_tags = f"""
  <meta property="og:image" content="{safe_image}"/>
  <meta name="twitter:image" content="{safe_image}"/>"""
    ld_tag = ""
    if json_ld:
        payload = json.dumps(json_ld, ensure_ascii=False).replace("<", "\\u003c")
        ld_tag = f'\n  <script type="application/ld+json">{payload}</script>'
    safe_title = _escape(title)
    safe_description = _escape(description)
    safe_canonical = _escape(canonical)
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{safe_title}</title>
  <meta name="description" content="{safe_description}"/>
  <link rel="canonical" href="{safe_canonical}"/>
  <link rel="ai-catalog" type="application/json" href="https://www.yogayterapiasarunachala.es/.well-known/ai-catalog.json"/>
  <link rel="ard" type="application/json" href="https://www.yogayterapiasarunachala.es/.well-known/ard.json"/>
  <link rel="api-catalog" type="application/linkset+json" href="https://www.yogayterapiasarunachala.es/.well-known/api-catalog"/>
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large"/>
  <meta property="og:type" content="{_escape(og_type)}"/>
  <meta property="og:site_name" content="Arunachala Yoga y Terapias"/>
  <meta property="og:locale" content="es_ES"/>
  <meta property="og:title" content="{safe_title}"/>
  <meta property="og:description" content="{safe_description}"/>
  <meta property="og:url" content="{safe_canonical}"/>{image_tags}
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="{safe_title}"/>
  <meta name="twitter:description" content="{safe_description}"/>{ld_tag}
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

    if normalized == "/noticias/":
        news_items = (
            db.query(Content)
            .filter(
                Content.type == "announcement",
                Content.status == "published",
                Content.slug.is_not(None),
            )
            .order_by(Content.created_at.desc())
            .all()
        )
        inner = build_news_index_html(news_items)
        title = "Noticias | Arunachala Yoga y Terapias"
        description = "Noticias y avisos del centro Aruṇāchala Yoga y Terapias en Cornellà."
        return wrap_full_html(title, description, canonical, inner)

    news_match = re.match(r"^/noticias/([^/]+)/$", normalized)
    if news_match:
        slug = news_match.group(1)
        item = (
            db.query(Content)
            .filter(
                Content.slug == slug,
                Content.type == "announcement",
                Content.status == "published",
            )
            .first()
        )
        if not item:
            return None
        news_items = (
            db.query(Content)
            .filter(
                Content.type == "announcement",
                Content.status == "published",
                Content.slug.is_not(None),
            )
            .order_by(Content.created_at.desc())
            .all()
        )
        inner = build_news_html(item, news_items)
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

    extended = _render_extended(normalized, db)
    if extended:
        return wrap_full_html(
            extended["title"],
            extended["description"],
            canonical,
            extended["inner_html"],
            image=extended.get("image") or "",
            json_ld=extended.get("json_ld"),
            og_type=extended.get("og_type") or "website",
        )

    return None
