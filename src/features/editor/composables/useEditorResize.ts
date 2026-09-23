import { onMounted, onUnmounted, type ShallowRef } from 'vue'
import { resizeCanvas } from '../webgl/resizeCanvas'

export function useEditorResize(
  canvas: ShallowRef<HTMLCanvasElement | null>,
  getContext: () => WebGL2RenderingContext | null,
  requestRender: () => void,
) {
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!canvas.value) return

    const el = canvas.value

    const resize = () => {
      const gl = getContext()
      if (!gl) return

      resizeCanvas(el, gl)
      requestRender()
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(el)

    resize()
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
}
