<template>
  <div
    ref="viewport"
    class="relative h-full w-full overflow-hidden"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerUp"
    @wheel.prevent="handleWheel"
  >
    <EditorCanvas
      :width="size.width"
      :height="size.height"
      :transform
      :camera-position="cameraPosition"
      :zoom
      :pixel-grid="pixelGrid"
      :render-request="renderRequest"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import EditorCanvas from "./EditorCanvas.vue";
import { Camera } from "../camera/Camera";
import { PixelGrid } from "../model/PixelGrid";
import { Pixel } from "../model/Pixel";
import { add, floor, sub, type Vec2 } from "@/shared/math/Vec2";

const viewport = ref<HTMLDivElement | null>(null);

let resizeObserver: ResizeObserver;

const camera = new Camera();

const size = ref({ width: 0, height: 0 });
const transform = ref<Float32Array>(new Float32Array(9));
const cameraPosition = ref<Vec2>(camera.position);
const zoom = ref(camera.zoom);

let isPanning = false;
let lastPointer: Vec2 = { x: 0, y: 0 };

const renderRequest = ref(0);

const pixelGrid = new PixelGrid();

function syncCamera(): void {
  transform.value = camera.getTransform();
  cameraPosition.value = camera.position;
  zoom.value = camera.zoom;
}

function getScreenMousePosition(event: PointerEvent | WheelEvent): Vec2 | null {
  if (!viewport.value) return null;

  const rect = viewport.value.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function handlePointerDown(event: PointerEvent) {
  if (event.button === 0) {
    drawPixelAt(event);
    return;
  }

  if (event.button === 1) {
    if (!viewport.value) return;
    viewport.value.setPointerCapture(event.pointerId);

    const screen = getScreenMousePosition(event);
    if (!screen) return;

    isPanning = true;
    lastPointer = screen;
  }
}

function handlePointerMove(event: PointerEvent) {
  if (!isPanning) return;

  const screen = getScreenMousePosition(event);
  if (!screen) return;

  const delta = sub(screen, lastPointer);
  camera.moveByScreen(delta);

  lastPointer = screen;

  transform.value = camera.getTransform();
  cameraPosition.value = camera.position;
}

function handlePointerUp(event: PointerEvent) {
  if (!viewport.value) return;
  viewport.value.releasePointerCapture(event.pointerId);

  isPanning = false;
}

function handleWheel(event: WheelEvent) {
  const screen = getScreenMousePosition(event);
  if (!screen) return;

  const worldBefore = camera.screenToWorld(screen.x, screen.y);

  const factor = event.deltaY < 0 ? 1.1 : 0.9;
  camera.setZoom(camera.zoom * factor);

  const worldAfter = camera.screenToWorld(screen.x, screen.y);

  const correction = sub(worldBefore, worldAfter);
  const position = add(camera.position, correction);
  camera.setPosition(position);

  syncCamera();
}

function setPixel(pixel: Pixel) {
  pixelGrid.set(pixel);
  renderRequest.value++;
}

function drawPixelAt(event: PointerEvent) {
  const screen = getScreenMousePosition(event);
  if (!screen) return;

  const world = camera.screenToWorld(screen.x, screen.y);
  const pixel = floor(world);
  setPixel(new Pixel(pixel.x, pixel.y));
}

onMounted(() => {
  if (!viewport.value) return;

  camera.setZoom(18.15);

  resizeObserver = new ResizeObserver(([entry]: ResizeObserverEntry[]) => {
    if (!entry) return;

    const { width, height } = entry.contentRect;
    camera.setViewport(width, height);
    size.value = { width, height };

    syncCamera();
  });

  resizeObserver.observe(viewport.value);
});

onUnmounted(() => {
  resizeObserver.disconnect();
});
</script>
