import { renderHook, act } from "@testing-library/react";
import { useToast } from "../../hooks/useToast";

describe("useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("inicializa con un array vacío de toasts", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it("añade un toast de éxito", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success("Operación exitosa");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[0].message).toBe("Operación exitosa");
  });

  it("añade un toast de error", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.error("Error al procesar");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("error");
    expect(result.current.toasts[0].message).toBe("Error al procesar");
  });

  it("añade un toast de warning", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.warning("Advertencia");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("warning");
  });

  it("añade un toast de info", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.info("Información");
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("info");
  });

  it("elimina un toast cuando se llama a removeToast", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success("Test");
    });
    const toastId = result.current.toasts[0].id;
    act(() => {
      result.current.removeToast(toastId);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("elimina automáticamente un toast después de la duración especificada", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success("Test", 1000);
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("no elimina automáticamente si duration es 0", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.success("Test", 0);
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.toasts).toHaveLength(1);
  });
});
