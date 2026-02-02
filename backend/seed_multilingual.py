import sys
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime

# Import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.database import SessionLocal, engine, Base
from app.models.models import User, YogaClassDefinition, ClassSchedule, MassageType, TherapyType, Gallery

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    db = SessionLocal()
    try:
        # 1. Admin User
        admin = db.query(User).filter(User.email == "admin@arunachala.com").first()
        if not admin:
            print("Creating admin...")
            admin = User(
                email="admin@arunachala.com",
                password_hash=get_password_hash("admin123"),
                first_name="Admin",
                last_name="Arunachala",
                role="admin"
            )
            db.add(admin)

        # 2. Yoga Classes
        classes_data = [
            {
                "name": "Hatha Yoga",
                "description": "Una práctica equilibrada centrándose en posturas físicas (asanas) y respiración (pranayama).",
                "translations": {
                    "ca": {
                        "name": "Hatha Ioga",
                        "description": "Una pràctica equilibrada centrant-se en postures físiques (asanes) i respiració (pranayama)."
                    },
                    "en": {
                        "name": "Hatha Yoga",
                        "description": "A balanced practice focusing on physical postures (asanas) and breathing (pranayama)."
                    }
                },
                "color": "bg-forest/20"
            },
            {
                "name": "Vinyasa Flow",
                "description": "Una práctica dinámica donde el movimiento se sincroniza con la respiración en un flujo continuo.",
                "translations": {
                    "ca": {
                        "name": "Vinyasa Flow",
                        "description": "Una pràctica dinàmica on el moviment es sincronitza amb la respiració en un flux continu."
                    },
                    "en": {
                        "name": "Vinyasa Flow",
                        "description": "A dynamic practice where movement is synchronized with breath in a continuous flow."
                    }
                },
                "color": "bg-matcha/20"
            },
            {
                "name": "Yin Yoga",
                "description": "Práctica lenta y profunda que trabaja los tejidos conectivos y la flexibilidad pasiva.",
                "translations": {
                    "ca": {
                        "name": "Iin Ioga",
                        "description": "Pràctica lenta i profunda que treballa els teixits connectius i la flexibilitat passiva."
                    },
                    "en": {
                        "name": "Yin Yoga",
                        "description": "Slow and deep practice focusing on connective tissues and passive flexibility."
                    }
                },
                "color": "bg-bark/10"
            }
        ]

        for c in classes_data:
            existing = db.query(YogaClassDefinition).filter(YogaClassDefinition.name == c["name"]).first()
            if not existing:
                new_class = YogaClassDefinition(**c)
                db.add(new_class)
                db.flush()
                # Add a dummy schedule
                db.add(ClassSchedule(
                    class_id=new_class.id,
                    day_of_week="Lunes",
                    start_time="09:00",
                    end_time="10:30"
                ))

        # 3. Therapies
        therapies_data = [
            {
                "name": "Masaje Ayurvédico",
                "excerpt": "Relajación profunda con aceites calientes.",
                "description": "Técnica tradicional india que equilibra las energías del cuerpo (doshas) mediante masajes rítmicos y aceites naturales.",
                "translations": {
                    "ca": {
                        "name": "Massatge Aiurveda",
                        "excerpt": "Relaxació profunda amb olis calents.",
                        "description": "Tècnica tradicional índia que equilibra les energies del cos (doshas) mitjançant massatges rítmics i olis naturals."
                    },
                    "en": {
                        "name": "Ayurvedic Massage",
                        "excerpt": "Deep relaxation with warm oils.",
                        "description": "Traditional Indian technique that balances body energies (doshas) through rhythmic massage and natural oils."
                    }
                },
                "duration_min": 60,
                "image_url": "/static/gallery/therapies/c6f80fa9-617c-4713-886c-8527d1d53840.webp"
            }
        ]

        for t in therapies_data:
            existing = db.query(TherapyType).filter(TherapyType.name == t["name"]).first()
            if not existing:
                db.add(TherapyType(**t))

        # 4. Gallery Images (Sample)
        gallery_data = [
            {"url": "/static/gallery/yoga/0325e244-2cee-4163-aef8-36a408c8cb84.webp", "category": "yoga", "alt_text": "Clase de Yoga"},
            {"url": "/static/gallery/therapies/c6f80fa9-617c-4713-886c-8527d1d53840.webp", "category": "therapies", "alt_text": "Sala de Terapias"},
            {"url": "/static/gallery/home/2316aee3-6827-4198-a43e-abb90b6c84f5.webp", "category": "home", "alt_text": "Nuestro Espacio"}
        ]

        for g in gallery_data:
            existing = db.query(Gallery).filter(Gallery.url == g["url"]).first()
            if not existing:
                db.add(Gallery(**g))

        db.commit()
        print("Seed completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
