#version 300 es

precision highp float;

uniform vec4 u_color;
uniform vec2 u_viewportSize;
uniform vec2 u_cameraPosition;
uniform float u_zoom;

out vec4 outColor;

void main() {
  vec2 clip = (gl_FragCoord.xy / u_viewportSize) * 2.0 - 1.0;

  vec2 scale = 2.0 * u_zoom / u_viewportSize;

  vec2 world = clip / scale + u_cameraPosition;

  vec2 worldLineWidth = fwidth(world);
  vec2 gridDistance = abs(fract(world - 0.5) - 0.5);
  vec2 line = 1.0 - smoothstep(
        vec2(0.0),
        worldLineWidth,
        gridDistance
      );

  float grid = max(line.x, line.y);

  outColor = vec4(u_color * grid);
}
