<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { WebGPURenderer } from '../rendering/renderer/WebGPURenderer';

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  if (!canvas.value) return

  const renderer = new WebGPURenderer(canvas.value)

  await renderer.initialize()
  renderer.render()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full" />
</template>

<style lang="scss" scoped></style>
