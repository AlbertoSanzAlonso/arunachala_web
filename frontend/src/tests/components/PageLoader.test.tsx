import React from "react";
import { render, screen } from "@testing-library/react";
import PageLoader from "../../components/PageLoader";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("PageLoader", () => {
  it("muestra el texto de loading", () => {
    render(<PageLoader />);
    // El componente usa t('common.loading'), nuestro mock devuelve la key
    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });
});

