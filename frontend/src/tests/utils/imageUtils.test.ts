import {
  getImageUrl,
  getContentThumbnailSrc,
  DEFAULT_THUMBNAIL_PATHS,
} from '../../utils/imageUtils';

const LEGACY_PUBLIC =
  'https://example.invalid/storage/v1/object/public/arunachala-images';

describe('getImageUrl', () => {
  it('devuelve cadena vacía si url es nula o indefinida', () => {
    expect(getImageUrl(null as any)).toBe('');
    expect(getImageUrl(undefined as any)).toBe('');
  });

  it('devuelve vacío para URLs blob o file (no deben ir al API)', () => {
    expect(getImageUrl('blob:https://www.example.com/uuid')).toBe('');
    expect(getImageUrl('file:///tmp/x.webp')).toBe('');
  });

  it('sirve meditation_default desde el sitio (public/)', () => {
    const src = getImageUrl('/gallery/articles/meditation_default.webp');
    expect(src).toMatch(/\/gallery\/articles\/meditation_default\.webp$/);
    expect(getImageUrl('/static/gallery/articles/meditation_default.webp')).toMatch(
      /\/gallery\/articles\/meditation_default\.webp$/
    );
  });

  it('sirve rutas /static/ desde la API (disco local)', () => {
    const { API_BASE_URL } = require('../../config');
    expect(getImageUrl('/static/gallery/articles/om_symbol.webp')).toBe(
      `${API_BASE_URL.replace(/\/$/, '')}/static/gallery/articles/om_symbol.webp`
    );
  });

  it('reescribe URLs de storage público legado hacia MinIO', () => {
    const legacy = `${LEGACY_PUBLIC}/gallery/articles/om_symbol.webp`;
    expect(getImageUrl(legacy)).toBe(
      'https://media.yogayterapiasarunachala.es/arunachala-media/gallery/articles/om_symbol.webp'
    );
  });

  it('deja URLs http externas tal cual', () => {
    const absolute = 'https://example.com/image.webp';
    expect(getImageUrl(absolute)).toBe(absolute);
  });

  it('deja URLs de MinIO/media tal cual', () => {
    const media = 'https://media.yogayterapiasarunachala.es/arunachala-media/gallery/x.webp';
    expect(getImageUrl(media)).toBe(media);
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
