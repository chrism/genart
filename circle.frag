precision highp float;

uniform float time;
uniform float aspect;
varying vec2 vUv;

#pragma glslify: noise = require('glsl-noise/simplex/3d');
#pragma glslify: hsl2rgb = require('glsl-hsl2rgb');

void main () {
  float d = 0.0;
  d += 0.5 * (noise(vec3(vUv * 1.5, time * 0.25)) * 0.5 + 0.5);
  d += 0.25 * (noise(vec3(vUv * 0.5, time * 0.5)));

  vec2 coord = vUv - 0.5;
  coord.x *= aspect;
  float dist = length(coord);
  float radius = 0.4;
  float mask = smoothstep(radius, radius - 0.001, dist);

  float hue = d * 0.25;
  hue = mod(hue + time * 0.05, 1.0);

  vec3 color = hsl2rgb(hue, 0.5, 0.5);
  gl_FragColor = vec4(vec3(color), mask);
}