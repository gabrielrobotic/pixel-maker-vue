import { add, floor, scale, sub, type Vec2 } from '@/shared/math/Vec2'
import { getScreenMousePosition } from '../utils/Mouse'
import { useCameraStore } from '../stores/Camera'
import { type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDrawStore, usePanStore } from '../stores/Mouse'
import { useEditorStore } from '../stores/Editor'
import { usePixelsStore } from '../stores/Pixels'

const cameraStore = useCameraStore()
const { position, zoom } = storeToRefs(cameraStore)

const panStore = usePanStore()
const { isPanning, lastPointerPan } = storeToRefs(panStore)

const editorStore = useEditorStore()
const { primaryColor } = editorStore

const pixelStore = usePixelsStore()

const drawStore = useDrawStore()
const { isDrawing, lastPointerDraw, lastMousePosition } = storeToRefs(drawStore)

export function useMouse(viewportRef: Ref<HTMLDivElement | null>) {
  let drawingFrame: number | null = null
  const drawingQueue: Vec2[] = []
  let lastRenderedDraw: Vec2 | null = null

  function onPointerDown(event: PointerEvent) {
    if (!viewportRef.value) return
    viewportRef.value.setPointerCapture(event.pointerId)

    startPan(event)
    startDraw(event)
  }
  function onPointerMove(event: PointerEvent) {
    const events = event.getCoalescedEvents()
    events.forEach((event) => drawing(event))

    panning(event)

    requestDrawing()
  }
  function onPointerUp(event: PointerEvent) {
    if (!viewportRef.value) return
    viewportRef.value.releasePointerCapture(event.pointerId)

    stopPan()
    stopDraw()
  }

  function onWheel(event: WheelEvent) {
    zooming(event)
  }

  function calcZoom(deltaY: number) {
    const factor = deltaY < 0 ? 1.1 : 0.9
    return zoom.value * factor
  }
  function calcPosition(worldBefore: Vec2, worldAfter: Vec2) {
    const delta = sub(worldBefore, worldAfter)
    return add(position.value, delta)
  }
  function zooming(event: WheelEvent) {
    if (!viewportRef.value) return

    const screen = getScreenMousePosition(event, viewportRef.value)
    if (!screen) return

    const worldBefore = cameraStore.screenToWorld(screen)
    zoom.value = calcZoom(event.deltaY)
    const worldAfter = cameraStore.screenToWorld(screen)
    position.value = calcPosition(worldBefore, worldAfter)
  }

  function startPan(event: PointerEvent) {
    if (event.button === 1) {
      const screen = getScreenMousePosition(event, viewportRef.value)
      if (!screen) return

      isPanning.value = true
      lastPointerPan.value = screen
    }
  }
  function panning(event: PointerEvent) {
    if (isPanning && viewportRef.value && lastPointerPan.value) {
      const screen = getScreenMousePosition(event, viewportRef.value)
      if (!screen) return

      const delta = sub(screen, lastPointerPan.value)
      cameraStore.moveByScreen(delta)

      lastPointerPan.value = screen
    }
  }
  function stopPan() {
    isPanning.value = false
    lastPointerPan.value = null
  }

  function startDraw(event: PointerEvent) {
    if (event.button !== 0) return

    const screen = getScreenMousePosition(event, viewportRef.value)
    if (!screen) return

    const position = floor(cameraStore.screenToWorld(screen))
    pixelStore.drawPixel(position, primaryColor)

    isDrawing.value = true
    lastPointerDraw.value = position
    lastRenderedDraw = position
  }
  function drawing(event: PointerEvent) {
    if (!isDrawing.value || !viewportRef.value) return

    const screen = getScreenMousePosition(event, viewportRef.value)
    if (!screen) return

    const position = floor(cameraStore.screenToWorld(screen))

    if (
      lastPointerDraw.value &&
      (position.x !== lastPointerDraw.value.x || position.y !== lastPointerDraw.value.y)
    ) {
      drawingQueue.push(position)
      lastPointerDraw.value = position
    }
  }
  function stopDraw() {
    isDrawing.value = false
    lastPointerDraw.value = null
    lastMousePosition.value = null

    drawingQueue.length = 0
    lastRenderedDraw = null

    if (drawingFrame !== null) {
      cancelAnimationFrame(drawingFrame)
      drawingFrame = null
    }
  }

  function requestDrawing() {
    if (drawingFrame !== null) return

    drawingFrame = requestAnimationFrame(processDrawing)
  }

  function processDrawing() {
    drawingFrame = null

    if (!isDrawing.value || drawingQueue.length === 0) return

    while (drawingQueue.length > 0) {
      const to = drawingQueue.shift()!

      if (lastRenderedDraw) {
        drawLine(lastRenderedDraw, to)
      }

      lastRenderedDraw = to
    }

    if (drawingQueue.length > 0) {
      requestDrawing()
    }
  }

  function drawLine(from: Vec2, to: Vec2) {
    let x0 = from.x
    let y0 = from.y
    const x1 = to.x
    const y1 = to.y

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)

    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1

    let error = dx - dy

    while (true) {
      pixelStore.drawPixel({ x: x0, y: y0 }, primaryColor)
      // console.log(x0, y0)
      if (x0 === x1 && y0 === y1) break

      const error2 = 2 * error

      if (error2 > -dy) {
        error -= dy
        x0 += sx
      }

      if (error2 < dx) {
        error += dx
        y0 += sy
      }
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  }
}
