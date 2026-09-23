export function resizeCanvas(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext): boolean {
  const pixelRatio = window.devicePixelRatio || 1

  const width = Math.floor(canvas.clientWidth * pixelRatio)
  const height = Math.floor(canvas.clientHeight * pixelRatio)

  if (canvas.width === width && canvas.height === height) return false

  canvas.width = width
  canvas.height = height

  gl.viewport(0, 0, width, height)

  return true
}
