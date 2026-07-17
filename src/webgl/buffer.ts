export function createVertexBuffer(gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer {
  return createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, data);
}

export function createIndexBuffer(gl: WebGL2RenderingContext, data: Uint16Array): WebGLBuffer {
  return createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, data);
}

export function createBuffer(
  gl: WebGL2RenderingContext,
  target: GLenum,
  usage: GLenum,
  size: Float32Array | Uint16Array,
): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("Não foi possível criar buffer");

  gl.bindBuffer(target, buffer);
  gl.bufferData(target, size, usage);

  return buffer;
}
