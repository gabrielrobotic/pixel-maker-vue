export function createWebGL2Context(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2')

  if (!gl) {
    throw new Error('WebGL 2.0 is not supported.')
  }

  return gl
}
