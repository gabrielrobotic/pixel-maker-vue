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

  function onPointerDown(event: PointerEvent) {
    if (!viewportRef.value) return
    viewportRef.value.setPointerCapture(event.pointerId)

    startPan(event)
    startDraw(event)
  }
  function onPointerMove(event: PointerEvent) {
    drawing(event)
    panning(event)
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

    requestDrawing()
  }
  function drawing(event: PointerEvent) {
    if (!isDrawing.value || !viewportRef.value) return

    const screen = getScreenMousePosition(event, viewportRef.value)
    if (!screen) return

    const position = floor(cameraStore.screenToWorld(screen))

    lastMousePosition.value = position

    requestDrawing()
  }
  function stopDraw() {
    isDrawing.value = false
    lastPointerDraw.value = null
    lastMousePosition.value = null
  }

  function drawLine(from: Vec2, to: Vec2) {
    const delta = sub(to, from)
    const steps = Math.max(Math.abs(delta.x), Math.abs(delta.y))

    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const position = floor(add(from, scale(delta, t)))

      pixelStore.drawPixel(position, primaryColor)
    }
  }
  function requestDrawing() {
    if (drawingFrame !== null) return

    drawingFrame = requestAnimationFrame(() => {
      drawingFrame = null

      if (!isDrawing.value || !lastMousePosition.value) return

      if (
        !lastPointerDraw.value ||
        lastMousePosition.value.x !== lastPointerDraw.value.x ||
        lastMousePosition.value.y !== lastPointerDraw.value.y
      ) {
        drawLine(lastPointerDraw.value ?? lastMousePosition.value, lastMousePosition.value)

        lastPointerDraw.value = lastMousePosition.value
      }

      requestDrawing()
    })
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  }
}
