import vertexShaderSource from "@/webgl/shaders/default.vert?raw";
import fragmentShaderSource from "@/webgl/shaders/default.frag?raw";

import createShader from "@/webgl/shader";
import createProgram from "@/webgl/program";
import { createIndexBuffer, createVertexBuffer } from "@/webgl/buffer";

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

const vertices = new Float32Array([
  // A
  -0.5, 0.5,
  // B
  0.5, 0.5,
  // C
  0.5, -0.5,
  // D
  -0.5, -0.5,
]);

const indices = new Uint16Array([
  // triangle 1
  0, 1, 2,
  // triangle 2
  0, 2, 3,
]);

export function renderRect(gl: WebGL2RenderingContext): void {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;

  const vertexBuffer = createVertexBuffer(gl, vertices);
  const indexBuffer = createIndexBuffer(gl, indices);

  const program = createProgram(gl, vertexShader, fragmentShader)!;
  gl.useProgram(program);

  const translation = gl.getUniformLocation(program, "u_translation");
  gl.uniform2f(translation, camera.x, camera.y);

  const zoom = gl.getUniformLocation(program, "u_zoom");
  gl.uniform1f(zoom, camera.zoom);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
