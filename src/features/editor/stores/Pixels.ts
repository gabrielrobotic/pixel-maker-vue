import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Vec2 } from '@/shared/math/Vec2'
import type { Pixel } from '../domain/Pixel'
import type { Color } from '../domain/Color'
import { worldToChunkPosition, type Chunk, type ChunkPosition } from '../domain/Chunk'

export const usePixelsStore = defineStore('pixels', () => {
  const _pixels = ref<Map<string, Pixel>>(new Map<string, Pixel>())

  const pixels = computed(() => _pixels.value)
  const chunks = ref<Map<string, Chunk>>(new Map())
  const dirtyChunks = ref<Set<string>>(new Set())

  const pixelKey = (position: Vec2) => `${position.x}:${position.y}`
  const chunkKey = (position: ChunkPosition) => `${position.x}:${position.y}`

  const getPixel = (position: Vec2) => pixels.value.get(pixelKey(position))
  const setPixel = (pixel: Pixel) => {
    const key = pixelKey(pixel.position)

    pixels.value.set(key, pixel)

    const { chunk } = worldToChunkPosition(pixel.position)
    const keyChunk = chunkKey(chunk)

    dirtyChunks.value.add(keyChunk)

    let currentChunk = chunks.value.get(keyChunk)

    if (!currentChunk) {
      currentChunk = {
        position: chunk,
        pixelKeys: new Set(),
      }

      chunks.value.set(keyChunk, currentChunk)
    }

    currentChunk.pixelKeys.add(key)
  }
  const hasPixel = (position: Vec2) => pixels.value.has(pixelKey(position))
  const deletePixel = (position: Vec2) => pixels.value.delete(pixelKey(position))

  const drawPixel = (position: Vec2, color: Color) => setPixel({ position, color })

  const commitDraw = () => {
    const committedChunks = new Set(dirtyChunks.value)

    dirtyChunks.value.clear()

    return committedChunks
  }

  return {
    pixels,
    chunks,
    dirtyChunks,
    getPixel,
    setPixel,
    hasPixel,
    deletePixel,
    drawPixel,
    commitDraw,
  }
})
