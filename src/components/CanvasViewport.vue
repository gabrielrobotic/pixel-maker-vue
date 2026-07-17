<script setup lang="ts">
import { onMounted, ref } from "vue";

import initWebGL2 from "@/webgl/init";
import { renderRect } from "@/webgl/drawExamples/rect";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const gl = ref<WebGL2RenderingContext | null>(null);

onMounted(() => {
  if (!canvasRef.value) return;

  gl.value = initWebGL2(canvasRef.value);
  if (!gl.value) return;

  renderRect(gl.value);
});
</script>

<template>
  <div class="h-full w-full bg-neutral-900">
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
