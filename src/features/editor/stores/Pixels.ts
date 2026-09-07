import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Vec2 } from '@/shared/math/Vec2'
import type { Pixel } from '../domain/Pixel'

export const usePixelsStore = defineStore('pixels', () => {
  const _pixels = ref<Map<string, Pixel>>(new Map<string, Pixel>())

  const pixels = computed(() => _pixels.value)

  const pixelKey = (position: Vec2) => `${position.x}:${position.y}`

  return {
    pixels,
    pixelKey,
  }
})
