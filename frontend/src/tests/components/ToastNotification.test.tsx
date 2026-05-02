import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ToastNotification, {
  Toast,
} from "../../components/ToastNotification";

// Mock de framer-motion para evitar dependencias de matchMedia en JSDOM
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("ToastNotification", () => {
  const baseToast: Toast = {
    id: "1",
    type: "success",
    message: "Operación correcta",
  };

  it("renderiza el mensaje del toast", () => {
    const onRemove = jest.fn();
    render(<ToastNotification toasts={[baseToast]} onRemove={onRemove} />);

    expect(screen.getByText("Operación correcta")).toBeInTheDocument();
  });

  it("llama a onRemove al hacer clic en el botón de cerrar", () => {
    const onRemove = jest.fn();
    render(<ToastNotification toasts={[baseToast]} onRemove={onRemove} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(onRemove).toHaveBeenCalledWith("1");
  });
});

