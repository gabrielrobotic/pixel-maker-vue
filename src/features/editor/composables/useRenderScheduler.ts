import { onUnmounted } from 'vue'

export function useRenderScheduler(render: () => void) {
  let frameId: number | null = null

  const requestRender = () => {
    if (frameId !== null) return

    frameId = requestAnimationFrame(() => {
      frameId = null
      render()
    })
  }

  onUnmounted(() => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId)
      frameId = null
    }
  })

  return {
    requestRender,
  }
}
