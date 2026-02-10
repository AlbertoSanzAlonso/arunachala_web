// Nodo GET_ITEM_DETAILS mejorado - Maneja: articles, yoga_class, massage, therapy, activity
// Este nodo estructura los datos de diferentes tipos de entidades para RAG

const webhookData = $node["Webhook Trigger"].json;
const itemType = (webhookData.body && webhookData.body.type) || 'article';

// Iteramos sobre todos los ítems de entrada
return $input.all().map(item => {
  const data = item.json;
  let fullText = "";
  let name = "";
  let excerpt = "";
  let description = "";
  
  // Determinamos el tipo de entidad del webhook
  const type = data.type || itemType;

  if (type === 'yoga_class') {
    // ========== YOGA CLASS ==========
    name = data.name || 'Sin nombre';
    description = data.description || 'Sin descripción disponible.';
    excerpt = data.age_range || '';
    
    fullText = `Clase de Yoga: ${name}\n`;
    fullText += `Descripción: ${description}\n`;
    if (data.age_range) fullText += `Nivel/Edad: ${data.age_range}\n`;

    if (data.schedules && Array.isArray(data.schedules) && data.schedules.length > 0) {
      const activeSchedules = data.schedules
        .filter(s => s.is_active)
        .map(s => `- ${s.day_of_week}: ${s.start_time} a ${s.end_time}`)
        .join('\n');
      
      if (activeSchedules) {
        fullText += `\nHorarios disponibles:\n${activeSchedules}`;
      }
    }
    
  } else if (type === 'massage' || type === 'therapy') {
    // ========== MASSAGE / THERAPY ==========
    const categoria = type === 'massage' ? 'Masaje' : 'Terapia';
    name = data.name || 'Sin nombre';
    description = data.description || 'Sin descripción';
    excerpt = data.excerpt || '';
    
    fullText = `${name} es un tratamiento de ${categoria}.\n`;
    fullText += `${data.excerpt || data.description || ''}\n\n`;
    fullText += `Duración: ${data.duration_min || '60'} minutos.\n`;
    if (data.benefits) fullText += `Beneficios: ${data.benefits}.`;
    
  } else if (type === 'activity') {
    // ========== ACTIVITY (NUEVO) ==========
    // Activities tienen: id, title, description, slug, type (curso/taller/evento/retiro), content
    name = data.title || data.name || 'Sin nombre';
    description = data.description || data.content || 'Sin descripción';
    excerpt = data.activity_data?.options ? data.activity_data.options.join(', ') : '';
    
    fullText = `Actividad: ${name}\n`;
    fullText += `Tipo: ${data.type || 'No especificado'}\n`;
    fullText += `${description}\n`;
    
    if (data.location) fullText += `Ubicación: ${data.location}\n`;
    if (data.price) fullText += `Precio: ${data.price}\n`;
    if (data.start_date) fullText += `Fecha: ${data.start_date}\n`;
    
    // Si tiene opciones (schedule options), las incluimos
    if (data.activity_data?.options && Array.isArray(data.activity_data.options)) {
      fullText += `Opciones disponibles:\n${data.activity_data.options.map(opt => `- ${opt}`).join('\n')}\n`;
    }
    
  } else {
    // ========== ARTICLE / CONTENT (GENÉRICO) ==========
    name = data.title || data.name || 'Sin título';
    description = data.body || data.content || 'Sin contenido';
    excerpt = data.excerpt || '';
    
    fullText = `Título: ${name}\n`;
    fullText += `Contenido: ${description}`;
  }

  // Limpieza de saltos de línea dobles
  fullText = fullText.trim().replace(/\n\s*\n/g, '\n');

  // Generamos un ID de cadena único basado en tipo e ID
  const uniqueIdString = `${type}_${data.id}`;

  const createUUID = (str) => {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(str).digest("hex");
  };

  const qdrantId = createUUID(uniqueIdString);
  
  // Extraemos slug si existe (importante para Activities y Articles)
  const slug = data.slug || '';
  
  return {
    json: {
      id: data.id,
      type: type,
      qdrant_id: qdrantId,
      title: name,           // CRÍTICO: incluir title
      slug: slug,            // CRÍTICO: incluir slug
      full_text: fullText,
      metadata: {
        name: name,
        title: name,         // Duplicado para compatibilidad
        slug: slug,          // Duplicado para compatibilidad
        excerpt: excerpt || null,
        description: description || null,
        benefits: data.benefits || null,
        duration_min: data.duration_min || null,
        category: type,
        updated_at: data.updated_at || new Date().toISOString()
      }
    }
  };
});
