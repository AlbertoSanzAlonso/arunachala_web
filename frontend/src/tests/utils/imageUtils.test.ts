import {
  getImageUrl,
  getContentThumbnailSrc,
  DEFAULT_THUMBNAIL_PATHS,
} from '../../utils/imageUtils';

const SUPABASE = 'https://vybpihtssncjalbsnbcr.supabase.co/storage/v1/object/public/arunachala-images';
const SITE = 'https://www.yogayterapiasarunachala.es';

describe('getImageUrl', () => {
  it('devuelve cadena vacía si url es nula o indefinida', () => {
    expect(getImageUrl(null as any)).toBe('');
    expect(getImageUrl(undefined as any)).toBe('');
  });

  it('devuelve la url tal cual si ya es absoluta (http/https)', () => {
    const absolute = 'https://example.com/image.webp';
    expect(getImageUrl(absolute)).toBe(absolute);
  });

  it('devuelve vacío para URLs blob o file (no deben ir al API)', () => {
    expect(getImageUrl('blob:https://www.example.com/uuid')).toBe('');
    expect(getImageUrl('file:///tmp/x.webp')).toBe('');
  });

  it('sirve meditation_default desde el sitio (public/), no Supabase', () => {
    expect(getImageUrl('/gallery/articles/meditation_default.webp')).toBe(
      `${SITE}/gallery/articles/meditation_default.webp`
    );
    expect(getImageUrl('/static/gallery/articles/meditation_default.webp')).toBe(
      `${SITE}/gallery/articles/meditation_default.webp`
    );
  });

  it('redirige otras rutas /static/ al bucket de Supabase', () => {
    expect(getImageUrl('/static/gallery/articles/om_symbol.webp')).toBe(
      `${SUPABASE}/gallery/articles/om_symbol.webp`
    );
  });

  it('preprende API_BASE_URL si es una ruta relativa sin /static/', () => {
    const relative = 'media/img.webp';
    const result = getImageUrl(relative);
    expect(result).toContain('media/img.webp');
  });
});

describe('getContentThumbnailSrc', () => {
  it('usa miniatura por defecto de meditación si no hay url', () => {
    const src = getContentThumbnailSrc(null, 'meditation');
    expect(src).toContain('meditation_default.webp');
    expect(src).toContain(SITE);
  });

  it('preserva blob en sesión para el recorte en dashboard', () => {
    const blob = 'blob:https://localhost/abc';
    expect(getContentThumbnailSrc(blob, 'meditation')).toBe(blob);
  });
});

describe('DEFAULT_THUMBNAIL_PATHS', () => {
  it('define rutas de fallback', () => {
    expect(DEFAULT_THUMBNAIL_PATHS.meditation).toContain('meditation_default');
  });
});
