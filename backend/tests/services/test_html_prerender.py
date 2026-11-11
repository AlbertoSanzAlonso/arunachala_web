from datetime import datetime, timezone

from app.models.models import (
    Activity,
    ClassSchedule,
    Content,
    MassageType,
    YogaClassDefinition,
)
from app.services.html_prerender import render_full_page


def test_prerender_covers_activities_news_and_landings(db_session):
    now = datetime.now(timezone.utc)
    db_session.add(
        Activity(
            title="Taller de respiración",
            slug="taller-respiracion",
            description="Un taller para soltar la tensión.",
            type="taller",
            location="Cornellà",
            price="25€",
            is_active=True,
            start_date=now,
            created_at=now,
        )
    )
    db_session.add(
        Content(
            title="Aviso del centro",
            slug="aviso-centro",
            body="Cerramos el lunes por fiesta local.",
            excerpt="Cerramos el lunes.",
            type="announcement",
            status="published",
            created_at=now,
        )
    )
    yoga = YogaClassDefinition(name="Hatha Yoga", description="Clase suave de hatha para todos los niveles.")
    db_session.add(yoga)
    db_session.flush()
    db_session.add(
        ClassSchedule(
            class_id=yoga.id,
            day_of_week="Lunes",
            start_time="10:00",
            end_time="11:30",
            is_active=True,
        )
    )
    db_session.add(
        MassageType(
            name="Masaje tailandés",
            excerpt="Presión suave a lo largo del cuerpo.",
            description="Sesión de masaje tailandés en camilla.",
            is_active=True,
        )
    )
    db_session.commit()

    activity = render_full_page("/actividades/taller-respiracion", db_session)
    assert activity is not None
    assert "Taller de respiración" in activity
    assert "Un taller para soltar la tensión." in activity
    assert "https://www.yogayterapiasarunachala.es/actividades/taller-respiracion/" in activity
    assert '"@type": "Event"' in activity or '"@type":"Event"' in activity

    index = render_full_page("/actividades/", db_session)
    assert index is not None
    assert "/actividades/taller-respiracion/" in index

    assert render_full_page("/actividades/no-existe/", db_session) is None

    news = render_full_page("/noticias/aviso-centro/", db_session)
    assert news is not None
    assert "Cerramos el lunes por fiesta local." in news

    yoga_page = render_full_page("/clases-de-yoga/", db_session)
    assert yoga_page is not None
    assert "Hatha Yoga" in yoga_page
    assert "Lunes" in yoga_page
    assert "10:00" in yoga_page

    massages = render_full_page("/terapias/masajes/", db_session)
    assert massages is not None
    assert "Masaje tailandés" in massages
    assert "Sesión de masaje tailandés en camilla." in massages

    about = render_full_page("/quienes-somos/", db_session)
    assert about is not None
    assert "Susana Pérez Gil" in about

    contact = render_full_page("/contacto/", db_session)
    assert contact is not None
    assert "+34 678 481 971" in contact
