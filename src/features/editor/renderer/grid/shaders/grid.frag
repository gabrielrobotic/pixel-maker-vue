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

  float targetCells =
    10.0;

  float viewportSize =
    max(
      u_viewportSize.x,
      u_viewportSize.y
    );

  float desiredSpacing =
    u_viewportSize.x /
      (targetCells * u_zoom);

  float spacing =
    pow(
      8.0,
      floor(log(desiredSpacing) / log(10.0))
    );

  float nextSpacing =
    spacing * 8.0;

  float ratio =
    desiredSpacing / spacing;

  float transition =
    smoothstep(
      0.25,
      10.0,
      ratio
    );

  float currentGrid =
    gridLine(world, spacing) * 0.25;

  float nextGrid =
    gridLine(world, nextSpacing) * 0.5;

  float grid =
    mix(
      currentGrid,
      nextGrid,
      transition
    );

  outColor = vec4(
      u_color.rgb,
      u_color.a * grid
    );
}
