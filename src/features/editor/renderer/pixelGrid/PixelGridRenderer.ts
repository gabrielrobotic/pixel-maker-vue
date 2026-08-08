import pixelVertShaderSource from "./shaders/pixel.vert?raw";
import pixelFragShaderSource from "./shaders/pixel.frag?raw";

import { ShaderProgram } from "../ShaderProgram";
import type { PixelGrid } from "../../model/PixelGrid";
import type { Pixel } from "../../model/Pixel";
import type { Color } from "../types/Color";

export class PixelGridRenderer {
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #vao: WebGLVertexArrayObject;
  readonly #buffer: WebGLBuffer;

  readonly #positionLocation: WebGLUniformLocation | null;
  readonly #transformLocation: WebGLUniformLocation | null;
  readonly #colorLocation: WebGLUniformLocation | null;

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, pixelVertShaderSource, pixelFragShaderSource);

    this.#vao = this.#gl.createVertexArray()!;
    this.#buffer = this.#gl.createBuffer()!;

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);

    const pixelShape = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, pixelShape, this.#gl.STATIC_DRAW);

    const position = this.#program.getAttribLocation("a_position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.bindVertexArray(null);

    this.#positionLocation = this.#program.getUniformLocation("u_position");
    this.#transformLocation = this.#program.getUniformLocation("u_transform");
    this.#colorLocation = this.#program.getUniformLocation("u_color");
  }

  render(transform: Float32Array, pixelGrid: PixelGrid): void {
    this.#program.use();

    this.#gl.uniformMatrix3fv(this.#transformLocation, false, transform);

    this.#gl.bindVertexArray(this.#vao);
    for (const pixel of pixelGrid) {
      this.#drawPixel(pixel);
    }
    this.#gl.bindVertexArray(null);
  }

  dispose(): void {
    this.#program.dispose();
    this.#gl.deleteVertexArray(this.#vao);
    this.#gl.deleteBuffer(this.#buffer);
  }

  setColor(color: Color): void {
    this.#program.use();

    if (!this.#colorLocation) return;
    this.#gl.uniform4f(this.#colorLocation, color.r, color.g, color.b, color.a);
  }

  #drawPixel(pixel: Pixel): void {
    this.#gl.uniform2f(this.#positionLocation, pixel.x, pixel.y);
    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, 4);
  }
}
