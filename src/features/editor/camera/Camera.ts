import type { Vec2 } from "@/shared/math/Vec2";
import type { Bounds } from "../renderer/types/Bounds";
import { EventEmitter } from "@/shared/events/EventEmitter";

export class Camera {
  #position: Vec2 = { x: 0, y: 0 };
  #zoom: number = 1;

  #viewport = { width: 0, height: 0 };

  readonly #change = new EventEmitter<void>();

  onChange(listener: () => void): () => void {
    return this.#change.on(listener);
  }

  get zoom(): number {
    return this.#zoom;
  }

  get position(): Vec2 {
    return this.#position;
  }

  getTransform(): Float32Array {
    const sx = (2 * this.#zoom) / this.#viewport.width;
    const sy = (2 * this.#zoom) / this.#viewport.height;

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
      -this.#position.x * sx,
      -this.#position.y * sy,
      1,
    ]);
  }

  getVisibleBounds(): Bounds {
    const worldWidth = this.#viewport.width / this.#zoom;
    const worldHeight = this.#viewport.height / this.#zoom;

    return {
      minX: this.#position.x - worldWidth / 2,
      maxX: this.#position.x + worldWidth / 2,
      minY: this.#position.y - worldHeight / 2,
      maxY: this.#position.y + worldHeight / 2,
    };
  }

  setViewport(width: number, height: number): void {
    if (width === this.#viewport.width && height === this.#viewport.height) {
      return;
    }

    this.#viewport = { width, height };
    this.#change.emit();
  }

  setPosition(position: Vec2): void {
    if (position.x === this.#position.x && position.y === this.#position.y) {
      return;
    }

    this.#position = position;
    this.#change.emit();
  }

  setZoom(zoom: number): void {
    this.#zoom = Math.min(120, Math.max(0.01, zoom));

    this.#change.emit();
  }

  screenToWorld(x: number, y: number): Vec2 {
    return {
      x: (x - this.#viewport.width / 2) / this.#zoom + this.#position.x,
      y: (this.#viewport.height / 2 - y) / this.#zoom + this.#position.y,
    };
  }

  moveByScreen(screenDelta: Vec2): void {
    this.setPosition({
      x: this.#position.x - screenDelta.x / this.#zoom,
      y: this.#position.y + screenDelta.y / this.#zoom,
    });
  }
}
