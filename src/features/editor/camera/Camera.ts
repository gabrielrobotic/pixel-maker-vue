import type { Vec2 } from "@/shared/math/Vec2";
import type { Bounds } from "../renderer/types/Bounds";

export class Camera {
  #x: number = 0;
  #y: number = 0;
  #zoom: number = 1;

  #width: number = 0;
  #height: number = 0;

  get zoom(): number {
    return this.#zoom;
  }

  get position(): Vec2 {
    return {
      x: this.#x,
      y: this.#y,
    };
  }

  getTransform(): Float32Array {
    const sx = (2 * this.#zoom) / this.#width;
    const sy = (2 * this.#zoom) / this.#height;

    return new Float32Array([
      // 1 2 3
      sx,
      0,
      0,
      // 4 5 6
      0,
      sy,
      0,
      // 7 8 9
      -this.#x * sx,
      -this.#y * sy,
      1,
    ]);
  }

  getVisibleBounds(): Bounds {
    const worldWidth = this.#width / this.#zoom;
    const worldHeight = this.#height / this.#zoom;

    return {
      minX: this.#x - worldWidth / 2,
      maxX: this.#x + worldWidth / 2,
      minY: this.#y - worldHeight / 2,
      maxY: this.#y + worldHeight / 2,
    };
  }

  setViewport(width: number, height: number): void {
    this.#width = width;
    this.#height = height;
  }

  setPosition(position: Vec2): void {
    this.#x = position.x;
    this.#y = position.y;
  }

  setZoom(zoom: number): void {
    this.#zoom = Math.min(120, Math.max(0.01, zoom));
  }

  screenToWorld(x: number, y: number): Vec2 {
    return {
      x: (x - this.#width / 2) / this.#zoom + this.#x,
      y: (this.#height / 2 - y) / this.#zoom + this.#y,
    };
  }

  moveByScreen(screenDelta: Vec2): void {
    this.#x -= screenDelta.x / this.#zoom;
    this.#y += screenDelta.y / this.#zoom;
  }
}
