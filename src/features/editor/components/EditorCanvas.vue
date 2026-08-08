<template>
  <canvas ref="canvas" class="block h-full w-full" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { WebGLRenderer } from "../renderer/WebGLRenderer";
import { PixelGrid } from "../model/PixelGrid";

const props = defineProps<{
  width: number;
  height: number;
  transform: Float32Array;
  pixelGrid: PixelGrid;
  renderRequest: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: WebGLRenderer | null = null;

onMounted(() => {
  if (!canvas.value) return;

  renderer = new WebGLRenderer(canvas.value);

  renderer.setColor({ r: 1.0, g: 0.2, b: 0.8, a: 1.0 });
  renderer.render(props.transform, props.pixelGrid);
});

onUnmounted(() => {
  if (!renderer) return;

  renderer.dispose();
});

watch(
  () => [props.width, props.height, props.transform, props.renderRequest],
  () => {
    if (!renderer) return;
    renderer.setColor({ r: Math.random(), g: Math.random(), b: Math.random(), a: Math.random() });
    renderer.resize(props.width, props.height);
    renderer.render(props.transform, props.pixelGrid);
  },
);
</script>
