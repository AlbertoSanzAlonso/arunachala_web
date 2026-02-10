# 🔧 N8N Workflow: GET_ITEM_DETAILS Update for Activity Support

## 📋 Problema

El nodo `GET_ITEM_DETAILS` en n8n fue diseñado originalmente solo para **Articles**, pero ahora necesita manejar múltiples tipos de entidades:
- ✅ Articles (blog posts)
- ✅ Yoga Classes
- ✅ Massages
- ✅ Therapies
- ❌ **Activities** (FALTABA - Por eso `title` y `slug` llegaban como `undefined`)

Cuando el webhook enviaba una `activity`, el nodo no sabía extraer correctamente los campos `title` y `slug`, resultando en `null` en Qdrant.

## ✅ Solución

Se mejoró el nodo JavaScript `GET_ITEM_DETAILS` para:

### 1. **Agregar soporte para Activities**
```javascript
} else if (type === 'activity') {
  // Extrae: title, slug, description, type, location, price, etc.
  name = data.title || data.name || 'Sin nombre';
  description = data.description || data.content || 'Sin descripción';
  // ... genera fullText con info de activity
}
```

### 2. **Garantizar que `title` y `slug` siempre se devuelvan**
```javascript
return {
  json: {
    id: data.id,
    type: type,
    title: name,        // ✅ Incluir explícitamente
    slug: slug,         // ✅ Incluir explícitamente
    full_text: fullText,
    metadata: {
      title: name,      // ✅ También en metadata
      slug: slug,
      // ...
    }
  }
};
```

### 3. **Limpiar `undefined` y asegurar valores válidos**
```javascript
const slug = data.slug || '';  // Nunca undefined
const name = data.title || data.name || 'Sin nombre';  // Fallback
```

## 🔄 Cómo Actualizar en N8N

### Opción A: Reemplazar el código del nodo (RECOMENDADO)
1. Abre tu workflow en n8n: `arunachala-rag-update` (o similar)
2. Localiza el nodo `GET_ITEM_DETAILS` (nodo JavaScript)
3. **Reemplaza TODO el código** con el contenido de `GET_ITEM_DETAILS_improved.js`
4. Guarda el workflow
5. Prueba con una Activity

### Opción B: Usar el archivo directamente
Si n8n soporta importar archivos JavaScript:
```
Copiar contenido de: /home/albertosanzdev/Projects/arunachala_web/n8n-workflows/GET_ITEM_DETAILS_improved.js
```

## 📊 Flujo Ahora

```
Webhook → (activity) → GET_ITEM_DETAILS mejorado
  ↓
Extrae: title="Test Activity", slug="test-activity"
  ↓
Devuelve JSON con title y slug como STRINGS
  ↓
Nodo siguiente puede usar sin problemas:
  "title": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.title) }}
  "slug": {{ JSON.stringify($node["GET_ITEM_DETAILS"].json.slug) }}
```

## 🧪 Prueba Post-Update

1. **Crea una nueva Activity en el dashboard**
2. **Verifica en n8n logs** que el nodo recibe:
   ```json
   {
     "type": "activity",
     "title": "Mi Actividad",
     "slug": "mi-actividad",
     "full_text": "..."
   }
   ```
3. **Verifica en Qdrant** que se insertan correctamente (sin JSON errors)

## 📝 Cambios Aplicados

| Campo | Antes | Ahora |
|-------|-------|-------|
| `type === 'activity'` | ❌ No manejado | ✅ Soportado |
| `title` en output | `undefined` | `string válido` |
| `slug` en output | `undefined` | `string válido` |
| Fallbacks | No había | ✅ Incluidos |
| Validación de campos | Parcial | ✅ Completa |

## ⚠️ Notas Importantes

1. **Compatibilidad hacia atrás**: El código sigue soportando articles, yoga, massage, therapy sin cambios
2. **Nombres de campos flexibles**: Acepta tanto `title`/`name`, `description`/`content`, etc.
3. **Slug generación**: Si la activity no tiene slug, lo deja vacío (backend ya lo genera)
4. **Metadata duplicada**: Los campos críticos (title, slug) aparecen en root y en metadata para máxima compatibilidad

## 🔗 Referencia

- **Backend**: Garantiza que `title` y `slug` nunca sean null (webhooks.py)
- **N8N**: Ahora extrae correctamente estos campos (GET_ITEM_DETAILS)
- **Qdrant**: Recibe JSON válido sin campos null

**Resultado**: 🎉 Activities se sincronizan correctamente con RAG
