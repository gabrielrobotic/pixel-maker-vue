import { EventEmitter } from "@/shared/events/EventEmitter";
import type { Pixel } from "./Pixel";

export class PixelGrid {
  readonly #pixels: Map<string, Pixel> = new Map<string, Pixel>();

  readonly #change = new EventEmitter<void>();

  onChange(listener: () => void): () => void {
    return this.#change.on(listener);
  }

  #key(x: number, y: number): string {
    return `${x}:${y}`;
  }

  get size(): number {
    return this.#pixels.size;
  }

  set(pixel: Pixel): void {
    const key = this.#key(pixel.x, pixel.y);
    const previous = this.#pixels.get(key);

    this.#pixels.set(key, pixel);

    if (previous !== pixel) {
      this.#change.emit();
    }
  }

  get(x: number, y: number): Pixel | null {
    return this.#pixels.get(this.#key(x, y)) ?? null;
  }

  delete(x: number, y: number): boolean {
    const deleted = this.#pixels.delete(this.#key(x, y));

    if (deleted) {
      this.#change.emit();
    }
    return deleted;
  }

  clear(): void {
    if (this.#pixels.size === 0) {
      return;
    }

    this.#pixels.clear();
    this.#change.emit();
  }

  has(x: number, y: number): boolean {
    return this.#pixels.has(this.#key(x, y));
  }

  values(): IterableIterator<Pixel> {
    return this.#pixels.values();
  }
}
