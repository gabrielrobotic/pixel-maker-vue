<template>
  <div
    ref="viewport"
    class="relative h-full w-full overflow-hidden"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerUp"
    @wheel="handleWheel"
  >
    <EditorCanvas
      :width="size.width"
      :height="size.height"
      :transform
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

const viewport = ref<HTMLDivElement | null>(null);

let resizeObserver: ResizeObserver;

const camera = new Camera();

const size = ref({ width: 0, height: 0 });
const transform = ref<Float32Array>(new Float32Array(9));

let isPanning = false;
let lastPointerX = 0;
let lastPointerY = 0;

const renderRequest = ref(0);

const pixelGrid = new PixelGrid();
pixelGrid.set(new Pixel(0, 0));
pixelGrid.set(new Pixel(1, 0));
pixelGrid.set(new Pixel(2, 1));

function getScreenMousePosition(event: PointerEvent | WheelEvent): { x: number; y: number } | null {
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

    const world = camera.screenToWorld(screen.x, screen.y);
    console.log(world);

    isPanning = true;
    lastPointerX = screen.x;
    lastPointerY = screen.y;
  }
}

function handlePointerMove(event: PointerEvent) {
  if (!isPanning) return;

  const screen = getScreenMousePosition(event);
  if (!screen) return;

  const dx = screen.x - lastPointerX;
  const dy = screen.y - lastPointerY;

  camera.moveByScreen(dx, dy);

  lastPointerX = screen.x;
  lastPointerY = screen.y;

  transform.value = camera.getTransform();
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

  camera.setPosition(
    camera.x + worldBefore.x - worldAfter.x,
    camera.y + worldBefore.y - worldAfter.y,
  );

  transform.value = camera.getTransform();
}

function setPixel(pixel: Pixel) {
  pixelGrid.set(pixel);
  renderRequest.value++;
}

function drawPixelAt(event: PointerEvent) {
  const screen = getScreenMousePosition(event);
  if (!screen) return;

  const world = camera.screenToWorld(screen.x, screen.y);

  const x = Math.floor(world.x);
  const y = Math.floor(world.y);

  setPixel(new Pixel(x, y));
}

onMounted(() => {
  if (!viewport.value) return;

  camera.setPosition(0.5, 0.5);
  camera.setZoom(50);

  resizeObserver = new ResizeObserver(([entry]: ResizeObserverEntry[]) => {
    if (!entry) return;

    const { width, height } = entry.contentRect;
    camera.setViewport(width, height);
    size.value = { width, height };

    transform.value = camera.getTransform();
  });

  resizeObserver.observe(viewport.value);
});

onUnmounted(() => {
  resizeObserver.disconnect();
});
</script>
