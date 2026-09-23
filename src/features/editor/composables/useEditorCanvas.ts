import { onMounted, onUnmounted, shallowRef } from 'vue'
import { createWebGL2Context } from '../webgl/context'
import { GridRenderer } from '../webgl/GridRenderer'
import { Camera } from '../domain/Camera'
import { useEditorStore } from '../stores/editor.store'
import { calculateGridLod } from '../domain/GridLod'
import { clearCanvas } from '../webgl/clearCanvas'
import { useRenderScheduler } from './useRenderScheduler'
import { useEditorResize } from './useEditorResize'
import { PixelRenderer } from '../webgl/PixelRenderer'

export function useEditorCanvas() {
  const canvas = shallowRef<HTMLCanvasElement | null>(null)
  let gl: WebGL2RenderingContext | null

  const camera = new Camera()

  let gridRenderer: GridRenderer | null = null
  let pixelRenderer: PixelRenderer | null = null

  const editorStore = useEditorStore()
  const { gridSectionScale } = editorStore

  const render = () => {
    if (!gl || !gridRenderer || !pixelRenderer) return

    const width = gl.drawingBufferWidth
    const height = gl.drawingBufferHeight

    if (width === 0 || height === 0) return

    clearCanvas(gl)

    const worldToNdc = camera.worldToNdcMatrix(width, height)
    const ndcToWorld = camera.ndcToWorldMatrix(worldToNdc)

    const lod = calculateGridLod(camera.zoom, Math.max(width, height))

    gridRenderer.render(ndcToWorld, lod.size, lod.transition, gridSectionScale)
    const positions = new Float32Array([0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1])
    pixelRenderer.render(worldToNdc, positions, [1, 0, 0, 1])
  }

  const { requestRender } = useRenderScheduler(render)

  onMounted(() => {
    if (!canvas.value) return

    const el = canvas.value
    gl = createWebGL2Context(el)

    gridRenderer = new GridRenderer(gl)
    pixelRenderer = new PixelRenderer(gl)
  })

  onUnmounted(() => {
    gridRenderer?.dispose()
    gridRenderer = null

    pixelRenderer?.dispose()
    pixelRenderer = null

    gl = null
  })

  useEditorResize(canvas, () => gl, requestRender)

  return {
    canvas,
    camera,
    requestRender,
  }
}
