import type { Pixel } from "./Pixel";

export class PixelGrid implements Iterable<Pixel> {
  readonly #pixels: Map<string, Pixel> = new Map<string, Pixel>();

  #key(x: number, y: number): string {
    return `${x}:${y}`;
  }

  get size(): number {
    return this.#pixels.size;
  }

  set(pixel: Pixel): void {
    this.#pixels.set(this.#key(pixel.x, pixel.y), pixel);
  }

  get(x: number, y: number): Pixel | null {
    return this.#pixels.get(this.#key(x, y)) ?? null;
  }

  delete(x: number, y: number): boolean {
    return this.#pixels.delete(this.#key(x, y));
  }

  clear(): void {
    this.#pixels.clear();
  }

  has(x: number, y: number): boolean {
    return this.#pixels.has(this.#key(x, y));
  }

  [Symbol.iterator](): Iterator<Pixel> {
    return this.#pixels.values();
  }
}
