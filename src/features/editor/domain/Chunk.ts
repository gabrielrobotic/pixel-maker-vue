import type { Vec2 } from '@/shared/math/Vec2'

export const CHUNK_SIZE = 64

export interface ChunkPosition {
  x: number
  y: number
}

interface LocalPosition {
  x: number
  y: number
}

export interface ChunkPixelPosition {
  chunk: ChunkPosition
  local: LocalPosition
}

export interface Chunk {
  position: ChunkPosition
  pixelKeys: Set<string>
}

export function worldToChunkPosition(position: Vec2): ChunkPixelPosition {
  return {
    chunk: {
      x: Math.floor(position.x / CHUNK_SIZE),
      y: Math.floor(position.y / CHUNK_SIZE),
    },
    local: {
      x: ((position.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
      y: ((position.y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
    },
  }
}
