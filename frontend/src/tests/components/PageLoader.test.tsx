import React from "react";
import { render, screen } from "@testing-library/react";
import PageLoader from "../../components/ui/PageLoader";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("PageLoader", () => {
  it("muestra un indicador de carga accesible", () => {
    render(<PageLoader />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "common.loading");
    expect(screen.getByText("common.loading")).toHaveClass("sr-only");
  });
});

