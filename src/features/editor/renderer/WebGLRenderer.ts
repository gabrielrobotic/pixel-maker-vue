import type { Color } from "./types/Color";
import type { PixelGrid } from "../model/PixelGrid";
import { GridRenderer } from "./grid/GridRenderer";
import { PixelGridRenderer } from "./pixelGrid/PixelGridRenderer";

export class WebGLRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #gl: WebGL2RenderingContext;

  readonly #pixelGridRenderer: PixelGridRenderer;
  readonly #gridRenderer: GridRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL 2.0 não está disponível.");

    this.#gl = gl;

    this.#pixelGridRenderer = new PixelGridRenderer(this.#gl);
    this.#gridRenderer = new GridRenderer(this.#gl);
  }

  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio;
    const pixelWidth = Math.floor(width * dpr);
    const pixelHeight = Math.floor(height * dpr);

    if (this.#canvas.width !== pixelWidth || this.#canvas.height !== pixelHeight) {
      this.#canvas.width = pixelWidth;
      this.#canvas.height = pixelHeight;
    }

    this.#gl.viewport(0, 0, pixelWidth, pixelHeight);
  }

  render(transform: Float32Array, grid: PixelGrid): void {
    this.#gl.clearColor(0.1, 0.1, 0.1, 1.0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

    this.#pixelGridRenderer.render(transform, grid);
    this.#gridRenderer.render(transform);
  }

  dispose() {
    this.#pixelGridRenderer.dispose();
    this.#gridRenderer.dispose();
  }

  setColor(color: Color): void {
    this.#pixelGridRenderer.setColor(color);
  }
}
