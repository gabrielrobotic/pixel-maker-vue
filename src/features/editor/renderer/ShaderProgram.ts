export class ShaderProgram {
  readonly #gl: WebGL2RenderingContext;
  readonly #program: WebGLProgram;

  constructor(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
    this.#gl = gl;

    const vertexShader = this.#createShader(this.#gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.#createShader(this.#gl.FRAGMENT_SHADER, fragmentSource);
    this.#program = this.#createProgram(vertexShader, fragmentShader);

    this.#gl.deleteShader(vertexShader);
    this.#gl.deleteShader(fragmentShader);
  }

  use(): void {
    this.#gl.useProgram(this.#program);
  }

  dispose(): void {
    this.#gl.deleteProgram(this.#program);
  }

  getAttribLocation(name: string): number {
    return this.#gl.getAttribLocation(this.#program, name);
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.#gl.getUniformLocation(this.#program, name);
  }

  #createShader(type: number, source: string): WebGLShader {
    const shader = this.#gl.createShader(type)!;

    this.#gl.shaderSource(shader, source);
    this.#gl.compileShader(shader);

    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      const error = this.#gl.getShaderInfoLog(shader);
      this.#gl.deleteShader(shader);
      throw new Error(error ?? "Erro ao compilar shader.");
    }

    return shader;
  }

  #createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.#gl.createProgram()!;

    this.#gl.attachShader(program, vertexShader);
    this.#gl.attachShader(program, fragmentShader);
    this.#gl.linkProgram(program);

    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      const error = this.#gl.getProgramInfoLog(program);
      this.#gl.deleteProgram(program);
      throw new Error(error ?? "Erro ao linkar program.");
    }

    return program;
  }
}
