import type { Camera } from '../domain/Camera'
import type { Vec2 } from '../domain/Vec2'

export function useEditorWheel(camera: Camera, requestRender: () => void) {
  const onWheel = (event: WheelEvent) => {
    const element = event.currentTarget as HTMLCanvasElement
    const rect = element.getBoundingClientRect()

    const screen: Vec2 = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1

    camera.zoomAt(screen, factor, rect.width, rect.height)

    requestRender()
  }

  return {
    onWheel,
  }
}
