---name: github-workflowdescription: GitHub workflow management for branches, pull requests, and releaseslicense: MITcompatibility: antigravity, opencodemetadata:  audience: developers  domain: git-workflow  project: arunachala-web---
## What I do
- Manage feature branch creation and merging
- Create and manage pull requests
- Handle release workflows with semantic versioning
- Implement conventional commit standards
- Manage GitHub issue templates and project boards
- Automate code reviews and checks
- Handle repository organization and permissions

## When to use me
Use this when you need to:
- Create new feature branches from develop
- Set up pull request templates
- Configure branch protection rules
- Create releases and changelogs
- Manage GitHub projects/boards
- Set up automated workflows
- Handle repository organization

## Arunachala Web Git Strategy

### Branch Organization
```
main/master     ← Producción (protegida)
develop         ← Integración (protegida)  
feature/*       ← Features individuales
hotfix/*        ← Fixes urgentes
release/*       ← Pre-lanzamiento
```

### Feature Branch Workflow
```bash
# 1. Crear nueva feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-modulo

# 2. Desarrollo y commits convencionales
git add .
git commit -m "feat: implement user authentication"

# 3. Push y crear PR
git push origin feature/nombre-modulo
# → Crear PR: feature/nombre-modulo → develop

# 4. Review y merge
# → Una vez aprobado, hacer merge a develop
git checkout develop
git merge feature/nombre-modulo
git push origin develop
git branch -d feature/nombre-modulo
```

### Release Workflow
```bash
# 1. Crear release branch
git checkout develop
git checkout -b release/v1.0.0

# 2. Últimos ajustes y testing
# → Bump version numbers
# → Final testing
# → Update changelog

# 3. Merge y tag
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git push origin main --tags

# 4. Actualizar develop
git checkout develop
git merge main
git push origin develop
```

## Conventional Commits Standard

### Commit Types
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug  
- `docs`: Documentación
- `style`: Formato/código (no funcional)
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas varias

### Commit Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples
```bash
feat(auth): add JWT token validation
fix(booking): resolve calendar sync issue  
docs(readme): update installation instructions
refactor(database): optimize query performance
test(booking): add unit tests for availability logic
chore(deps): update fastapi to 0.104.1
```

## Pull Request Templates

### Feature PR Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Environment variables documented
```

### Hotfix PR Template  
```markdown
## Hotfix Description
What issue this hotfix resolves.

## Issue Reference
Fixes #<issue_number>

## Testing
- [ ] Verified fix in staging
- [ ] Regression testing completed
- [ ] Production deployment tested

## Deployment
- [ ] Deployed to production
- [ ] Issue closed
```

## GitHub Projects Integration

### Board Structure
```
📋 Arunachala Web Boards
├── 🚀 Backlog (New features)
├── 🔄 In Progress (Current sprint)
├── 🧪 Ready for Review (PRs waiting)
├── ✅ Done (Completed features)
└── 🐛 Bugs (Issues to fix)
```

### Labels System
```
type/feature     → Nuevas funcionalidades
type/bug         → Bugs
type/enhancement → Mejoras
type/docs         → Documentación
priority/high     → Alta prioridad
priority/medium   → Media prioridad  
priority/low      → Baja prioridad
status/blocked     → Bloqueado
status/review      → En revisión
```

## Protection Rules

### Branch Protection
```yaml
# main/master
- Require PR reviews (2+)
- Require status checks pass
- Require up-to-date branch
- Include admins
- Allow force push for emergency

# develop  
- Require PR reviews (1+)
- Require status checks pass
- Require up-to-date branch
- Include admins
```

### Required Status Checks
```
🧪 Test Suite
🔍 Linting  
🔒 Security Scan
📊 Code Coverage (minimum 80%)
🚀 Build Success
```

## Release Management

### Semantic Versioning
```
v1.0.0  → Major (breaking changes)
v1.1.0   → Minor (new features)  
v1.1.1   → Patch (bug fixes)
```

### Changelog Format
```markdown
# [1.0.0] - 2024-01-22

## Added
- User authentication system
- Yoga class booking
- Therapy scheduling

## Fixed  
- Calendar sync issues
- Payment processing bugs

## Changed
- Updated UI components
- Improved database performance

## Deprecated
- Old booking API endpoints
```

## GitHub Actions Workflows

### Automated Checks
```yaml
name: PR Checks
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test && pytest
      - name: Run linting
        run: npm run lint
```

### Auto-release
```yaml  
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Create Release
        uses: actions/create-release@v1
```

## Integration with Arunachala Web

### Module-Specific Workflows
- `feature/home-dual-selector` → Frontend React component
- `feature/yoga-schedule` → Backend API + Frontend UI  
- `feature/therapies-booking` → Database models + API endpoints
- `feature/ai-mantra-generator` → AI integration + content delivery
- `feature/whatsapp-chatbot` → WhatsApp API integration

### Quality Gates
Every PR must include:
1. **Tests**: Unit tests for new functionality
2. **Docs**: Updated documentation
3. **Security**: No hardcoded secrets
4. **Performance**: No database query regressions
5. **Accessibility**: WCAG compliance for UI changes

## Repository Organization

### Team Permissions
```
Owners: @AlbertoSanzAlonso
Maintainers: @team-leads
Developers: @developers
```

### Issue Templates
- **Bug Report**: Reproducción, entorno, pasos, resultados esperados
- **Feature Request**: Caso de uso, requisitos, prioridad
- **Technical Debt**: Descripción, impacto, sugerencia de refactor

## Best Practices
- Use feature branches, never work directly on main/develop
- Write conventional commits with proper scope
- Include tests and documentation with every PR
- Keep PRs small and focused
- Request code reviews early and often
- Update documentation as part of development
- Use GitHub Projects for work tracking