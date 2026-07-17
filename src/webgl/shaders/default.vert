#version 300 es

in vec2 a_position;

uniform vec2 u_translation;
uniform float u_zoom;

void main() {
  vec2 position = vec2(a_position + u_translation) * u_zoom;
  gl_Position = vec4(position, 0.0, 1.0);
}
