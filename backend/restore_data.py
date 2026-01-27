import os
import sys
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Fix path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.models import User, YogaClassDefinition, ClassSchedule, MassageType, TherapyType, Gallery

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def restore():
    db = SessionLocal()
    try:
        print("--- RESTAURACIÓN DE EMERGENCIA ---")
        
        # 1. Usuario Admin
        user_email = "albertosanzdev@gmail.com"
        admin = db.query(User).filter(User.email == user_email).first()
        if not admin:
            print(f"Creando usuario admin: {user_email}")
            admin = User(
                email=user_email,
                password_hash=get_password_hash("admin123"),
                first_name="Alberto",
                last_name="Sanz",
                role="admin"
            )
            db.add(admin)
        
        # 2. Clases de Yoga
        yoga_data = [
            {"name": "Hatha Yoga", "description": "Práctica tradicional de asanas y respiración.", "color": "bg-forest/20 border-forest text-forest", "age_range": None},
            {"name": "Vinyasa Flow", "description": "Sincronización de movimiento y respiración fluida.", "color": "bg-sky-100 border-sky-300 text-sky-800", "age_range": None},
            {"name": "Yoga Suave", "description": "Práctica relajante para todos los niveles.", "color": "bg-emerald-100 border-emerald-300 text-emerald-800", "age_range": None},
            {"name": "Meditación", "description": "Sesiones guiadas para la calma mental.", "color": "bg-amber-100 border-amber-300 text-amber-800", "age_range": None},
            {"name": "Yin Yoga", "description": "Flexibilidad pasiva y relajación profunda.", "color": "bg-violet-100 border-violet-300 text-violet-800", "age_range": None}
        ]
        
        class_map = {}
        for y in yoga_data:
            existing = db.query(YogaClassDefinition).filter(YogaClassDefinition.name == y["name"]).first()
            if not existing:
                print(f"Restaurando clase: {y['name']}")
                existing = YogaClassDefinition(**y)
                db.add(existing)
            else:
                existing.color = y["color"]
                existing.age_range = y["age_range"]
            db.flush()
            class_map[y["name"]] = existing.id

        # 3. Horarios (Limpios y sin solapamientos)
        schedules = [
            {'name': 'Hatha Yoga', 'day': 'Lunes', 'start': '09:00', 'end': '10:30'},
            {'name': 'Vinyasa Flow', 'day': 'Lunes', 'start': '18:00', 'end': '19:30'},
            {'name': 'Yoga Suave', 'day': 'Martes', 'start': '10:00', 'end': '11:30'},
            {'name': 'Meditación', 'day': 'Miércoles', 'start': '19:00', 'end': '20:30'},
            {'name': 'Hatha Yoga', 'day': 'Jueves', 'start': '19:00', 'end': '20:30'},
            {'name': 'Yin Yoga', 'day': 'Viernes', 'start': '18:00', 'end': '19:30'},
        ]
        
        for s in schedules:
            cid = class_map.get(s['name'])
            if cid:
                exists = db.query(ClassSchedule).filter(
                    ClassSchedule.class_id == cid,
                    ClassSchedule.day_of_week == s['day'],
                    ClassSchedule.start_time == s['start']
                ).first()
                if not exists:
                    db.add(ClassSchedule(
                        class_id=cid,
                        day_of_week=s['day'],
                        start_time=s['start'],
                        end_time=s['end']
                    ))

        # 4. Terapias y Masajes
        treatments = [
            {"name": "Masaje Ayurvédico", "excerpt": "Relajación con aceites calientes.", "duration_min": 60, "type": "massage", "image_url": "/static/gallery/therapies/c6f80fa9-617c-4713-886c-8527d1d53840.webp"},
            {"name": "Masaje Relajante", "excerpt": "Alivio de tensiones musculares.", "duration_min": 60, "type": "massage", "image_url": "/static/gallery/therapies/test_manual.webp"},
            {"name": "Masaje Descontracturante", "excerpt": "Para contracturas profundas.", "duration_min": 60, "type": "massage", "image_url": "/static/gallery/therapies/test_manual_2.webp"},
            {"name": "Masaje Tailandés", "excerpt": "Yoga pasivo y presiones.", "duration_min": 90, "type": "massage", "image_url": "/static/gallery/therapies/test_manual_3.webp"},
            {"name": "Reiki", "excerpt": "Equilibrio energético integral.", "duration_min": 50, "type": "therapy", "image_url": "/static/gallery/therapies/test_manual.webp"},
            {"name": "Acupuntura", "excerpt": "Medicina Tradicional China.", "duration_min": 60, "type": "therapy", "image_url": "/static/gallery/therapies/test_manual_2.webp"}
        ]
        
        for t in treatments:
            Model = MassageType if t["type"] == "massage" else TherapyType
            existing = db.query(Model).filter(Model.name == t["name"]).first()
            if not existing:
                print(f"Restaurando {t['type']}: {t['name']}")
                data = {k: v for k, v in t.items() if k != "type"}
                db.add(Model(**data))

        # 5. Escanear Galería
        static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "gallery")
        categories = ["yoga", "therapies", "home", "center"]
        for cat in categories:
            cat_path = os.path.join(static_path, cat)
            if os.path.exists(cat_path):
                for file in os.listdir(cat_path):
                    if file.endswith((".webp", ".png", ".jpg")):
                        url = f"/static/gallery/{cat}/{file}"
                        exists = db.query(Gallery).filter(Gallery.url == url).first()
                        if not exists:
                            print(f"Registrando imagen: {url}")
                            db.add(Gallery(url=url, category=cat, alt_text=f"Imagen {cat}"))

        db.commit()
        print("\n--- RESTAURACIÓN COMPLETADA ---")
        print(f"Puedes entrar con: {user_email} / admin123")
    except Exception as e:
        db.rollback()
        print(f"Error en restauración: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    restore()
