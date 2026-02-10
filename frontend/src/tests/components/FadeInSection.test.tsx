import React from "react";
import { render } from "@testing-library/react";
import FadeInSection from "../../components/FadeInSection";

// Mock de framer-motion para evitar problemas con animaciones en tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useInView: () => true, // Simula que siempre está en vista
}));

describe("FadeInSection", () => {
  it("renderiza sus hijos correctamente", () => {
    const { getByText } = render(
      <FadeInSection>
        <div>Contenido de prueba</div>
      </FadeInSection>
    );
    expect(getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("acepta className personalizado", () => {
    const { container } = render(
      <FadeInSection className="custom-class">
        <div>Test</div>
      </FadeInSection>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("acepta un delay personalizado", () => {
    const { container } = render(
      <FadeInSection delay={0.5}>
        <div>Test</div>
      </FadeInSection>
    );
    // El delay se pasa como prop, no verificamos el comportamiento de animación
    expect(container.firstChild).toBeInTheDocument();
  });
});
