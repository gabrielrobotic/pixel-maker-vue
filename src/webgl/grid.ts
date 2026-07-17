export default function createGridVertices(halfSize: number, spacing: number): Float32Array {
  const vertices: number[] = [];

  // Verticais
  for (let x = -halfSize; x <= halfSize; x += spacing) {
    vertices.push(x, -halfSize, x, halfSize);
  }

  // Horizontais
  for (let y = -halfSize; y <= halfSize; y += spacing) {
    vertices.push(-halfSize, y, halfSize, y);
  }

  return new Float32Array(vertices);
}
