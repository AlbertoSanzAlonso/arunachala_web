# Arunachala Yoga Web - Estructura de Ramas Git

## 🌳 Estrategia de Ramas

```
main (producción)
├── develop (integración)
├── feature/home-dual-selector
├── feature/yoga-schedule  
├── feature/therapies-booking
├── feature/ai-mantra-generator
├── feature/whatsapp-chatbot
└── hotfix/critical-fix
```

## 🔄 Flujo de Trabajo

### 1. Desarrollo de Módulos
```bash
# Crear rama para nuevo módulo
git checkout develop
git checkout -b feature/nombre-modulo

# Trabajar en el módulo
git add .
git commit -m "feat: descripción del cambio"

# Subir y crear Pull Request
git push origin feature/nombre-modulo
```

### 2. Integración
```bash
# Cuando el módulo está completo y probado
git checkout develop
git merge feature/nombre-modulo
git push origin develop
git branch -d feature/nombre-modulo
```

### 3. Producción
```bash
# Fusionar develop a main
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

## 📋 Módulos Independientes

- `feature/home-dual-selector` - Página principal con selector Yoga/Terapias
- `feature/yoga-schedule` - Sistema de horarios y reservas de yoga
- `feature/therapies-booking` - Sistema de reservas de masajes y terapias
- `feature/ai-mantra-generator` - Widget de mantra diario con IA
- `feature/whatsapp-chatbot` - Chatbot de WhatsApp con IA
- `feature/video-library` - Videoteca de clases grabadas
- `feature/user-dashboard` - Panel de control de usuario

## 🎯 Reglas de Oro

- ✅ Nunca trabajar directo en `main`
- ✅ Cada módulo = una rama `feature/`
- ✅ Commits atómicos (1 cambio por commit)
- ✅ PRs obligatorios para fusionar a `develop`
- ✅ Tests antes de fusionar
- ✅ Mensajes de commits convencionales

## 📝 Convención de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato/código
refactor: refactorización
test: tests
chore: tareas varias
```