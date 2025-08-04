uniform sampler2D tDiffuse;
uniform vec3 uTint;

varying vec2 vTexCoords;

void main()
{
    vec4 color = texture2D(tDiffuse, vTexCoords);
    color.rgb += uTint;
    gl_FragColor = color;
}