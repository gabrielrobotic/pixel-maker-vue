#version 300 es

in vec2 a_position;
in vec2 a_pixelPosition;

uniform mat3 u_worldToNdc;

void main() {
    vec2 worldPosition = a_position + a_pixelPosition;

    vec3 position = u_worldToNdc * vec3(worldPosition, 1.0);

    gl_Position = vec4(position.xy, 0.0, 1.0);
}
