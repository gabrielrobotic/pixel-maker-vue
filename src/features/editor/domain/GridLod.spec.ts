import { describe, expect, it } from 'vitest'

import { calculateGridLod } from './GridLod'

describe('calculateGridLod', () => {
  it('mantém o mesmo LOD para o mesmo zoom e viewport', () => {
    const first = calculateGridLod(1, 800)
    const second = calculateGridLod(1, 800)

    expect(first).toEqual(second)
  })

  it('retorna tamanhos em potências de 2', () => {
    const lod = calculateGridLod(1, 800)

    expect(Math.log2(lod.size) % 1).toBe(0)
  })

  it('mantém o tamanho positivo', () => {
    const lod = calculateGridLod(1, 800)

    expect(lod.size).toBeGreaterThan(0)
  })

  it('mantém transition entre 0 e 1', () => {
    const lod = calculateGridLod(1, 800)

    expect(lod.transition).toBeGreaterThanOrEqual(0)
    expect(lod.transition).toBeLessThanOrEqual(1)
  })

  it('mantém o nível atual antes da transição', () => {
    const lod = calculateGridLod(50, 1200)

    expect(lod.size).toBe(2)
    expect(lod.transition).toBe(0)
  })

  it('inicia a transição no último quarto do nível', () => {
    const viewportSize = 1200
    const targetCells = 12

    const level = 1
    const levelFraction = 0.8125

    const desiredSpacing = 2 ** (level + levelFraction)

    const zoom = viewportSize / (targetCells * desiredSpacing)

    const lod = calculateGridLod(zoom, viewportSize, targetCells)

    expect(lod.size).toBe(2)
    expect(lod.transition).toBeCloseTo(0.25, 5)
  })

  it('chega ao próximo nível no limite', () => {
    const lod = calculateGridLod(25, 1200)

    expect(lod.size).toBe(4)
    expect(lod.transition).toBe(0)
  })

  it('chega ao fim da transição antes do próximo nível', () => {
    const viewportSize = 1200
    const targetCells = 12

    const level = 1
    const levelFraction = 0.999999

    const desiredSpacing = 2 ** (level + levelFraction)

    const zoom = viewportSize / (targetCells * desiredSpacing)

    const lod = calculateGridLod(zoom, viewportSize, targetCells)

    expect(lod.size).toBe(2)
    expect(lod.transition).toBeCloseTo(1, 5)
  })

  it('avança para o próximo LOD após ultrapassar o nível', () => {
    const viewportSize = 1200
    const targetCells = 12

    const level = 1
    const levelFraction = 1.01

    const desiredSpacing = 2 ** (level + levelFraction)

    const zoom = viewportSize / (targetCells * desiredSpacing)

    const lod = calculateGridLod(zoom, viewportSize, targetCells)

    expect(lod.size).toBe(4)
    expect(lod.transition).toBe(0)
  })

  it('mantém valores válidos em zoom muito baixo', () => {
    const lod = calculateGridLod(0.0001, 1200)

    expect(lod.size).toBeGreaterThan(0)
    expect(Number.isFinite(lod.size)).toBe(true)
    expect(lod.transition).toBeGreaterThanOrEqual(0)
    expect(lod.transition).toBeLessThanOrEqual(1)
  })

  it('mantém valores válidos em zoom muito alto', () => {
    const lod = calculateGridLod(100000, 1200)

    expect(lod.size).toBeGreaterThan(0)
    expect(Number.isFinite(lod.size)).toBe(true)
    expect(lod.transition).toBeGreaterThanOrEqual(0)
    expect(lod.transition).toBeLessThanOrEqual(1)
  })
})
