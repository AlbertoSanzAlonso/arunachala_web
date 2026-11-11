
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

const LOWER = 'a-záéíóúüñ';
const UPPER = 'A-ZÁÉÍÓÚÜÑ';
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

const gluedCamel = () => new RegExp(`([${LOWER}@]{5,})([${UPPER}])`, 'g');
const gluedSentence = () => new RegExp(`([.!?…:])([¿¡]?)([${UPPER}])`, 'g');
const gluedQuestion = () => new RegExp(`([${LOWER}]{2,}[¿¡])([${UPPER}])`, 'g');

/** Texto visible, sin etiquetas: sirve para saber si el editor sigue mostrando frases pegadas. */
export const hasGluedLineBreaks = (text: string) => {
    if (!text) return false;
    return gluedCamel().test(text) || gluedSentence().test(text) || gluedQuestion().test(text);
};

const splitGluedText = (text: string) => text
    .replace(gluedCamel(), '$1</p><p>$2')
    .replace(gluedSentence(), '$1$2</p><p>$3')
    .replace(gluedQuestion(), '$1</p><p>$2');

/**
 * Recupera saltos perdidos al pegar frases ("coordinaciónFortalece", "descansar.Cada").
 * Solo parte texto que ya vive dentro de un <p>, así el corte `</p><p>` sigue siendo HTML válido.
 * No parte camelCase corto (WhatsApp, AeroNidrā).
 */
export const restoreGluedLineBreaks = (html: string) => {
    if (!html || !isHtmlContent(html)) return html;

    const parts: string[] = [];
    const stack: string[] = [];
    const tokens = html.match(/<[^>]+>|[^<]+/g) || [];

    tokens.forEach((token) => {
        if (!token.startsWith('<')) {
            const parent = stack[stack.length - 1];
            parts.push(parent === 'p' ? splitGluedText(token) : token);
            return;
        }

        parts.push(token);
        const tag = /^<\/?\s*([a-zA-Z0-9]+)/.exec(token);
        if (!tag) return;
        const name = tag[1].toLowerCase();
        if (token.startsWith('</')) {
            if (stack[stack.length - 1] === name) stack.pop();
            return;
        }
        if (token.endsWith('/>') || VOID_TAGS.has(name)) return;
        stack.push(name);
    });

    return parts.join('');
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
            processed: fixMediaUrls(restoreGluedLineBreaks(processed)),
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
