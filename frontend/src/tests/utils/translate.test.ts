import { getTranslated } from "../../utils/translate";

describe("getTranslated", () => {
  const baseObj = {
    title: "Título por defecto",
    translations: {
      es: { title: "Título ES", body: "Cuerpo ES" },
      en: { title: "Title EN" },
    },
  };

  it("devuelve el fallback si el objeto es nulo", () => {
    expect(getTranslated(null, "title", "es", "fallback")).toBe("fallback");
  });

  it("usa el campo base cuando no hay lang", () => {
    expect(getTranslated(baseObj, "title", undefined)).toBe("Título por defecto");
  });

  it("usa el código corto del idioma (es-ES → es)", () => {
    expect(getTranslated(baseObj, "title", "es-ES")).toBe("Título ES");
  });

  it("respeta los alias de campos cuando falta el campo principal", () => {
    const obj = {
      translations: {
        es: { content: "Contenido ES" },
      },
    };
    // body tiene alias 'content'
    expect(getTranslated(obj, "body", "es")).toBe("Contenido ES");
  });

  it("cae al campo base cuando no hay traducción", () => {
    expect(getTranslated(baseObj, "title", "ca")).toBe("Título por defecto");
  });
});

