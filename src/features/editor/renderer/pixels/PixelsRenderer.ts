import pixelVertShaderSource from './shaders/pixel.vert?raw'
import pixelFragShaderSource from './shaders/pixel.frag?raw'

import { ShaderProgram } from '../ShaderProgram'
import type { Color } from '../../domain/Color'
import type { Pixel } from '../../domain/Pixel'
import type { Chunk } from '../../domain/Chunk'

export class PixelsRenderer {
  readonly #gl: WebGL2RenderingContext

  readonly #program: ShaderProgram
  readonly #vao: WebGLVertexArrayObject
  readonly #buffer: WebGLBuffer
  readonly #instanceBuffers = new Map<string, WebGLBuffer>()

  readonly #transformLocation: WebGLUniformLocation | null
  readonly #colorLocation: WebGLUniformLocation | null

  readonly #instanceCounts = new Map<string, number>()

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl

    this.#program = new ShaderProgram(this.#gl, pixelVertShaderSource, pixelFragShaderSource)

    this.#vao = this.#gl.createVertexArray()!
    this.#buffer = this.#gl.createBuffer()!

    this.#gl.bindVertexArray(this.#vao)

    // Geometria base do pixel
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffer)

    const pixelShape = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])

    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, pixelShape, this.#gl.STATIC_DRAW)

    const position = this.#program.getAttribLocation('a_position')

    this.#gl.enableVertexAttribArray(position)

    this.#gl.vertexAttribPointer(position, 2, this.#gl.FLOAT, false, 0, 0)

    this.#gl.bindVertexArray(null)

    this.#transformLocation = this.#program.getUniformLocation('u_transform')

    this.#colorLocation = this.#program.getUniformLocation('u_color')
  }

  private chunkKey(chunk: Chunk): string {
    return `${chunk.position.x}:${chunk.position.y}`
  }

  updateChunk(chunk: Chunk, pixels: Map<string, Pixel>): void {
    const key = this.chunkKey(chunk)

    const positions = new Float32Array(chunk.pixelKeys.size * 2)

    let index = 0

    for (const pixelKey of chunk.pixelKeys) {
      const pixel = pixels.get(pixelKey)

      if (!pixel) continue

      positions[index++] = pixel.position.x
      positions[index++] = pixel.position.y
    }

    let buffer = this.#instanceBuffers.get(key)

    if (!buffer) {
      buffer = this.#gl.createBuffer()!

      this.#instanceBuffers.set(key, buffer)
    }

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)

    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, positions, this.#gl.DYNAMIC_DRAW)

    this.#instanceCounts.set(key, index / 2)
  }

  render(transform: Float32Array): void {
    this.#program.use()

    this.#gl.uniformMatrix3fv(this.#transformLocation, false, transform)

    const instancePosition = this.#program.getAttribLocation('a_instancePosition')

    this.#gl.bindVertexArray(this.#vao)

    for (const [key, buffer] of this.#instanceBuffers) {
      const instanceCount = this.#instanceCounts.get(key) ?? 0

      if (instanceCount === 0) continue

      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer)

      this.#gl.enableVertexAttribArray(instancePosition)

      this.#gl.vertexAttribPointer(instancePosition, 2, this.#gl.FLOAT, false, 0, 0)

      this.#gl.vertexAttribDivisor(instancePosition, 1)

      this.#gl.drawArraysInstanced(this.#gl.TRIANGLE_STRIP, 0, 4, instanceCount)
    }

    this.#gl.bindVertexArray(null)
  }

  dispose(): void {
    this.#program.dispose()

    this.#gl.deleteVertexArray(this.#vao)
    this.#gl.deleteBuffer(this.#buffer)

    for (const buffer of this.#instanceBuffers.values()) {
      this.#gl.deleteBuffer(buffer)
    }

    this.#instanceBuffers.clear()
    this.#instanceCounts.clear()
  }

  setColor(color: Color): void {
    this.#program.use()

    if (!this.#colorLocation) return
    this.#gl.uniform4f(this.#colorLocation, color.r, color.g, color.b, color.a)
  }
}
