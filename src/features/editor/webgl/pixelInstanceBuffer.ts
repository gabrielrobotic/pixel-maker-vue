export function createPixelInstanceBuffer(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  positions: Float32Array,
) {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('Failed to create pixel instance buffer.')

  const a_pixelPosition = gl.getAttribLocation(program, 'a_pixelPosition')
  if (!a_pixelPosition) throw new Error('Attibute a_pixelPosition not found.')

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW)
  gl.enableVertexAttribArray(a_pixelPosition)
  gl.vertexAttribPointer(a_pixelPosition, 2, gl.FLOAT, false, 0, 0)
  gl.vertexAttribDivisor(a_pixelPosition, 1)

  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return buffer
}
