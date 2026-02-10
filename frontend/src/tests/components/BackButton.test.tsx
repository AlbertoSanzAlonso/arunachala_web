import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import BackButton from "../../components/BackButton";

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("BackButton", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("se renderiza con el label por defecto", () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    );
    expect(screen.getByText("Volver al inicio")).toBeInTheDocument();
  });

  it("acepta un label personalizado", () => {
    render(
      <MemoryRouter>
        <BackButton label="Volver atrás" />
      </MemoryRouter>
    );
    expect(screen.getByText("Volver atrás")).toBeInTheDocument();
  });

  it("navega a '/' por defecto al hacer clic", () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navega a la ruta personalizada si se proporciona 'to'", () => {
    render(
      <MemoryRouter>
        <BackButton to="/blog" />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/blog");
  });
});
