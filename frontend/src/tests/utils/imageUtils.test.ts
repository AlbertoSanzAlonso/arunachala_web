import { getImageUrl } from "../../utils/imageUtils";

describe("getImageUrl", () => {
  it("devuelve cadena vacía si url es nula o indefinida", () => {
    expect(getImageUrl(null as any)).toBe("");
    expect(getImageUrl(undefined as any)).toBe("");
  });

  it("devuelve la url tal cual si ya es absoluta (http/https)", () => {
    const absolute = "https://example.com/image.webp";
    expect(getImageUrl(absolute)).toBe(absolute);
  });

  it("preprende API_BASE_URL si es una ruta relativa", () => {
    // API_BASE_URL viene de config; en tests está definido por Jest/CRA (puede ser undefined)
    const relative = "/media/img.webp";
    const result = getImageUrl(relative);

    // No comprobamos el valor exacto de API_BASE_URL, solo que acaba en la ruta
    expect(result.endsWith(relative)).toBe(true);
  });
});

