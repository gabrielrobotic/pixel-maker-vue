import type { Color } from "./types/Color";
import { GridRenderer } from "./grid/GridRenderer";
import { PixelGridRenderer } from "./pixelGrid/PixelGridRenderer";
import type { Vec2 } from "@/shared/math/Vec2";
import type { PixelGrid } from "../model/PixelGrid";

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

    this.#gl.enable(this.#gl.BLEND);
    this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);

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

  updatePixels(pixelGrid: PixelGrid): void {
    this.#pixelGridRenderer.updatePixels(pixelGrid);
  }

  render(transform: Float32Array, camera: Vec2, zoom: number): void {
    this.#gl.clearColor(0.1, 0.1, 0.1, 1.0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

    this.#pixelGridRenderer.render(transform);
    this.#gridRenderer.render(camera, zoom, {
      width: this.#canvas.width,
      height: this.#canvas.height,
    });
  }

  dispose(): void {
    this.#pixelGridRenderer.dispose();
    this.#gridRenderer.dispose();
  }

  setColor(color: Color): void {
    this.#pixelGridRenderer.setColor(color);
    this.#gridRenderer.setColor({ r: 0.65, g: 0.25, b: 0.25, a: 1.0 });
  }
}
