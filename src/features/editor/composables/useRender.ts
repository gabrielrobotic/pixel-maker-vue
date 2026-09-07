import { onMounted, onUnmounted, watch, type Ref } from 'vue'
import { WebGL2Renderer } from '../renderer/WebGL2Renderer'
import { storeToRefs } from 'pinia'
import { useCameraStore } from '../stores/Camera'
import { usePixelsStore } from '../stores/Pixels'

const { transform } = storeToRefs(useCameraStore())

const { pixels } = storeToRefs(usePixelsStore())

export function useRender(canvasRef: Ref<HTMLCanvasElement | null>) {
  let renderer: WebGL2Renderer | null = null

  function render() {
    if (!renderer) return

    renderer.setColor({
      r: 0.5,
      g: 0.4,
      b: 0.8,
      a: 1.0,
    })
    renderer.resize()
    renderer.render()
  }

  onMounted(() => {
    if (!canvasRef.value) return
    renderer = new WebGL2Renderer(canvasRef.value)
  })

  onUnmounted(() => {
    if (!renderer) return
    renderer.dispose()
  })

  watch([transform, pixels], () => {
    render()
  })
}
