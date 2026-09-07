import { storeToRefs } from 'pinia'
import type { Color } from '../domain/Color'
import type { Pixel } from '../domain/Pixel'
import { GridRenderer } from './grid/GridRenderer'
import { PixelsRenderer } from './pixels/PixelsRenderer'
import { useCameraStore } from '../stores/Camera'

const cameraStore = useCameraStore()
const { position, zoom, transform, viewport } = storeToRefs(cameraStore)

export class WebGL2Renderer {
  readonly #canvas: HTMLCanvasElement
  readonly #gl: WebGL2RenderingContext

  readonly #pixelsRenderer: PixelsRenderer
  readonly #gridRenderer: GridRenderer

  constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas

    const gl = canvas.getContext('webgl2')
    if (!gl) throw new Error('WebGL 2.0 não está disponível.')

    this.#gl = gl

    this.#gl.enable(this.#gl.BLEND)
    this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA)

    this.#pixelsRenderer = new PixelsRenderer(this.#gl)
    this.#gridRenderer = new GridRenderer(this.#gl)
  }

  resize(): void {
    const dpr = window.devicePixelRatio
    const pixelWidth = Math.floor(viewport.value.width * dpr)
    const pixelHeight = Math.floor(viewport.value.height * dpr)

    if (this.#canvas.width !== pixelWidth || this.#canvas.height !== pixelHeight) {
      this.#canvas.width = pixelWidth
      this.#canvas.height = pixelHeight
    }

    this.#gl.viewport(0, 0, pixelWidth, pixelHeight)
  }

  updatePixels(pixels: Map<string, Pixel>): void {
    this.#pixelsRenderer.updatePixels(pixels)
  }

  render(): void {
    this.#gl.clearColor(0.1, 0.1, 0.1, 1.0)
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT)

    this.#pixelsRenderer.render(transform.value)
    this.#gridRenderer.render(position.value, zoom.value, {
      width: this.#canvas.width,
      height: this.#canvas.height,
    })
  }

  dispose(): void {
    this.#pixelsRenderer.dispose()
    this.#gridRenderer.dispose()
  }

  setColor(color: Color): void {
    this.#pixelsRenderer.setColor(color)
    this.#gridRenderer.setColor({
      r: 0.65,
      g: 0.25,
      b: 0.25,
      a: 1.0,
    })
  }
}
