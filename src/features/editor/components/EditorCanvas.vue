<script setup lang="ts">
import { useEditorCanvas } from '../composables/useEditorCanvas'
import { useEditorPointer } from '../composables/useEditorPointer'
import { useEditorWheel } from '../composables/useEditorWheel'

const { canvas, camera, requestRender } = useEditorCanvas()
const { onPointerDown, onPointerMove, onPointerUp } = useEditorPointer(camera, requestRender)
const { onWheel } = useEditorWheel(camera, requestRender)
</script>

<template>
  <canvas
    ref="canvas"
    class="w-full h-full"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  />
</template>

<style lang="scss" scoped></style>
