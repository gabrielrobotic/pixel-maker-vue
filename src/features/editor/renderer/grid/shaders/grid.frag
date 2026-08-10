#version 300 es

precision highp float;

uniform vec2 u_viewportSize;
uniform vec2 u_cameraPosition;
uniform float u_zoom;
uniform vec4 u_color;

out vec4 outColor;

float gridLine(vec2 world, float spacing) {
  vec2 position = world / spacing;

  vec2 distance =
    abs(fract(position - 0.5) - 0.5);

  vec2 width =
    fwidth(position);

  vec2 line =
    1.0 - smoothstep(
        vec2(0.0),
        width,
        distance
      );

  return max(line.x, line.y);
}

void main() {
  vec2 clip =
    (gl_FragCoord.xy / u_viewportSize) * 2.0 - 1.0;

  vec2 scale =
    2.0 * u_zoom / u_viewportSize;

  vec2 world =
    clip / scale + u_cameraPosition;

  float grid1 =
    gridLine(world, 1.0);

  float grid10 =
    gridLine(world, 10.0);

  float grid100 =
    gridLine(world, 100.0);

  float gridTransition100 =
    smoothstep(1.0, 20.0, u_zoom);

  float gridCoarse =
    mix(
      grid100,
      grid10 * 0.5,
      gridTransition100
    );

  float gridTransition1 =
    smoothstep(10.0, 100.0, u_zoom);

  float grid =
    mix(
      gridCoarse,
      grid1 * 0.25,
      gridTransition1
    );

  outColor = vec4(
      u_color.rgb,
      u_color.a * grid
    );
}
