import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Vec2 } from '@/shared/math/Vec2'
import type { Pixel } from '../domain/Pixel'
import type { Color } from '../domain/Color'

export const usePixelsStore = defineStore('pixels', () => {
  const _pixels = ref<Map<string, Pixel>>(new Map<string, Pixel>())

  const pixels = computed(() => _pixels.value)

  const pixelKey = (position: Vec2) => `${position.x}:${position.y}`

  const getPixel = (position: Vec2) => pixels.value.get(pixelKey(position))
  const setPixel = (pixel: Pixel) => pixels.value.set(pixelKey(pixel.position), pixel)
  const hasPixel = (position: Vec2) => pixels.value.has(pixelKey(position))
  const deletePixel = (position: Vec2) => pixels.value.delete(pixelKey(position))

  const drawPixel = (position: Vec2, color: Color) => setPixel({ position, color })

  return {
    pixels,
    pixelKey,
    getPixel,
    setPixel,
    hasPixel,
    deletePixel,
    drawPixel,
  }
})
