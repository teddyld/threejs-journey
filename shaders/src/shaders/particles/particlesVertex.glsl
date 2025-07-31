attribute float aIntensity;
attribute float aAngle;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform sampler2D uDisplacementTexture;

varying vec3 vColor;

void main()
{
    // Displacement
    vec3 newPosition = position;
    float displacementIntensity = texture2D(uDisplacementTexture, uv).r;
    displacementIntensity = smoothstep(0.1, 0.3, displacementIntensity);
    vec3 displacement = vec3(cos(aAngle) * 0.2, sin(aAngle) * 0.2, 1.0);
    displacement = normalize(displacement);
    displacement *= displacementIntensity;
    displacement *= 3.0;
    displacement *= aIntensity;
    newPosition += displacement;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    float textureIntensity = texture2D(uTexture, uv).r;

    gl_Position = projectionPosition;
    gl_PointSize = 0.05 * uResolution.y * textureIntensity;
    gl_PointSize *= -1.0 / viewPosition.z; 

    vColor = vec3(pow(textureIntensity, 2.0));
}