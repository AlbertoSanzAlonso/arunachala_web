import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Footer from "../../components/Footer";

// Mock sencillo de i18next para no depender de los JSON de traducciones
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("Footer", () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

  it("se renderiza sin errores y muestra el nombre de la marca", () => {
    renderFooter();
    expect(screen.getByRole("heading", { name: /ARUNACHALA/i })).toBeInTheDocument();
  });

  it("muestra el email de contacto", () => {
    renderFooter();
    expect(
      screen.getByText("yogayterapiasarunachala@gmail.com")
    ).toBeInTheDocument();
  });
});

