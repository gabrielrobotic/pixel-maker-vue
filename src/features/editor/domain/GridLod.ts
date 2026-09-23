export interface GridLod {
  size: number
  transition: number
}

export function calculateGridLod(zoom: number, viewportSize: number, targetCells = 12): GridLod {
  const desiredSpacing = viewportSize / (targetCells * zoom)

  const rawLevel = Math.log2(desiredSpacing)

  const level = Math.max(0, Math.floor(rawLevel))

  const size = Math.pow(2, level)

  const levelFraction = rawLevel - level

  const transitionStart = 0.75

  const transition = Math.max(0, (levelFraction - transitionStart) / (1 - transitionStart))

  return {
    size,
    transition,
  }
}
