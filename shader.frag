#version 300 es

precision highp float;

uniform vec2[NUM_POINTS] points;
uniform vec3[NUM_POINTS] colors;
uniform float zoom;

in vec2 pos;
in vec2 uv;
out vec4 color;

#define infinity 4294967295.0

void main() {
    float mindist = infinity;
    int idx = -1;
    for(int i = 0; i < NUM_POINTS; i++) {
        float dist = distance(uv * zoom, points[i]);

        if(dist < mindist) {
            mindist = dist;
            idx = i;
        }
    }

    color = vec4(vec3(colors[idx] * (1.5 - mindist)), 1.0);
}
