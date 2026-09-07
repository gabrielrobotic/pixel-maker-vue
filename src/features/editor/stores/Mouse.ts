import type { Vec2 } from '@/shared/math/Vec2'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useMouseStore = defineStore('mouse', () => {
  const _isPanning = ref(false)
  const _lastPointer = ref<Vec2 | null>(null)
  const _isDrawing = ref(false)

  const isPanning = computed({
    get: () => _isPanning.value,
    set: (val) => (_isPanning.value = val),
  })
  const lastPointer = computed({
    get: () => _lastPointer.value,
    set: (val) => (_lastPointer.value = val),
  })
  const isDrawing = computed({
    get: () => _isDrawing.value,
    set: (val) => (_isDrawing.value = val),
  })

  return {
    isPanning,
    lastPointer,
    isDrawing,
  }
})
