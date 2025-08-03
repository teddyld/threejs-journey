uniform vec3 uColorSnow;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorRock;
uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;

varying vec3 vFragPosition;
varying float vUpDot;

#include ../includes/simplexNoise2d.glsl

void main()
{
    vec3 color = vec3(1.0);

    // Water
    float surfaceWaterMix = smoothstep(-1.0, -0.1, vFragPosition.y);
    color = mix(uColorWaterDeep, uColorWaterSurface, surfaceWaterMix);

    // Sand
    float sandMix = step(-0.1, vFragPosition.y);
    color = mix(color, uColorSand, sandMix);

    // Grass
    float grassMix = step(-0.06, vFragPosition.y);
    color = mix(color, uColorGrass, grassMix);

    // Rocks
    float rockMix = vUpDot;
    rockMix = 1.0 - step(0.8, rockMix);
    rockMix *= step(-0.06, vFragPosition.y);
    color = mix(color, uColorRock, rockMix);

    // Snow
    float snowThreshold = 0.45;
    snowThreshold += simplexNoise2d(vFragPosition.xz * 15.0) * 0.1;
    float snowMix = step(snowThreshold, vFragPosition.y);
    color = mix(color, uColorSnow, snowMix);

    csm_DiffuseColor = vec4(color, 1.0);
}