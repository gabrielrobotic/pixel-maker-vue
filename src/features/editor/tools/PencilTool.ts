import { sub, type Vec2 } from "@/shared/math/Vec2";
import { Pixel } from "../model/Pixel";
import type { PixelGrid } from "../model/PixelGrid";

export class PencilTool {
  #pixelGrid: PixelGrid;
  #lastPixel: Pixel | null = null;

  constructor(pixelGrid: PixelGrid) {
    this.#pixelGrid = pixelGrid;
  }

  draw(pixel: Pixel): void {
    if (!this.#lastPixel) {
      this.#drawPixel(pixel);
      this.#lastPixel = pixel;
      return;
    }

    this.#drawLine(this.#lastPixel, pixel);
    this.#lastPixel = pixel;
  }

  endStroke(): void {
    this.#lastPixel = null;
  }

  #drawPixel(pixel: Pixel): void {
    this.#pixelGrid.set(pixel);
  }

  #drawLine(start: Pixel, end: Pixel): void {
    const currentPosition: Vec2 = {
      x: start.x,
      y: start.y,
    };

    const endPosition: Vec2 = {
      x: end.x,
      y: end.y,
    };

    const delta = sub(endPosition, currentPosition);

    const step: Vec2 = {
      x: delta.x < 0 ? -1 : 1,
      y: delta.y < 0 ? -1 : 1,
    };

    const distance: Vec2 = {
      x: Math.abs(delta.x),
      y: Math.abs(delta.y),
    };

    let error = distance.x - distance.y;

    while (true) {
      this.#drawPixel(new Pixel(currentPosition.x, currentPosition.y));

      if (currentPosition.x === endPosition.x && currentPosition.y === endPosition.y) {
        break;
      }

      const doubledError = error * 2;

      if (doubledError > -distance.y) {
        error -= distance.y;
        currentPosition.x += step.x;
      }

      if (doubledError < distance.x) {
        error += distance.x;
        currentPosition.y += step.y;
      }
    }
  }
}
