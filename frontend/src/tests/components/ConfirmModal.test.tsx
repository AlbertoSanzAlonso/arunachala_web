import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "../../components/ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no se renderiza cuando open es false", () => {
    render(<ConfirmModal {...defaultProps} open={false} />);
    expect(screen.queryByText("¿Seguro?")).not.toBeInTheDocument();
  });

  it("muestra el título y mensaje por defecto", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("¿Seguro?")).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
  });

  it("acepta título y mensaje personalizados", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este elemento?"
      />
    );
    expect(screen.getByText("Confirmar eliminación")).toBeInTheDocument();
    expect(screen.getByText("¿Estás seguro de eliminar este elemento?")).toBeInTheDocument();
  });

  it("llama a onConfirm y onClose al hacer clic en confirmar", () => {
    render(<ConfirmModal {...defaultProps} />);
    const confirmButton = screen.getByText("Confirmar");
    fireEvent.click(confirmButton);
    expect(defaultProps.onConfirm).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("llama solo a onClose al hacer clic en cancelar", () => {
    render(<ConfirmModal {...defaultProps} />);
    const cancelButton = screen.getByText("Cancelar");
    fireEvent.click(cancelButton);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("muestra textos personalizados para los botones", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Eliminar"
        cancelText="No eliminar"
      />
    );
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
    expect(screen.getByText("No eliminar")).toBeInTheDocument();
  });
});
