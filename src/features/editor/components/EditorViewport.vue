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
      ref="editorCanvas"
      :width="size.width"
      :height="size.height"
      :transform
      :camera-position="cameraPosition"
      :zoom
      :pixel-grid="pixelGrid"
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
import { PencilTool } from "../tools/PencilTool";

const viewport = ref<HTMLDivElement | null>(null);
const editorCanvas = ref<InstanceType<typeof EditorCanvas> | null>(null);

let resizeObserver: ResizeObserver;

const camera = new Camera();

const size = ref({ width: 0, height: 0 });
const transform = ref<Float32Array>(new Float32Array(9));
const cameraPosition = ref<Vec2>(camera.position);
const zoom = ref(camera.zoom);

let isPanning = false;
let lastPointer: Vec2 = { x: 0, y: 0 };

const pixelGrid = new PixelGrid();
const pencilTool = new PencilTool(pixelGrid);

let isDrawing = false;

let stopCameraListener: (() => void) | null = null;
let stopPixelGridListener: (() => void) | null = null;

let renderFrame: number | null = null;
let pixelUpdateFrame: number | null = null;

function requestRender(): void {
  if (renderFrame !== null) return;

  renderFrame = requestAnimationFrame(() => {
    renderFrame = null;

    editorCanvas.value?.render();
  });
}

function requestPixelUpdate(): void {
  if (pixelUpdateFrame !== null) return;

  pixelUpdateFrame = requestAnimationFrame(() => {
    pixelUpdateFrame = null;

    editorCanvas.value?.updatePixels();
  });
}

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
    isDrawing = true;
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
  if (isDrawing) {
    drawPixelAt(event);
  }

  if (isPanning) {
    const screen = getScreenMousePosition(event);
    if (!screen) return;

    const delta = sub(screen, lastPointer);
    camera.moveByScreen(delta);

    lastPointer = screen;
  }
}

function handlePointerUp(event: PointerEvent) {
  if (!viewport.value) return;
  viewport.value.releasePointerCapture(event.pointerId);

  isDrawing = false;
  pencilTool.endStroke();
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

function drawPixelAt(event: PointerEvent) {
  const screen = getScreenMousePosition(event);
  if (!screen) return;

  const world = camera.screenToWorld(screen.x, screen.y);
  const pixel = floor(world);

  pencilTool.draw(new Pixel(pixel.x, pixel.y));
}

onMounted(() => {
  if (!viewport.value) return;

  camera.setZoom(18.15);

  stopCameraListener = camera.onChange(() => {
    requestRender();
    syncCamera();
  });

  stopPixelGridListener = pixelGrid.onChange(() => {
    requestPixelUpdate();
    requestRender();
  });

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
  if (renderFrame !== null) {
    cancelAnimationFrame(renderFrame);
  }

  if (pixelUpdateFrame !== null) {
    cancelAnimationFrame(pixelUpdateFrame);
  }

  stopCameraListener?.();
  stopPixelGridListener?.();

  resizeObserver.disconnect();
});
</script>
