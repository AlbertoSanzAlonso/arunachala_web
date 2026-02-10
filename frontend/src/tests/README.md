# Tests Unitarios - Frontend

Este directorio contiene todos los tests unitarios del frontend de Arunachala Web.

## 📁 Estructura

```
tests/
├── components/     # Tests de componentes React
├── pages/          # Tests de smoke para páginas principales
├── hooks/          # Tests de hooks personalizados
├── utils/          # Tests de funciones utilitarias puras
└── README.md       # Este archivo
```

## 🚀 Ejecutar Tests

### Todos los tests
```bash
npm test
```

### En modo watch (recomendado durante desarrollo)
```bash
npm test -- --watch
```

### Un archivo específico
```bash
npm test -- BackButton.test.tsx
```

### Con cobertura
```bash
npm test -- --coverage
```

## 📝 Convenciones

- **Nombres de archivos**: `*.test.ts` o `*.test.tsx`
- **Ubicación**: Los tests deben estar en la misma estructura que el código fuente
- **Mocking**: Usar mocks para dependencias externas (APIs, routers, contextos)

## 🧪 Tipos de Tests

### Tests de Componentes
- Verifican que los componentes se renderizan correctamente
- Comprueban interacciones del usuario (clicks, cambios de estado)
- Validan props y comportamientos condicionales

### Tests de Utilidades
- Funciones puras sin dependencias de React
- Fáciles de testear, alta cobertura esperada

### Tests de Hooks
- Usan `renderHook` de `@testing-library/react-hooks`
- Verifican cambios de estado y efectos

### Tests de Smoke (Páginas)
- Verifican que las páginas se renderizan sin errores
- No prueban toda la funcionalidad, solo que no explotan

## 🔧 Configuración

Los tests usan:
- **Jest**: Framework de testing (incluido en Create React App)
- **React Testing Library**: Para renderizar y testear componentes
- **setupTests.ts**: Configuración global (mocks de window.matchMedia, IntersectionObserver, etc.)

## 📊 Cobertura Actual

- ✅ Utilidades (`translate`, `imageUtils`, `cropImage`)
- ✅ Componentes básicos (`Footer`, `PageLoader`, `ToastNotification`, `BackButton`, `FadeInSection`, `ConfirmModal`)
- ✅ Hooks (`useToast`)
- ✅ Páginas principales (`HomePage`, `ActivitiesPage`)

## 🎯 Próximos Pasos

- Añadir tests para componentes más complejos (`Header`, `WellnessQuiz`, `ChatBot`)
- Tests de integración para flujos completos
- Tests E2E con Cypress o Playwright (opcional)
