import vertexShaderSource from "@/webgl/shaders/default.vert?raw";
import fragmentShaderSource from "@/webgl/shaders/default.frag?raw";

import createShader from "@/webgl/shader";
import createProgram from "@/webgl/program";
import { createVertexBuffer } from "@/webgl/buffer";
import createGridVertices from "@/webgl/grid";

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
};

export function renderGrid(gl: WebGL2RenderingContext) {
  const vertices = createGridVertices(1, 0.1);

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;

  createVertexBuffer(gl, vertices);

  const program = createProgram(gl, vertexShader, fragmentShader)!;
  gl.useProgram(program);

  const translation = gl.getUniformLocation(program, "u_translation");
  gl.uniform2f(translation, camera.x, camera.y);

  const zoom = gl.getUniformLocation(program, "u_zoom");
  gl.uniform1f(zoom, camera.zoom);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.LINES, 0, vertices.length / 2);
}
