#version 300 es

in vec2 a_position;

out vec2 v_ndcPosition;

void main() {
    v_ndcPosition = a_position;

    gl_Position = vec4(a_position.xy, 0.0, 1.0);
}
