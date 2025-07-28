varying vec2 vTexCoords;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vTexCoords = uv;
}