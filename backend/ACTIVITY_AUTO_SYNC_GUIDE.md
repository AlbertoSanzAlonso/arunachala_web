# 🚀 Actividad Automática RAG Sync - Guía de Verificación

## ✅ Estado Actual

El webhook **YA ESTÁ CONFIGURADO** para sincronizar automáticamente cada nueva Activity a RAG.

### Flujo Automático

```
1. Dashboard: Crear Activity
   ↓
2. Backend: POST /api/activities
   ↓
3. Guardar en BD
   ↓
4. await notify_n8n_content_change(activity_id, "activity", "create", entity=activity)
   ↓
5. Webhook → N8N http://localhost:5678/webhook/arunachala-rag-update
   ↓
6. N8N procesa el payload
   ↓
7. Qdrant inserta el punto
   ✅ HECHO
```

---

## 🔍 Checklist de Verificación

Si el sync automático NO está funcionando, verifica:

### 1. **Variable de Entorno Configurada**
```bash
# Verifica que N8N_WEBHOOK_URL esté en tu .env
echo $N8N_RAG_WEBHOOK_URL
```

Debe mostrar algo como:
```
http://localhost:5678/webhook/arunachala-rag-update
```

Si está vacío:
```bash
# Añade a tu .env
N8N_RAG_WEBHOOK_URL=http://localhost:5678/webhook/arunachala-rag-update

# Reinicia el backend
```

---

### 2. **Webhook N8N Activo**
```bash
# Verifica que el webhook en n8n está escuchando
curl -X GET http://localhost:5678/webhook/arunachala-rag-update

# Debería devolver error 405 (POST esperado, no GET)
# Eso significa que está escuchando ✅
```

Si devuelve `404`:
- El webhook en n8n no existe o no está activo
- Ve al workflow en n8n y activa el webhook

---

### 3. **Logs del Backend**
Después de crear una Activity, verifica los logs del backend:

```bash
# Busca mensajes como:
# "📤 Sending webhook payload for activity ..."
# "✅ Successfully notified n8n for activity ..."

# Si ves estas líneas → webhook se envió correctamente ✅
# Si NO ves nada → revisa si notify_n8n_content_change() se está llamando
```

---

### 4. **Logs de N8N**
En el dashboard de n8n:
1. Abre el workflow `arunachala-rag-update` (o el que uses)
2. Crea una nueva Activity en el dashboard
3. Verifica en n8n si aparece una ejecución nueva
4. Si aparece → webhook llegó ✅
5. Si no aparece → webhook no se disparó o la URL es incorrecta ❌

---

### 5. **Verificar RAG Status**
```bash
# En el dashboard de Arunachala:
# Ve a Agent Control → RAG Status
# 
# Después de crear una Activity, debería mostrar:
# "Activities Pending: X" 
# donde X aumenta en 1
```

---

## 🛠️ Si Aún No Funciona Automáticamente

### Opción A: Verificar la URL del Webhook

En `backend/.env`:
```env
N8N_RAG_WEBHOOK_URL=http://localhost:5678/webhook/arunachala-rag-update
```

**Importante**: Si n8n está en Docker, puede ser que la URL sea diferente:
```env
# Local (si n8n está en la máquina)
N8N_RAG_WEBHOOK_URL=http://localhost:5678/webhook/arunachala-rag-update

# Docker (si n8n está en contenedor y backend también)
N8N_RAG_WEBHOOK_URL=http://n8n:5678/webhook/arunachala-rag-update

# Docker (si backend está fuera y n8n en contenedor)
N8N_RAG_WEBHOOK_URL=http://host.docker.internal:5678/webhook/arunachala-rag-update
```

### Opción B: Verificar N8N Webhook

En n8n:
1. Abre el workflow
2. Busca el nodo "Webhook Trigger"
3. Verifica que el webhook esté **ACTIVO** (debe tener un icono verde)
4. Copia la URL exacta del webhook desde n8n
5. Compárala con la que tienes en `.env`
6. Si no coinciden → actualiza `.env` y reinicia backend

### Opción C: Probar Webhook Manualmente

```bash
# Envía un test al webhook de n8n
curl -X POST http://localhost:5678/webhook/arunachala-rag-update \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "type": "activity",
    "title": "Test Activity",
    "slug": "test-activity",
    "content": "Test content"
  }'

# Si responde con 200/success → webhook está funcionando ✅
# Si responde con 404 → webhook no existe o URL incorrecta ❌
```

---

## 📊 Flujo Completo Detallado

```
1️⃣  Usuario crea Activity en Dashboard
    └─ POST /api/activities (con title, description, type, etc.)

2️⃣  Backend valida y guarda en BD
    └─ activity.id = 42 (ejemplo)
    └─ activity.slug = "mi-actividad"

3️⃣  Backend llama notify_n8n_content_change()
    └─ Extrae datos: title, slug, description
    └─ Sanitiza payload (garantiza strings válidos)
    └─ Envía POST al webhook de n8n

4️⃣  Webhook dispara en N8N
    ├─ Trigger recibe payload
    ├─ GET_ITEM_DETAILS extrae campos
    ├─ GENERATE_EMBEDDINGS crea vector
    ├─ Qdrant Upsert inserta punto
    └─ Callback notifica al backend: "success"

5️⃣  Backend recibe callback
    └─ Actualiza rag_sync_log: status='success'

6️⃣  RAG Status se actualiza
    └─ Activity ya está searchable por el chatbot
```

---

## ⚡ Optimización: Hacer Sync Más Rápido

Si el sync es muy lento, puedes:

### En Backend:
```python
# En activities.py, cambiar de:
await notify_n8n_content_change(...)  # Espera a que termine

# A:
asyncio.create_task(notify_n8n_content_change(...))  # No espera, dispara y continúa
```

**Ya está así en el código**, así que debería ser rápido.

### En N8N:
- Reduce el timeout en HTTP requests
- Asegúrate de que Qdrant está respondiendo rápido
- Verifica que no hay cuellos de botella en GENERATE_EMBEDDINGS

---

## 🎯 Resumen

✅ **Backend**: Ya llama al webhook automáticamente
✅ **Webhook**: Ya está configurado
✅ **N8N**: Debería estar escuchando
❓ **¿Por qué no sincroniza automáticamente?**

Probable causa:
1. **N8N_RAG_WEBHOOK_URL no está configurada** → Añade a `.env`
2. **Webhook de n8n no está ACTIVO** → Actívalo en n8n
3. **URL del webhook es incorrecta** → Verifica y actualiza `.env`
4. **N8N no está ejecutando el workflow** → Verifica logs de n8n

---

## 📝 Comando Rápido para Resetear

Si quieres asegurar que todo funcione:

```bash
# 1. Verifica que el backend tiene la variable
grep N8N_RAG_WEBHOOK_URL backend/.env

# 2. Si no existe, añádela
echo "N8N_RAG_WEBHOOK_URL=http://localhost:5678/webhook/arunachala-rag-update" >> backend/.env

# 3. Reinicia el backend
# (mátalo con Ctrl+C y vuelve a iniciar)

# 4. Crea una nueva Activity
# 5. Verifica logs del backend
# 6. Verifica que aparece en n8n
```

---

**Próximo paso**: Dime si ves el webhook en los logs del backend cuando creas una Activity, y te ayudaré a depurar el punto específico que falla.
