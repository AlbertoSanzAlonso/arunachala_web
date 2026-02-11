import React from "react";
import { render, screen } from "@testing-library/react";
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
    render(
      <FadeInSection>
        <div>Contenido de prueba</div>
      </FadeInSection>
    );
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("acepta className personalizado", () => {
    render(
      <FadeInSection className="custom-class" data-testid="fade-section">
        <div>Test</div>
      </FadeInSection>
    );
    expect(screen.getByTestId("fade-section")).toHaveClass("custom-class");
  });

  it("acepta un delay personalizado", () => {
    render(
      <FadeInSection delay={0.5} data-testid="fade-section-delay">
        <div>Test</div>
      </FadeInSection>
    );
    // El delay se pasa como prop, no verificamos el comportamiento de animación
    expect(screen.getByTestId("fade-section-delay")).toBeInTheDocument();
  });
});
