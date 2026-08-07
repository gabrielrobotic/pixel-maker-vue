import vertexShaderSource from "./shaders/default.vert?raw";
import fragmentShaderSource from "./shaders/default.frag?raw";
import { ShaderProgram } from "./ShaderProgram";
import type { Color } from "./types/Color";
import { Pixel } from "../model/Pixel";
import type { PixelGrid } from "../model/PixelGrid";
import { GridRenderer } from "./grid/GridRenderer";

export class WebGLRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #buffer: WebGLBuffer;
  readonly #vao: WebGLVertexArrayObject;

  readonly #colorLocation: WebGLUniformLocation | null;
  readonly #positionLocation: WebGLUniformLocation | null;
  readonly #transformLocation: WebGLUniformLocation | null;

  readonly #gridRenderer: GridRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL 2.0 não está disponível.");

    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, vertexShaderSource, fragmentShaderSource);

    this.#buffer = this.#gl.createBuffer()!;
    this.#vao = this.#gl.createVertexArray()!;

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);

    this.#gl.bufferData(
      this.#gl.ARRAY_BUFFER,
      new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
      this.#gl.STATIC_DRAW,
    );

    const position = this.#program.getAttribLocation("a_position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.bindVertexArray(null);

    this.#transformLocation = this.#program.getUniformLocation("u_transform");
    this.#colorLocation = this.#program.getUniformLocation("u_color");
    this.#positionLocation = this.#program.getUniformLocation("u_position");

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

    this.#program.use();

    this.#gl.uniformMatrix3fv(this.#transformLocation, false, transform);

    this.#gl.bindVertexArray(this.#vao);
    for (const pixel of grid) {
      this.#drawPixel(pixel);
    }
    this.#gl.bindVertexArray(null);

    this.#gridRenderer.render(transform);
  }

  dispose(): void {
    this.#gl.deleteBuffer(this.#buffer);
    this.#gl.deleteVertexArray(this.#vao);
    this.#program.dispose();
  }

  setColor(color: Color): void {
    this.#program.use();

    if (!this.#colorLocation) return;
    this.#gl.uniform4f(this.#colorLocation, color.r, color.g, color.b, color.a);
  }

  #drawPixel(pixel: Pixel) {
    this.#gl.uniform2f(this.#positionLocation, pixel.x, pixel.y);
    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4);
  }
}
