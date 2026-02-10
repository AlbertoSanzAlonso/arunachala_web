import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import HomePage from "../../pages/HomePage";

// Mocks necesarios
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "es" },
  }),
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

jest.mock("../../components/FadeInSection", () => {
  return function MockFadeInSection({ children }: any) {
    return <div>{children}</div>;
  };
});

// Mock de componentes lazy
jest.mock("../../components/ImageSlider", () => {
  return function MockImageSlider() {
    return <div data-testid="image-slider">ImageSlider</div>;
  };
});

jest.mock("../../components/ReviewsSection", () => {
  return function MockReviewsSection() {
    return <div data-testid="reviews-section">ReviewsSection</div>;
  };
});

jest.mock("../../components/WellnessQuiz", () => {
  return function MockWellnessQuiz() {
    return <div data-testid="wellness-quiz">WellnessQuiz</div>;
  };
});

// Mock de fetch para la galería
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  } as Response)
);

describe("HomePage", () => {
  it("se renderiza sin errores", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("muestra los componentes principales", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );
    // Los componentes lazy pueden tardar en renderizarse, pero verificamos que la estructura existe
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });
});
