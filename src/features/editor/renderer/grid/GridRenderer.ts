import gridVertShaderSource from "./shaders/grid.vert?raw";
import gridFragShaderSource from "./shaders/grid.frag?raw";

import { ShaderProgram } from "../ShaderProgram";
import type { Color } from "../types/Color";
import type { Bounds } from "../types/Bounds";

export class GridRenderer {
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #vao: WebGLVertexArrayObject;
  readonly #buffer: WebGLBuffer;

  readonly #transformLocation: WebGLUniformLocation | null;
  readonly #colorLocation: WebGLUniformLocation | null;

  #lastVisibleBounds: Bounds | null = null;
  #vertexCount: number = 0;

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, gridVertShaderSource, gridFragShaderSource);

    this.#vao = this.#gl.createVertexArray()!;
    this.#buffer = this.#gl.createBuffer()!;

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);

    const position = this.#program.getAttribLocation("a_position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.bindVertexArray(null);

    this.#transformLocation = this.#program.getUniformLocation("u_transform");
    this.#colorLocation = this.#program.getUniformLocation("u_color");
  }

  render(transform: Float32Array, visibleBounds: Bounds): void {
    const boundsChanged =
      !this.#lastVisibleBounds ||
      this.#lastVisibleBounds.minX !== visibleBounds.minX ||
      this.#lastVisibleBounds.maxX !== visibleBounds.maxX ||
      this.#lastVisibleBounds.minY !== visibleBounds.minY ||
      this.#lastVisibleBounds.maxY !== visibleBounds.maxY;

    if (boundsChanged) {
      const vertices = this.#createVertices(visibleBounds);

      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);
      this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(vertices), this.#gl.DYNAMIC_DRAW);

      this.#vertexCount = vertices.length / 2;
      this.#lastVisibleBounds = { ...visibleBounds };
    }

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

  #createVertices(bounds: Bounds): number[] {
    const vertices: number[] = [];

    const minX = Math.floor(bounds.minX) - 0;
    const maxX = Math.ceil(bounds.maxX) + 0;
    const minY = Math.floor(bounds.minY) - 0;
    const maxY = Math.ceil(bounds.maxY) + 0;

    for (let x = minX; x <= maxX; x++) {
      vertices.push(x, minY, x, maxY);
    }

    for (let y = minY; y <= maxY; y++) {
      vertices.push(minX, y, maxX, y);
    }

    return vertices;
  }
}
