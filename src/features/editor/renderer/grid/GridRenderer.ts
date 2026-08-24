import gridVertShaderSource from "./shaders/grid.vert?raw";
import gridFragShaderSource from "./shaders/grid.frag?raw";

import { ShaderProgram } from "../ShaderProgram";
import type { Color } from "../types/Color";
import type { Vec2 } from "@/shared/math/Vec2";

export class GridRenderer {
  readonly #gl: WebGL2RenderingContext;

  readonly #program: ShaderProgram;
  readonly #vao: WebGLVertexArrayObject;
  readonly #buffer: WebGLBuffer;

  readonly #colorLocation: WebGLUniformLocation | null;
  readonly #viewportSizeLocation: WebGLUniformLocation | null;
  readonly #cameraPositionLocation: WebGLUniformLocation | null;
  readonly #zoomLocation: WebGLUniformLocation | null;

  #vertexCount: number = 0;

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;

    this.#program = new ShaderProgram(this.#gl, gridVertShaderSource, gridFragShaderSource);

    this.#vao = this.#gl.createVertexArray()!;
    this.#buffer = this.#gl.createBuffer()!;

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer);

    const vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
    this.#vertexCount = 4;
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(vertices), this.#gl.STATIC_DRAW);

    const position = this.#program.getAttribLocation("a_position");

    this.#gl.enableVertexAttribArray(position);
    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0);
    this.#gl.bindVertexArray(null);

    this.#colorLocation = this.#program.getUniformLocation("u_color");
    this.#viewportSizeLocation = this.#program.getUniformLocation("u_viewportSize");
    this.#cameraPositionLocation = this.#program.getUniformLocation("u_cameraPosition");
    this.#zoomLocation = this.#program.getUniformLocation("u_zoom");
  }

  render(
    cameraPosition: Vec2,
    zoom: number,
    viewportSize: { width: number; height: number },
  ): void {
    this.#program.use();

    this.#gl.uniform2f(this.#viewportSizeLocation, viewportSize.width, viewportSize.height);
    this.#gl.uniform2f(this.#cameraPositionLocation, cameraPosition.x, cameraPosition.y);
    this.#gl.uniform1f(this.#zoomLocation, zoom);

    this.#gl.bindVertexArray(this.#vao);
    this.#gl.drawArrays(this.#gl.TRIANGLE_STRIP, 0, this.#vertexCount);
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
}
