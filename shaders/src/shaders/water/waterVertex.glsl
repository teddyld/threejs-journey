uniform float uTime;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallWavesIteration;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vFragPos;

#include ../includes/perlinNoise3D.glsl

float waveElevation(vec3 position)
{
    float elevation = 
        sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) * 
        sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) * uBigWavesElevation;

    for (float i = 1.0; i <= uSmallWavesIteration; i++) {
        elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
    }

    return elevation;
}

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float stride = 0.01;
    vec3 modelPositionA = modelPosition.xyz + vec3(stride, 0.0, 0.0);
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -stride);

    float elevation = waveElevation(modelPosition.xyz);
    modelPosition.y += elevation;
    modelPositionA.y += waveElevation(modelPositionA.xyz);
    modelPositionB.y += waveElevation(modelPositionB.xyz);

    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);
    vec3 norm = cross(toA, toB);

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vElevation = elevation;
    vNormal = norm;
    vFragPos = modelPosition.xyz;
}