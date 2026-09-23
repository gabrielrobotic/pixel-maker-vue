import { describe, expect, it } from 'vitest'
import { Camera } from './Camera'

describe('Camera', () => {
  it('converte screen → world → screen', () => {
    const camera = new Camera()

    camera.position = {
      x: 100,
      y: 50,
    }

    camera.zoom = 2

    const screen = {
      x: 300,
      y: 200,
    }

    const world = camera.screenToWorld(screen, 800, 600)

    const result = camera.worldToScreen(world, 800, 600)

    expect(result.x).toBeCloseTo(screen.x)
    expect(result.y).toBeCloseTo(screen.y)
  })

  it('gera uma matriz NDC → World consistente', () => {
    const camera = new Camera()

    camera.position = {
      x: 100,
      y: 50,
    }

    camera.zoom = 2

    const matrix = camera.ndcToWorldMatrix(camera.worldToNdcMatrix(800, 600))

    expect(matrix).toHaveLength(9)

    for (const value of matrix) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })
})
