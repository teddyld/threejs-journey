uniform sampler2D tDiffuse;
uniform sampler2D uNormalMap;

varying vec2 vTexCoords;

void main()
{
    vec3 normalColor = texture2D(uNormalMap, vTexCoords).xyz * 2.0 - 1.0;
    vec2 newUv = vTexCoords + normalColor.xy;

    vec4 color = texture2D(tDiffuse, newUv);
    gl_FragColor = color;
}