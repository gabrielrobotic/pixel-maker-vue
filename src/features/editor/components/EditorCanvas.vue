<template>
  <canvas ref="canvas" class="block h-full w-full" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { WebGLRenderer } from "../renderer/WebGLRenderer";

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: WebGLRenderer | null = null;

let resizeObserver: ResizeObserver;

onMounted(() => {
  if (!canvas.value) return;

  renderer = new WebGLRenderer(canvas.value);

  resizeObserver = new ResizeObserver(() => {
    renderer?.resize();
  });
  resizeObserver.observe(canvas.value);

  renderer.setColor({ r: 1.0, g: 0.2, b: 0.8, a: 1.0 });
  renderer.render();
});

onUnmounted(() => {
  if (!renderer) return;

  resizeObserver.disconnect();
  renderer.dispose();
});
</script>
