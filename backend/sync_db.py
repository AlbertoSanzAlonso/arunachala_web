from app.core.database import engine, Base
from app.models import models

print("Sincronizando tablas con PostgreSQL...")
try:
    models.Base.metadata.create_all(bind=engine)
    print("¡Tablas sincronizadas con éxito!")
except Exception as e:
    print(f"Error al sincronizar: {e}")
