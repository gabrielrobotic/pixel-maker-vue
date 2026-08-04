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
      new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]),
      this.#gl.STATIC_DRAW,
    );

    const position = this.#program.getAttribLocation("position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.bindVertexArray(null);

    this.#colorLocation = this.#program.getUniformLocation("color");
  }

  resize(): void {
    const dpr = window.devicePixelRatio;
    const width = Math.floor(this.#canvas.clientWidth * dpr);
    const height = Math.floor(this.#canvas.clientHeight * dpr);

    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }

    this.#gl.viewport(0, 0, width, height);
    this.render();
  }

  render(): void {
    this.#gl.clearColor(0.1, 0.1, 0.1, 1.0);
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

    this.#program.use();

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 3);
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
