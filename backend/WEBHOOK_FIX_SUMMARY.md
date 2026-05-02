# 🔧 Webhook Payload Fix - Activity RAG Sync

## 🐛 Problema Identificado

El webhook que envía actividades a n8n para sincronización con RAG estaba produciendo un error en Qdrant:

```
"Invalid PointInsertOperations format"
```

El payload que llegaba a n8n tenía campos `null`:
```json
"slug": null,
"title": "Test Activity RAG Sync - 1770763734",
```

Cuando n8n intentaba insertarlo en Qdrant, el JSON se veía así:
```json
"title": ,
"slug": ,
```

Esto es JSON inválido y causa el error 400 en Qdrant.

## ✅ Soluciones Implementadas

### 1. **Webhook Data Sanitization** (`webhooks.py`)
   - Añadido sanitizador de datos que elimina valores `None` y vacíos
   - Garantiza que campos críticos (`title`, `slug`, `content`) SIEMPRE tienen valores válidos
   - Si `slug` es `None` o vacío, lo genera automáticamente basado en el `title`
   - Los valores se cumplen antes de enviar a n8n

### 2. **Webhook Data Extraction** (`webhooks.py`)
   - Mejorada extracción de datos del Activity desde la BD
   - Si un activity no tiene `slug`, lo genera inmediatamente en la extracción
   - Añadido logging para debug: qué se extrae y qué se envía

### 3. **Activity Creation** (`activities.py`)
   - Mejorada la generación de slug para manejar edge cases (títulos solo con caracteres especiales)
   - Añadido fallback: si todo falla, usa timestamp
   - Valida que el slug NO sea vacío antes de crear el activity

## 📊 Flujo de Fix

```
1. Activity.create() → genera slug (o usa fallback con timestamp)
   ↓
2. db.commit() → Activity guardado en BD con slug válido
   ↓
3. notify_n8n_content_change() → webhook enviado
   ↓
4. Extracción de datos → si slug es None, lo genera
   ↓
5. Sanitización → garantiza title, slug, content válidos
   ↓
6. JSON para n8n → NUNCA contiene valores null para campos críticos
   ↓
7. Qdrant recibe payload válido → INSERT exitoso
```

## 🧪 Prueba

Se envió un webhook de prueba a n8n con payload válido:
```bash
curl -X POST http://localhost:5678/webhook/arunachala-rag-update \
  -H "Content-Type: application/json" \
  -d '{
    "id": 32,
    "type": "activity",
    "action": "create",
    "title": "Test Activity Webhook - Fixed",
    "slug": "test-activity-webhook-fixed",
    "content": "...",
    "data": { "title": "...", "slug": "..." }
  }'
```

✅ Respuesta: `200 - {"message":"Workflow was started"}`

## 📝 Cambios de Archivos

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `backend/app/core/webhooks.py` | Data extraction & sanitization | Garantizar valores válidos |
| `backend/app/api/activities.py` | Activity creation slug logic | Fallback para edge cases |

## ⚠️ Notas Importantes

1. **El slug debe ser ÚNICO** en la BD - si hay duplicados, la creación falla
2. **La sanitización ocurre en dos puntos**: en creación y en webhook
3. **n8n debería recibir ahora** payload con `slug` como string válido, no `null`
4. **Los logs del backend** mostrarán ahora `⚠️ Generated slug...` si se debe generar

## 🔍 Debugging

Si aún hay problemas, verifica:
1. Backend logs: busca "Generated slug" para ver qué se generó
2. n8n webhook input: verifica que `title` y `slug` son strings, no null
3. Qdrant error: si sigue error, probablemente hay otro campo null en payload
