uniform float uTime;
uniform float uGlitchStrength;

varying vec3 vPosition;
varying vec3 vNormal;

#include ../includes/random2D.glsl

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Glitch
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.0);
    glitchStrength /= 3.0;
    glitchStrength = smoothstep(0.3, 1.0, glitchStrength) * uGlitchStrength;

    modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
    modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vPosition = modelPosition.xyz;
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0); // Ignore translation by setting homogenous coordinate
    vNormal = modelNormal.xyz;
}
