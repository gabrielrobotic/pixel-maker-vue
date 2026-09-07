<template>
  <div
    ref="viewportRef"
    class="w-full h-full"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMouse } from '../composables/useMouse'
import { useRender } from '../composables/useRender'
import { useResize } from '../composables/useResize'

const viewportRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

useResize(viewportRef)
useRender(canvasRef)
const { onPointerDown, onPointerMove, onPointerUp, onWheel } = useMouse(viewportRef)
</script>
