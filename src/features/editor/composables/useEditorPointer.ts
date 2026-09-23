import type { Camera } from '../domain/Camera'
import type { Vec2 } from '../domain/Vec2'

export function useEditorPointer(camera: Camera, requestRender: () => void) {
  let isPanning = false
  const lastPointer: Vec2 = { x: 0, y: 0 }

  const onPointerDown = (event: PointerEvent) => {
    if (event.button === 1) {
      isPanning = true
      lastPointer.x = event.clientX
      lastPointer.y = event.clientY

      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isPanning) return

    camera.pan({
      x: event.clientX - lastPointer.x,
      y: event.clientY - lastPointer.y,
    })

    lastPointer.x = event.clientX
    lastPointer.y = event.clientY

    requestRender()
  }

  const onPointerUp = (event: PointerEvent) => {
    isPanning = false

    ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}
