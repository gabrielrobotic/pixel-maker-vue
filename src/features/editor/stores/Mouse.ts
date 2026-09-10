import type { Vec2 } from '@/shared/math/Vec2'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const usePanStore = defineStore('pan', () => {
  const _isPanning = ref(false)
  const _lastPointer = ref<Vec2 | null>(null)

  const isPanning = computed({
    get: () => _isPanning.value,
    set: (val) => (_isPanning.value = val),
  })
  const lastPointerPan = computed({
    get: () => _lastPointer.value,
    set: (val) => (_lastPointer.value = val),
  })

  return {
    isPanning,
    lastPointerPan,
  }
})

export const useDrawStore = defineStore('draw', () => {
  const _isDrawing = ref(false)
  const _lastPointer = ref<Vec2 | null>(null)
  const lastMousePosition = ref<Vec2 | null>(null)

  const isDrawing = computed({
    get: () => _isDrawing.value,
    set: (val) => (_isDrawing.value = val),
  })
  const lastPointerDraw = computed({
    get: () => _lastPointer.value,
    set: (val) => (_lastPointer.value = val),
  })

  return {
    isDrawing,
    lastPointerDraw,
    lastMousePosition,
  }
})
