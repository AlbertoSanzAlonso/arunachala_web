"""
Configuración global de pytest para el backend.
Incluye fixtures para base de datos de test, cliente HTTP, etc.
"""
import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, get_db

# Usar una base de datos de test separada o SQLite en memoria para tests
# Para tests, permitimos SQLite aunque el código de producción lo prohíba
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///:memory:")

# Crear engine de test
# Para SQLite en memoria, necesitamos check_same_thread=False
connect_args = {}
if "sqlite" in TEST_DATABASE_URL:
    connect_args = {"check_same_thread": False}

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args=connect_args
)

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Fixture que crea una sesión de base de datos para cada test."""
    # Limpiar tablas primero por si acaso
    Base.metadata.drop_all(bind=test_engine)
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=test_engine)
    
    # Crear sesión
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Limpiar tablas después de cada test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session, monkeypatch):
    """Fixture que crea un cliente HTTP de test con override de la DB."""
    # Mockear el scheduler para evitar problemas en tests
    from unittest.mock import MagicMock
    
    # Crear un mock del scheduler
    mock_scheduler = MagicMock()
    mock_scheduler.start = MagicMock()
    mock_scheduler.add_job = MagicMock()
    
    # Reemplazar el scheduler antes de que se use
    import app.main as main_module
    original_scheduler = main_module.scheduler
    main_module.scheduler = mock_scheduler
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        # Restaurar scheduler original
        main_module.scheduler = original_scheduler


@pytest.fixture
def mock_env(monkeypatch):
    """Fixture para mockear variables de entorno."""
    def _set_env(**kwargs):
        for key, value in kwargs.items():
            monkeypatch.setenv(key, value)
    return _set_env
