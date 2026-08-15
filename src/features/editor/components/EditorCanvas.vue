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
  cameraPosition: { x: number; y: number };
  zoom: number;
  pixelGrid: PixelGrid;
  renderRequest: number;
  pixelUpdateRequest: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: WebGLRenderer | null = null;

onMounted(() => {
  if (!canvas.value) return;
  renderer = new WebGLRenderer(canvas.value);
});

onUnmounted(() => {
  if (!renderer) return;
  renderer.dispose();
});

watch(
  () => [props.width, props.height, props.transform, props.renderRequest],
  () => {
    if (!renderer) return;
    renderer.setColor({ r: 0.5, g: 0.4, b: 0.8, a: 1.0 });
    renderer.resize(props.width, props.height);
    renderer.render(props.transform, props.cameraPosition, props.zoom);
  },
);

watch(
  () => props.pixelUpdateRequest,
  () => {
    if (!renderer) return;
    renderer.updatePixels(props.pixelGrid);
  },
);
</script>
