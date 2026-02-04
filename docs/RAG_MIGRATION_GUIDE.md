# 🔄 Sistema RAG Mejorado - Guía de Migración n8n

## 📋 Resumen de Cambios

Tu flujo de n8n **SIGUE SIENDO VÁLIDO**, solo necesita un pequeño ajuste para aprovechar el nuevo sistema de tracking.

### ✅ Lo que NO cambia:
- El webhook trigger sigue igual
- Fetch de data desde Backend API
- Generación de embeddings con OpenAI
- Upsert a Qdrant

### 🆕 Lo que agregamos:
- **Callback al backend** para reportar éxito/fallo
- **Mejor tracking** de sincronización
- **Recuperación ante fallos** automática

---

## 🔄 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. BACKEND: Detecta cambio en contenido                       │
│    (yoga_class, massage, therapy, content, activity)          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND: Crea log y envía webhook a n8n                    │
│    - Crea entrada en rag_sync_log (status: 'pending')         │
│    - Marca needs_reindex = TRUE                               │
│    - Envía POST a N8N_WEBHOOK_URL con:                        │
│      { id, type, action, log_id }                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. N8N: Procesa contenido                                     │
│    - Fetch data desde /api/[type]/[id]                        │
│    - Genera embeddings (OpenAI text-embedding-3-small)        │
│    - Upsert a Qdrant collection                               │
│    - Obtiene vector_id de Qdrant                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. N8N: Reporta resultado al backend (✨ NUEVO)               │
│    - POST /api/rag/sync-callback                              │
│    - Envía: { log_id, entity_type, entity_id,                │
│               vector_id, status, metadata }                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND: Actualiza estado                                  │
│    - Actualiza rag_sync_log.status = 'success'                │
│    - Actualiza entity.vector_id = [id de Qdrant]              │
│    - Actualiza entity.needs_reindex = FALSE                   │
│    - Actualiza entity.vectorized_at = NOW()                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Modificación de tu Workflow n8n

### **Paso 1: Webhook Trigger** (sin cambios)

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "rag-sync",
        "httpMethod": "POST"
      }
    }
  ]
}
```

**Datos que recibes ahora**:
```json
{
  "id": 123,
  "type": "yoga_class",
  "action": "update",
  "log_id": 456  // ✨ NUEVO - para tracking
}
```

---

### **Paso 2-4: Fetch, Embed, Upsert** (sin cambios)

Tus nodos actuales siguen igual:
- HTTP Request para fetch data
- OpenAI Node para embeddings
- HTTP Request a Qdrant

---

### **Paso 5: Callback al Backend** ✨ NUEVO

Agrega este nodo **AL FINAL** de tu workflow:

#### **Node: HTTP Request "Update Backend Status"**

**Settings:**
- **URL**: `https://tu-backend.com/api/rag/sync-callback`
- **Method**: `POST`
- **Authentication**: None (o la que uses)
- **Body**:

```json
{
  "log_id": {{ $node["Webhook"].json["log_id"] }},
  "entity_type": {{ $node["Webhook"].json["type"] }},
  "entity_id": {{ $node["Webhook"].json["id"] }},
  "vector_id": {{ $node["Upsert to Qdrant"].json["result"][0]["id"] }},
  "status": "success",
  "metadata": {
    "model": "text-embedding-3-small",
    "language": "es",
    "qdrant_collection": "arunachala_knowledge",
    "processed_at": "{{ $now }}"
  }
}
```

**⚠️ IMPORTANTE**: Ajusta los nombres de los nodos según tu workflow.

---

### **Paso 6: Error Handler** (opcional pero recomendado)

Agrega un nodo de error handling que también notifique al backend:

```json
{
  "log_id": {{ $node["Webhook"].json["log_id"] }},
  "entity_type": {{ $node["Webhook"].json["type"] }},
  "entity_id": {{ $node["Webhook"].json["id"] }},
  "status": "failed",
  "error_message": "{{ $json.error.message }}",
  "metadata": {
    "failed_at": "{{ $now }}",
    "error_details": "{{ $json }}"
  }
}
```

---

## 🔍 Ejemplo Completo de Workflow n8n

```
┌──────────────┐
│   Webhook    │ → Recibe: { id, type, action, log_id }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Switch by   │ → Separa por tipo (yoga_class, massage, etc.)
│     Type     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Fetch Data  │ → GET /api/yoga-classes/{{ $json.id }}
│  from API    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Prepare    │ → Combina name + description + translations
│   Content    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   OpenAI     │ → text-embedding-3-small
│  Embeddings  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Upsert to   │ → collection: arunachala_knowledge
│    Qdrant    │   punto: { id, vector, payload }
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Update     │ → POST /api/rag/sync-callback
│   Backend    │   { log_id, vector_id, status: "success" }
└──────────────┘
```

---

## 📊 Monitoreo y Debugging

### **1. Ver estado de sincronización**

```bash
# Desde el backend
python scripts/sync_rag.py --status
```

o

```bash
curl https://tu-backend.com/api/rag/sync-status
```

**Respuesta**:
```json
{
  "yoga_classes": {
    "total": 5,
    "vectorized": 5,
    "needs_reindex": 0,
    "sync_percentage": 100.0
  },
  "massage_types": {
    "total": 5,
    "vectorized": 4,
    "needs_reindex": 1,
    "sync_percentage": 80.0
  },
  ...
}
```

### **2. Ver logs de sincronización**

```bash
curl https://tu-backend.com/api/rag/sync-logs?limit=20&status_filter=failed
```

### **3. Re-sincronizar contenido fallido**

```bash
# Desde el backend
python scripts/sync_rag.py --sync-all
```

---

## 🎯 Beneficios del Sistema Mejorado

### ✅ **Antes** (solo webhook):
- ❌ No sabías si el webhook llegó a n8n
- ❌ No sabías si Qdrant lo procesó correctamente
- ❌ Si n8n fallaba, perdías el cambio
- ❌ No podías re-sincronizar contenido fácilmente

### ✅ **Ahora** (con tracking):
- ✅ Sabes exactamente qué contenido está vectorizado
- ✅ Detectas fallos inmediatamente
- ✅ Puedes re-sincronizar contenido con un comando
- ✅ Tienes historial completo de operaciones
- ✅ Dashboard visual de estado de sincronización

---

## 🚀 Testing

### **1. Probar el flujo completo**

```bash
# Crear una clase de yoga nueva desde el dashboard
# Deberías ver en los logs del backend:
# ✅ Created RAG sync log entry #X for yoga_class 123
# ✅ Successfully notified n8n for yoga_class 123 (create)

# En n8n deberías ver el workflow ejecutarse

# Luego verificar:
curl https://tu-backend.com/api/rag/sync-status
```

### **2. Probar callback manual**

```bash
curl -X POST https://tu-backend.com/api/rag/sync-callback \
  -H "Content-Type: application/json" \
  -d '{
    "log_id": 1,
    "entity_type": "yoga_class",
    "entity_id": 1,
    "vector_id": "abc123-def456",
    "status": "success",
    "metadata": {"model": "text-embedding-3-small"}
  }'
```

---

## 📝 Checklist de Migración

- [ ] Actualizar workflow n8n con nodo de callback
- [ ] Probar webhook trigger
- [ ] Verificar que callback se envía correctamente
- [ ] Comprobar que `vector_id` se guarda en BD
- [ ] Agregar error handling en n8n
- [ ] Probar re-sincronización con script
- [ ] Configurar monitoreo de `/api/rag/sync-status`

---

## ❓ FAQ

**P: ¿Tengo que cambiar algo en mi código de backend actual?**  
R: Solo actualizar las llamadas a `notify_n8n_content_change()` para pasar el parámetro `db`.

**P: ¿Qué pasa si n8n no está disponible?**  
R: El log se crea con status 'failed'. Luego puedes re-sincronizar con el script.

**P: ¿Puedo seguir usando el flujo antiguo temporalmente?**  
R: Sí, el sistema es backward compatible. El callback es opcional.

**P: ¿Cómo re-sincronizo todo el contenido existente?**  
R: `python scripts/sync_rag.py --force-all`

---

## 🔗 Endpoints Nuevos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/rag/sync-callback` | POST | n8n reporta resultado de vectorización |
| `/api/rag/sync-status` | GET | Estado de sincronización de todo el contenido |
| `/api/rag/sync-logs` | GET | Historial de operaciones RAG |

---

¡Listo! Tu sistema RAG ahora es mucho más robusto y fácil de monitorear 🎉
