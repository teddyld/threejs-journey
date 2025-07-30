varying vec3 vNormal;
varying vec3 vFragPos;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vNormal = mat3(transpose(inverse(modelMatrix))) * normal;
    vFragPos = modelPosition.xyz;
}