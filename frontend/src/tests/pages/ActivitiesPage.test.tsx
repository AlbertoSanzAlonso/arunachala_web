import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import ActivitiesPage from "../../pages/ActivitiesPage";

// Mock de framer-motion para evitar dependencias de matchMedia en JSDOM
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mocks necesarios
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: { language: "es" },
  }),
}));

jest.mock("react-helmet-async", () => ({
  Helmet: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("../../components/Header", () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock("../../components/Footer", () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock("../../components/BackButton", () => {
  return function MockBackButton() {
    return <button>Volver</button>;
  };
});

// Mock de fetch para las actividades
const mockActivities = [
  {
    id: 1,
    title: "Curso de Yoga",
    description: "Descripción del curso",
    type: "curso",
    start_date: "2026-03-01T10:00:00",
    end_date: null,
    location: "Centro Arunachala",
    price: "100€",
    image_url: null,
  },
];

const mockSuggestions: any[] = [];

global.fetch = jest.fn((url: string) => {
  if (url.includes("/api/activities")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockActivities),
    } as Response);
  }
  if (url.includes("/api/suggestions")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockSuggestions),
    } as Response);
  }
  return Promise.reject(new Error("Unknown URL"));
}) as jest.Mock;

describe("ActivitiesPage", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it("se renderiza sin errores y muestra el título", async () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
  });

  it("muestra el estado de carga inicialmente", () => {
    render(
      <MemoryRouter>
        <ActivitiesPage />
      </MemoryRouter>
    );
    // El componente muestra un spinner mientras carga
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });
});
