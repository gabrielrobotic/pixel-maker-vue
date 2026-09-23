import { createShader } from './shader'

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  const program = gl.createProgram()

  if (!program) {
    throw new Error('Failed to create WebGL program.')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program)

    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    throw new Error(`Failed to link WebGL program: ${log}`)
  }

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  return program
}
