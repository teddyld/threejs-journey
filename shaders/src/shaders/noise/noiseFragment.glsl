varying vec2 vTexCoords;

#include ../includes/perlinNoise2D.glsl

void main()
{
    float strength = step(0.9, sin(cnoise(vTexCoords * 10.0) * 20.0));
    vec3 color = mix(vec3(0.0), vec3(vTexCoords, 1.0), strength);
    gl_FragColor = vec4(color, 1.0);
}