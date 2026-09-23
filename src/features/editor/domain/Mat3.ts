export type Mat3 = Float32Array

export function createMat3(): Mat3 {
  return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
}

export function invertMat3(matrix: Mat3): Mat3 {
  const a = matrix[0]!
  const b = matrix[1]!
  const c = matrix[2]!
  const d = matrix[3]!
  const e = matrix[4]!
  const f = matrix[5]!
  const g = matrix[6]!
  const h = matrix[7]!
  const i = matrix[8]!

  const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)

  if (determinant === 0) {
    throw new Error('Matrix is not invertible.')
  }

  const inverseDeterminant = 1 / determinant

  return new Float32Array([
    (e * i - f * h) * inverseDeterminant,
    (c * h - b * i) * inverseDeterminant,
    (b * f - c * e) * inverseDeterminant,

    (f * g - d * i) * inverseDeterminant,
    (a * i - c * g) * inverseDeterminant,
    (c * d - a * f) * inverseDeterminant,

    (d * h - e * g) * inverseDeterminant,
    (b * g - a * h) * inverseDeterminant,
    (a * e - b * d) * inverseDeterminant,
  ])
}
