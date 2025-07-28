uniform vec2 uFrequency;
uniform float uTime;

attribute float aRandom;

varying float vRandom;
varying vec2 vTexCoords;
varying float vElevation;

void main()
{

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    modelPosition.y += sin(modelPosition.z * uFrequency.y - uTime) * 0.1;
    vElevation = modelPosition.y;
    
    // modelPosition.z = aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vRandom = aRandom;
    vTexCoords = uv;
}