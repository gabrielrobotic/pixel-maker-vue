import { add, floor, sub, type Vec2 } from '@/shared/math/Vec2'
import { getScreenMousePosition } from '../utils/Mouse'
import { useCameraStore } from '../stores/Camera'
import { type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMouseStore } from '../stores/Mouse'
import { useEditorStore } from '../stores/Editor'
import { usePixelsStore } from '../stores/Pixels'

const cameraStore = useCameraStore()
const { position, zoom } = storeToRefs(cameraStore)

const mouseStore = useMouseStore()
const { isPanning, lastPointer, isDrawing } = storeToRefs(mouseStore)

const editorStore = useEditorStore()
const { primaryColor } = editorStore

const pixelStore = usePixelsStore()

export function useMouse(viewportRef: Ref<HTMLDivElement | null>) {
  function onPointerDown(event: PointerEvent) {
    if (!viewportRef.value) return
    viewportRef.value.setPointerCapture(event.pointerId)

    startPan(event)
    startDraw(event)
  }

  function onPointerMove(event: PointerEvent) {
    drawing()
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
      lastPointer.value = screen
    }
  }
  function panning(event: PointerEvent) {
    if (isPanning && viewportRef.value && lastPointer.value) {
      const screen = getScreenMousePosition(event, viewportRef.value)
      if (!screen) return

      const delta = sub(screen, lastPointer.value)
      cameraStore.moveByScreen(delta)

      lastPointer.value = screen
    }
  }
  function stopPan() {
    isPanning.value = false
    lastPointer.value = null
  }

  function startDraw(event: PointerEvent) {
    if (event.button !== 0) return

    const screen = getScreenMousePosition(event, viewportRef.value)
    if (!screen) return

    const position = floor(cameraStore.screenToWorld(screen))
    pixelStore.drawPixel(position, primaryColor)

    isDrawing.value = true
  }
  function drawing() {
    if (isDrawing.value) {
      console.log('drawing...')
    }
  }
  function stopDraw() {
    isDrawing.value = false
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
  }
}
