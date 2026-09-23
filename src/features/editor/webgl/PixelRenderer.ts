import { createProgram } from './program'
import vertexSource from '@/features/editor/webgl/shaders/pixel.vert?raw'
import fragmentSource from '@/features/editor/webgl/shaders/pixel.frag?raw'
import { createPixelInstanceBuffer } from './pixelInstanceBuffer'

export class PixelRenderer {
  private readonly program: WebGLProgram
  private readonly vertexArray: WebGLVertexArrayObject
  private readonly vertexBuffer: WebGLBuffer
  private readonly instanceBuffer: WebGLBuffer

  private readonly worldToNdcLocation: WebGLUniformLocation
  private readonly colorLocation: WebGLUniformLocation

  constructor(private readonly gl: WebGL2RenderingContext) {
    const geometryPositions = new Float32Array([
      0, 0, 1, 0, 0, 1,

      0, 1, 1, 0, 1, 1,
    ])

    this.program = createProgram(gl, vertexSource, fragmentSource)

    this.vertexArray = gl.createVertexArray()
    if (!this.vertexArray) throw new Error('Failed to create vertex array.')

    gl.bindVertexArray(this.vertexArray)

    this.vertexBuffer = gl.createBuffer()
    if (!this.vertexBuffer) throw new Error('Failed to create vertex buffer.')

    const a_position = gl.getAttribLocation(this.program, 'a_position')
    if (a_position < 0) throw new Error('Attribute a_position not found.')

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, geometryPositions, gl.STATIC_DRAW)

    gl.enableVertexAttribArray(a_position)
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindVertexArray(null)

    gl.bindVertexArray(this.vertexArray)
    this.instanceBuffer = createPixelInstanceBuffer(gl, this.program, new Float32Array())
    gl.bindVertexArray(null)

    const u_worldToNdc = gl.getUniformLocation(this.program, 'u_worldToNdc')
    if (!u_worldToNdc) throw new Error('Uniform u_worldToNdc not found.')

    const u_color = gl.getUniformLocation(this.program, 'u_color')
    if (!u_color) throw new Error('Uniform u_color not found.')

    this.worldToNdcLocation = u_worldToNdc
    this.colorLocation = u_color
  }

  public render(
    worldToNdc: Float32Array,
    positions: Float32Array,
    color: [number, number, number, number],
  ): void {
    const { gl } = this

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vertexArray)

    gl.uniformMatrix3fv(this.worldToNdcLocation, false, worldToNdc)
    gl.uniform4fv(this.colorLocation, color)

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, positions.length / 2)

    gl.useProgram(null)
    gl.bindVertexArray(null)
  }

  public dispose(): void {
    const { gl } = this

    gl.deleteBuffer(this.instanceBuffer)
    gl.deleteBuffer(this.vertexBuffer)
    gl.deleteVertexArray(this.vertexArray)
    gl.deleteProgram(this.program)
  }
}
