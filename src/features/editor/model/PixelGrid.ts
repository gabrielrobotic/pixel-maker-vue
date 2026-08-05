import type { Pixel } from "./Pixel";

export class PixelGrid {
  readonly #width: number;
  readonly #height: number;

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;
  }

  getPixel(x: number, y: number): Pixel | null {
    if (x < 0 || y < 0 || x >= this.#width || y >= this.#height) return null;

    return { x, y };
  }
}
