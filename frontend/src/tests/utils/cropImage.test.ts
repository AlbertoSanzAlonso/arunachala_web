import { getRadianAngle, rotateSize } from "../../utils/cropImage";

describe("cropImage utils", () => {
  it("getRadianAngle convierte grados a radianes correctamente", () => {
    expect(getRadianAngle(0)).toBe(0);
    expect(getRadianAngle(180)).toBeCloseTo(Math.PI);
    expect(getRadianAngle(90)).toBeCloseTo(Math.PI / 2);
  });

  it("rotateSize calcula el bounding box de la imagen rotada", () => {
    const { width, height } = rotateSize(100, 50, 90);

    // Con 90 grados, el ancho y alto deberían invertirse (aprox)
    expect(width).toBeCloseTo(50, 0);
    expect(height).toBeCloseTo(100, 0);
  });
});

