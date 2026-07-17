export default function initWebGL2(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  const gl = canvas.getContext("webgl2");
  if (!gl) return null;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.15, 0.15, 0.18, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return gl;
}
