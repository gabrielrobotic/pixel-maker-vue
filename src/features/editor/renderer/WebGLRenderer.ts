import vShaderRaw from "./shaders/default.vert?raw";
import fShaderRaw from "./shaders/default.frag?raw";
import { ShaderProgram } from "./ShaderProgram";
import type { Color } from "./types/Color";

export class WebGLRenderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #buffer: WebGLBuffer;
  readonly #vao: WebGLVertexArrayObject;

  readonly #colorLocation: WebGLUniformLocation | null;
  readonly #transformLocation: WebGLUniformLocation | null;

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;

    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("WebGL 2.0 não está disponível.");

    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, vShaderRaw, fShaderRaw);

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

  render(transform: Float32Array): void {
    this.#gl.clearColor(0.1, 0.1, 0.1, 1.0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

    this.#program.use();

    this.#gl.uniformMatrix3fv(this.#transformLocation, false, transform);

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4);
    this.#gl.bindVertexArray(null);
  }

  dispose(): void {
    this.#gl.deleteBuffer(this.#buffer);
    this.#gl.deleteProgram(this.#program);
    this.#gl.deleteVertexArray(this.#vao);
  }

  setColor(color: Color): void {
    this.#program.use();

    if (!this.#colorLocation) return;
    this.#gl.uniform4f(this.#colorLocation, color.r, color.g, color.b, color.a);
  }
}
