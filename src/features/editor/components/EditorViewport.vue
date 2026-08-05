<template>
  <div
    ref="viewport"
    class="relative h-full w-full overflow-hidden"
    @pointerdown="handlePointerDown"
  >
    <EditorCanvas :width="size.width" :height="size.height" :transform />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import EditorCanvas from "./EditorCanvas.vue";
import { Camera } from "../camera/Camera";

const viewport = ref<HTMLDivElement | null>(null);

let resizeObserver: ResizeObserver;

const camera = new Camera();

const size = ref({ width: 0, height: 0 });
const transform = ref<Float32Array>(new Float32Array(9));

function handlePointerDown(event: PointerEvent) {
  if (!viewport.value) return;

  const rect = viewport.value.getBoundingClientRect();

  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  const world = camera.screenToWorld(screenX, screenY);

  console.log(world);
}

onMounted(() => {
  if (!viewport.value) return;

  camera.setPosition(0.5, 0.5);
  camera.setZoom(420);

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
