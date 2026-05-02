import React from "react";
import { render, screen } from "@testing-library/react";

// SUT: un componente muy simple definido inline
const HelloTest: React.FC = () => <div>Hola desde los tests</div>;

describe("HelloTest component", () => {
  it("renderiza el texto esperado", () => {
    render(<HelloTest />);
    expect(screen.getByText("Hola desde los tests")).toBeInTheDocument();
  });
});
