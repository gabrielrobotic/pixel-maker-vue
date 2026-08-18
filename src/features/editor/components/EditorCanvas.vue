<template>
  <canvas ref="canvas" class="block h-full w-full" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { WebGLRenderer } from "../renderer/WebGLRenderer";
import { PixelGrid } from "../model/PixelGrid";

const props = defineProps<{
  width: number;
  height: number;
  transform: Float32Array;
  cameraPosition: { x: number; y: number };
  zoom: number;
  pixelGrid: PixelGrid;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: WebGLRenderer | null = null;

const render = () => {
  if (!renderer) return;
  renderer.setColor({ r: 0.5, g: 0.4, b: 0.8, a: 1.0 });
  renderer.resize(props.width, props.height);
  renderer.render(props.transform, props.cameraPosition, props.zoom);
};

const updatePixels = () => {
  if (!renderer) return;
  renderer.updatePixels(props.pixelGrid);
};

defineExpose({
  render,
  updatePixels,
});

onMounted(() => {
  if (!canvas.value) return;
  renderer = new WebGLRenderer(canvas.value);
});

onUnmounted(() => {
  if (!renderer) return;
  renderer.dispose();
});
</script>
