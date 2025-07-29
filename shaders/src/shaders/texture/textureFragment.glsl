uniform sampler2D uTexture;

varying float vRandom;
varying float vElevation;
varying vec2 vTexCoords;

void main()
{
    vec4 texColor = texture2D(uTexture, vTexCoords);
    texColor.rgb *= vElevation * 2.0 + 1.0;
    gl_FragColor = texColor;
}