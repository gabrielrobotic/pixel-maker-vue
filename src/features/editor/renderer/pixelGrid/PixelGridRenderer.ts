import pixelVertShaderSource from "./shaders/pixel.vert?raw";
import pixelFragShaderSource from "./shaders/pixel.frag?raw";

import { ShaderProgram } from "../ShaderProgram";
import type { PixelGrid } from "../../model/PixelGrid";
import type { Color } from "../types/Color";

export class PixelGridRenderer {
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #vao: WebGLVertexArrayObject;
  readonly #buffer: WebGLBuffer;
  readonly #instanceBuffer: WebGLBuffer;

  readonly #transformLocation: WebGLUniformLocation | null;
  readonly #colorLocation: WebGLUniformLocation | null;

  #instanceCount = 0;

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, pixelVertShaderSource, pixelFragShaderSource);

    this.#vao = this.#gl.createVertexArray()!;
    this.#buffer = this.#gl.createBuffer()!;
    this.#instanceBuffer = this.#gl.createBuffer()!;

    this.#gl.bindVertexArray(this.#vao);

    // Geometria base do pixel
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);
    const pixelShape = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, pixelShape, this.#gl.STATIC_DRAW);

    const position = this.#program.getAttribLocation("a_position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);

    // Posição de cada instância
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#instanceBuffer);
    const instancePosition = this.#program.getAttribLocation("a_instancePosition");

    this.#gl.enableVertexAttribArray(instancePosition);
    this.#gl.vertexAttribPointer(instancePosition, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.vertexAttribDivisor(instancePosition, 1);

    this.#gl.bindVertexArray(null);

    this.#transformLocation = this.#program.getUniformLocation("u_transform");
    this.#colorLocation = this.#program.getUniformLocation("u_color");
  }

  updatePixels(pixelGrid: PixelGrid): void {
    const positions = new Float32Array(pixelGrid.size * 2);

    let index = 0;

    for (const pixel of pixelGrid.values()) {
      positions[index++] = pixel.x;
      positions[index++] = pixel.y;
    }

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#instanceBuffer);

    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, positions, this.#gl.DYNAMIC_DRAW);

    this.#instanceCount = pixelGrid.size;
  }

  render(transform: Float32Array): void {
    this.#program.use();

    this.#gl.uniformMatrix3fv(this.#transformLocation, false, transform);

    this.#gl.bindVertexArray(this.#vao);

    this.#gl.drawArraysInstanced(this.#gl.TRIANGLE_STRIP, 0, 4, this.#instanceCount);

    this.#gl.bindVertexArray(null);
  }

  dispose(): void {
    this.#program.dispose();
    this.#gl.deleteVertexArray(this.#vao);
    this.#gl.deleteBuffer(this.#buffer);
    this.#gl.deleteBuffer(this.#instanceBuffer);
  }

  setColor(color: Color): void {
    this.#program.use();

    if (!this.#colorLocation) return;
    this.#gl.uniform4f(this.#colorLocation, color.r, color.g, color.b, color.a);
  }
}
