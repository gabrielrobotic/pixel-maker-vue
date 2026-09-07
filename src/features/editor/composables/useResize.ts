import { onMounted, onUnmounted, type Ref } from 'vue'
import { useCameraStore } from '../stores/Camera'
import { storeToRefs } from 'pinia'

const { viewport } = storeToRefs(useCameraStore())

export function useResize(viewportRef: Ref<HTMLDivElement | null>) {
  let resizeObserver: ResizeObserver | null = null

  function getResizeObserver() {
    return new ResizeObserver(([entry]: ResizeObserverEntry[]) => {
      if (!entry) return

      const { width, height } = entry.contentRect
      viewport.value = { width, height }
    })
  }

  onMounted(() => {
    if (!viewportRef.value) return

    resizeObserver = getResizeObserver()
    resizeObserver.observe(viewportRef.value)
  })

  onUnmounted(() => {
    if (!resizeObserver) return

    resizeObserver.disconnect()
  })
}
