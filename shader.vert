#version 300 es

precision highp float;

uniform vec2 aspect;

in vec2 aPos;
in vec2 aUV;
out vec2 pos;
out vec2 uv;

void main() {
    pos = aPos * aspect;
    uv = aUV * aspect;

    gl_Position = vec4(aPos, 0.0, 1.0);
}