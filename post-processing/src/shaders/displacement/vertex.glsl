varying vec2 vTexCoords;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vTexCoords = uv;
}