# Tests Unitarios - Backend

Este directorio contiene todos los tests unitarios del backend de Arunachala Web (FastAPI).

## 📁 Estructura

```
tests/
├── conftest.py          # Configuración global y fixtures de pytest
├── utils/               # Tests de utilidades puras
│   ├── test_security.py
│   └── test_image_utils.py
├── api/                 # Tests de endpoints de API
│   └── test_auth.py
└── README.md           # Este archivo
```

## 🚀 Ejecutar Tests

### Todos los tests
```bash
cd backend
pytest
```

### Con más detalle
```bash
pytest -v
```

### Un archivo específico
```bash
pytest tests/utils/test_security.py
```

### Un test específico
```bash
pytest tests/utils/test_security.py::TestPasswordHashing::test_get_password_hash_creates_hash
```

### Con cobertura
```bash
pytest --cov=app --cov-report=html
```

## 📝 Convenciones

- **Nombres de archivos**: `test_*.py`
- **Nombres de clases**: `Test*`
- **Nombres de funciones**: `test_*`
- **Fixtures**: Definidas en `conftest.py` o en archivos locales

## 🧪 Tipos de Tests

### Tests de Utilidades
- Funciones puras sin dependencias de base de datos
- Fáciles de testear, alta cobertura esperada
- Ejemplos: `security`, `image_utils`, `translation_utils`

### Tests de API Endpoints
- Usan `TestClient` de FastAPI
- Mockean o usan base de datos de test
- Verifican códigos de estado, respuestas JSON, etc.

### Tests de Integración
- Prueban flujos completos con base de datos real (de test)
- Más lentos pero más realistas

## 🔧 Configuración

Los tests usan:
- **pytest**: Framework de testing
- **pytest-asyncio**: Para tests asíncronos
- **TestClient**: Cliente HTTP de FastAPI para tests
- **SQLite en memoria**: Base de datos de test (configurable via `TEST_DATABASE_URL`)

## 📊 Cobertura Actual

- ✅ Utilidades (`security`, `image_utils`)
- ✅ Endpoints de autenticación (`auth`)

## 🎯 Próximos Pasos

- Añadir tests para más endpoints (`content`, `activities`, `schedules`, etc.)
- Tests de integración para flujos completos
- Tests de servicios (`email`, `gallery_service`)
- Configurar CI/CD para ejecutar tests automáticamente
