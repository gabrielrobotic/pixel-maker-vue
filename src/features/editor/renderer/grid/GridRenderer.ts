import gridVertShaderSource from "./shaders/grid.vert?raw";
import gridFragShaderSource from "./shaders/grid.frag?raw";

import { ShaderProgram } from "../ShaderProgram";
import type { Color } from "../types/Color";

export class GridRenderer {
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #vao: WebGLVertexArrayObject;
  readonly #buffer: WebGLBuffer;

  readonly #transformLocation: WebGLUniformLocation | null;
  readonly #colorLocation: WebGLUniformLocation | null;

  readonly #vertexCount: number;

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, gridVertShaderSource, gridFragShaderSource);

    this.#vao = this.#gl.createVertexArray()!;
    this.#buffer = this.#gl.createBuffer()!;

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);

    const vertices = this.#createVertices();
    this.#vertexCount = vertices.length / 2;
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(vertices), this.#gl.STATIC_DRAW);

    const position = this.#program.getAttribLocation("a_position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.bindVertexArray(null);

    this.#transformLocation = this.#program.getUniformLocation("u_transform");
    this.#colorLocation = this.#program.getUniformLocation("u_color");
  }

  render(transform: Float32Array): void {
    this.#program.use();

    this.#gl.uniformMatrix3fv(this.#transformLocation, false, transform);

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.drawArrays(this.#gl.LINES, 0, this.#vertexCount);
    this.#gl.bindVertexArray(null);
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

  #createVertices(): number[] {
    const vertices: number[] = [];

    const size = 10;

    for (let x = -size; x <= size; x++) {
      vertices.push(x, -size, x, size);
    }

    for (let y = -size; y <= size; y++) {
      vertices.push(-size, y, size, y);
    }

    return vertices;
  }
}
