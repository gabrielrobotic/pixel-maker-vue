<template>
  <canvas ref="canvas" class="block h-full w-full" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { WebGLRenderer } from "../renderer/WebGLRenderer";

const props = defineProps<{
  width: number;
  height: number;
  transform: Float32Array;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let renderer: WebGLRenderer | null = null;

onMounted(() => {
  if (!canvas.value) return;

  renderer = new WebGLRenderer(canvas.value);

  renderer.setColor({ r: 1.0, g: 0.2, b: 0.8, a: 1.0 });
  renderer.render(props.transform);
});

onUnmounted(() => {
  if (!renderer) return;

  renderer.dispose();
});

watch(
  () => [props.width, props.height],
  () => {
    if (!renderer) return;
    renderer.resize(props.width, props.height);
    renderer.render(props.transform);
  },
);
</script>
