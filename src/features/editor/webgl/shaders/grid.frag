#version 300 es

precision highp float;

in vec2 v_ndcPosition;

uniform mat3 u_ndcToWorld;
uniform float u_gridSize;
uniform float u_gridTransition;
uniform float u_gridSectionScale;

out vec4 outColor;

float gridLine(
    vec2 worldPosition,
    float gridSize
) {
    vec2 gridPosition =
        worldPosition / gridSize;

    vec2 cell =
        fract(gridPosition);

    vec2 distanceToLine =
        min(
            cell,
            1.0 - cell
        );

    vec2 width =
        fwidth(gridPosition);

    float lineX =
        1.0 - smoothstep(
                0.0,
                width.x,
                distanceToLine.x
            );

    float lineY =
        1.0 - smoothstep(
                0.0,
                width.y,
                distanceToLine.y
            );

    return max(lineX, lineY);
}

void main() {
    vec3 worldPosition =
        u_ndcToWorld *
            vec3(v_ndcPosition, 1.0);

    float transition =
        smoothstep(
            0.0,
            1.0,
            u_gridTransition
        );

    float pixelLine =
        gridLine(
            worldPosition.xy,
            u_gridSize
        );

    float sectionSize =
        u_gridSize *
            u_gridSectionScale;

    float sectionLine =
        gridLine(
            worldPosition.xy,
            sectionSize
        );

    float majorSectionSize =
        sectionSize *
            u_gridSectionScale;

    float majorLine =
        gridLine(
            worldPosition.xy,
            majorSectionSize
        );

    float pixelOpacity =
        0.20 *
            (1.0 - transition);

    float sectionOpacity =
        0.35;

    float majorOpacity =
        0.50;

    float minorLine =
        pixelLine *
            (1.0 - sectionLine);

    float middleLine =
        sectionLine *
            (1.0 - majorLine);

    float line =
        max(
            minorLine * pixelOpacity,
            max(
                middleLine * sectionOpacity,
                majorLine * majorOpacity
            )
        );

    vec3 background =
        vec3(0.08);

    vec3 gridColor =
        vec3(0.25);

    outColor = vec4(
            mix(
                background,
                gridColor,
                line
            ),
            1.0
        );
}
