
import { getImageUrl } from './imageUtils';

/**
 * Prepara markdown SIN romper listas/negritas
 */
export const prepareMarkdown = (content: string) => {
  if (!content) return '';

  return content
    // saltos escapados IA
    .replace(/\\n/g, '\n')
    .replace(/\\\\n/g, '\n')

    // windows/mac line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

    // comillas escapadas
    .replace(/\\"/g, '"')

    // espacios raros
    .replace(/\u00a0/g, ' ')

    // tabs a espacios
    .replace(/\t/g, ' ')

    // espacios al final línea
    .replace(/[ \t]+\n/g, '\n')

    // máximo 2 saltos
    .replace(/\n{3,}/g, '\n\n')

    // eliminar placeholders basura IA
    .replace(/\[(imagen|image|img|foto)_?\d*\]/gi, '')

    .trim();
};

/**
 * Corrige URLs de imágenes markdown/html
 */
export const fixMediaUrls = (content: string) => {
  if (!content) return '';

  let fixed = content;

  // markdown images
  fixed = fixed.replace(
    /(!\[.*?\]\()([^)]+)(\))/g,
    (_, p1, p2, p3) => `${p1}${getImageUrl(p2)}${p3}`
  );

  // html img tags
  fixed = fixed.replace(
    /(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/gi,
    (_, p1, p2, p3) => `${p1}${getImageUrl(p2)}${p3}`
  );

  return fixed;
};

export const isHtmlContent = (text: string) => {
    if (!text) return false;
    const trimmed = text.trim();
    return trimmed.startsWith('<') && trimmed.includes('>');
};

/**
 * Procesa contenido de blog (Markdown o HTML) y limpia artefactos
 */
export const prepareArticleContent = (content: string) => {
    if (!content) return { processed: '', isHtml: false };
    
    const isHtml = isHtmlContent(content);
    let processed = prepareMarkdown(content);

    if (isHtml) {
        return {
            processed: fixMediaUrls(processed),
            isHtml: true
        };
    }

    // Pure Markdown path - Strip leading H1 for display consistency
    let markdown = processed.replace(/^#\s+.+(\n|$)/, '').trim();

    return { 
        processed: fixMediaUrls(markdown), 
        isHtml: false
    };
};
