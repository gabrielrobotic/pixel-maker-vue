export function clearCanvas(gl: WebGL2RenderingContext): void {
  gl.clearColor(0.08, 0.08, 0.08, 1)

  gl.clear(gl.COLOR_BUFFER_BIT)
}
