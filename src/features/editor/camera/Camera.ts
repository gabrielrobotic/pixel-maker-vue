export class Camera {
  #x: number = 0;
  #y: number = 0;
  #zoom: number = 50;

  #width: number = 0;
  #height: number = 0;

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  get zoom(): number {
    return this.#zoom;
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

  setViewport(width: number, height: number): void {
    this.#width = width;
    this.#height = height;
  }

  setPosition(x: number, y: number): void {
    this.#x = x;
    this.#y = y;
  }

  setZoom(zoom: number): void {
    this.#zoom = Math.max(0.1, zoom);
  }

  screenToWorld(x: number, y: number): { x: number; y: number } {
    return {
      x: (x - this.#width / 2) / this.#zoom + this.#x,
      y: (this.#height / 2 - y) / this.#zoom + this.#y,
    };
  }

  moveByScreen(screenDx: number, screenDy: number): void {
    this.#x -= screenDx / this.#zoom;
    this.#y += screenDy / this.#zoom;
  }
}
