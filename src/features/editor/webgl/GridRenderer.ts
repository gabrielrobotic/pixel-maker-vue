import { createProgram } from './program'
import vertexSource from '@/features/editor/webgl/shaders/grid.vert?raw'
import fragmentSource from '@/features/editor/webgl/shaders/grid.frag?raw'

export class GridRenderer {
  private readonly program: WebGLProgram
  private readonly vertexArray: WebGLVertexArrayObject
  private readonly vertexBuffer: WebGLBuffer

  private readonly ndcToWorldLocation: WebGLUniformLocation
  private readonly gridSizeLocation: WebGLUniformLocation
  private readonly gridTransitionLocation: WebGLUniformLocation
  private readonly gridSectionScaleLocation: WebGLUniformLocation

  constructor(private readonly gl: WebGL2RenderingContext) {
    const geometryPositions = new Float32Array([
      -1, -1, 1, -1, -1, 1,

      -1, 1, 1, -1, 1, 1,
    ])

    this.program = createProgram(gl, vertexSource, fragmentSource)
    this.vertexArray = createVertexArray(gl)
    this.vertexBuffer = createVertexBuffer(gl, this.program, geometryPositions)

    const u_ndcToWorld = gl.getUniformLocation(this.program, 'u_ndcToWorld')
    if (!u_ndcToWorld) throw new Error('Uniform u_ndcToWorld not found.')

    const u_gridSize = gl.getUniformLocation(this.program, 'u_gridSize')
    if (!u_gridSize) throw new Error('Uniform u_gridSize not found.')

    const u_gridTransition = gl.getUniformLocation(this.program, 'u_gridTransition')
    if (!u_gridTransition) throw new Error('Uniform u_gridTransition not found.')

    const u_gridSectionScale = gl.getUniformLocation(this.program, 'u_gridSectionScale')
    if (!u_gridSectionScale) throw new Error('Uniform u_gridSectionScale not found.')

    this.ndcToWorldLocation = u_ndcToWorld
    this.gridSizeLocation = u_gridSize
    this.gridTransitionLocation = u_gridTransition
    this.gridSectionScaleLocation = u_gridSectionScale
  }

  public render(
    ndcToWorld: Float32Array,
    gridSize: number,
    transition: number,
    sectionScale: number,
  ): void {
    const { gl } = this

    gl.useProgram(this.program)
    gl.bindVertexArray(this.vertexArray)

    gl.uniformMatrix3fv(this.ndcToWorldLocation, false, ndcToWorld)
    gl.uniform1f(this.gridSizeLocation, gridSize)
    gl.uniform1f(this.gridTransitionLocation, transition)
    gl.uniform1f(this.gridSectionScaleLocation, sectionScale)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    gl.useProgram(null)
    gl.bindVertexArray(null)
  }

  public dispose(): void {
    const { gl } = this

    gl.deleteBuffer(this.vertexBuffer)
    gl.deleteVertexArray(this.vertexArray)
    gl.deleteProgram(this.program)
  }
}
