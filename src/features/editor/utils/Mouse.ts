import type { Vec2 } from '@/shared/math/Vec2'

export function getScreenMousePosition(
  event: PointerEvent | WheelEvent,
  viewportRef: HTMLDivElement | null,
): Vec2 | null {
  if (!viewportRef) return null

  const rect = viewportRef.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}
