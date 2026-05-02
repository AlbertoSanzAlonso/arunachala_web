# 🔧 N8N Qdrant Upsert Configuration Fix

## 🐛 Problema Identificado

Después de actualizar `GET_ITEM_DETAILS`, el payload de Qdrant sigue mostrando:
```json
"title": [undefined],
"slug": [undefined],
```

Esto ocurre porque el paso de **Qdrant Upsert** está construyendo el payload incorrectamente usando `JSON.stringify()`.

---

## ✅ Solución

### El Problema en el Paso de Qdrant Upsert

Si el paso actual está haciendo algo como:
```javascript
"title": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.title) }},
"slug": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.slug) }},
```

Esto es INCORRECTO porque:
1. Los valores ya son strings (después de la mejora a GET_ITEM_DETAILS)
2. `JSON.stringify()` no debe aplicarse a nivel de propiedad
3. Si el valor es `undefined`, `JSON.stringify(undefined)` produce el literal `undefined`

### Forma Correcta de Configurar el Payload

El paso de Qdrant Upsert debe construir el payload así:

```javascript
{
  "points": [
    {
      "id": {{ $node["GET_ITEM_DETAILS"].json.qdrant_id }},
      "vector": {{ $node["GENERATE_EMBEDDINGS"].json.vector }},
      "payload": {
        "title": {{ $node["GET_ITEM_DETAILS"].json.title }},
        "slug": {{ $node["GET_ITEM_DETAILS"].json.slug }},
        "content": {{ $node["GET_ITEM_DETAILS"].json.full_text }},
        "type": "{{ $node["GET_ITEM_DETAILS"].json.type }}",
        "source": "dashboard",
        "metadata": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.metadata) }},
        "updated_at": "{{ new Date().toISOString() }}"
      }
    }
  ]
}
```

**Cambios clave:**
- ✅ `"title": {{ $node["GET_ITEM_DETAILS"].json.title }}` - sin `JSON.stringify()`
- ✅ `"slug": {{ $node["GET_ITEM_DETAILS"].json.slug }}` - sin `JSON.stringify()`
- ✅ Solo aplicar `JSON.stringify()` a objetos complejos como `metadata`

---

## 📋 Paso a Paso para Actualizar N8N

### 1. Abre el Nodo de Qdrant Upsert

En tu workflow de n8n, localiza el nodo que inserta en Qdrant.

### 2. Verifica la Configuración Actual

Si el nodo tiene algo como:
```
Body:
{
  "points": [
    {
      "id": "{{ ... }}",
      "vector": [...],
      "payload": {
        "title": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.title) }},
        "slug": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.slug) }},
        ...
      }
    }
  ]
}
```

### 3. REEMPLAZA con la Configuración Correcta

```json
{
  "points": [
    {
      "id": "{{ $node['GET_ITEM_DETAILS'].json.qdrant_id }}",
      "vector": {{ $node["GENERATE_EMBEDDINGS"].json.vector }},
      "payload": {
        "title": "{{ $node['GET_ITEM_DETAILS'].json.title }}",
        "slug": "{{ $node['GET_ITEM_DETAILS'].json.slug }}",
        "content": "{{ $node['GET_ITEM_DETAILS'].json.full_text }}",
        "type": "{{ $node['GET_ITEM_DETAILS'].json.type }}",
        "source": "dashboard",
        "metadata": {{ JSON.stringify($node['GET_ITEM_DETAILS'].json.metadata) }},
        "updated_at": "{{ new Date().toISOString() }}"
      }
    }
  ]
}
```

---

## 🔑 Diferencias Importantes

| Campo | ❌ INCORRECTO | ✅ CORRECTO |
|-------|--------------|-----------|
| `title` | `{{ JSON.stringify(...) }}` | `"{{ ... }}"` |
| `slug` | `{{ JSON.stringify(...) }}` | `"{{ ... }}"` |
| `content` | `{{ JSON.stringify(...) }}` | `"{{ ... }}"` |
| `metadata` | `{{ ... }}` | `{{ JSON.stringify(...) }}` |

**Regla general:**
- Strings y primitivos: encierra en comillas `"{{ ... }}"`
- Objetos/Arrays: usa `{{ JSON.stringify(...) }}`

---

## 🧪 Verificación Post-Fix

1. **Actualiza el nodo de Qdrant Upsert** con la configuración correcta
2. **Crea una nueva Massage o Activity** en el dashboard
3. **Verifica el payload en Qdrant logs**:
   ```json
   "title": "Masaje Ayurvédico Abhyanga",  // ✅ String válido
   "slug": "masaje-ayurvedico-abhyanga",    // ✅ String válido
   ```
4. **Si ves `[undefined]`** → el paso de Qdrant aún tiene la configuración antigua

---

## 📝 Cambios Completados

| Componente | Estado | Descripción |
|-----------|--------|------------|
| Backend webhooks.py | ✅ Arreglado | Sanitización multi-capa |
| Backend activities.py | ✅ Arreglado | Generación de slug mejorada |
| N8N GET_ITEM_DETAILS | ✅ Arreglado | Nunca devuelve undefined |
| **N8N Qdrant Upsert** | ⏳ **PENDIENTE** | Debe actualizar manualmente |

---

## ⚠️ Causa Raíz

El problema final era que n8n estaba haciendo:
```javascript
JSON.stringify(undefined)  // → undefined (literal string)
```

Que luego se convertía en el array literal `[undefined]` en el JSON.

**Solución**: No aplicar `JSON.stringify()` a valores primitivos, solo a objetos.

---

## 🆘 Si Sigue Fallando

1. **Copia exactamente** el payload de arriba
2. **Reemplaza** TODO el body del nodo de Qdrant Upsert
3. **Verifica** que las rutas a `GET_ITEM_DETAILS` sean correctas (el nombre del nodo)
4. **Test**: crea una entidad y verifica logs en Qdrant
