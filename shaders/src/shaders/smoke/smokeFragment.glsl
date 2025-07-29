uniform float uTime;
uniform sampler2D uPerlinTexture;
uniform vec3 uSmokeColor;

varying vec2 vTexCoords;

void main()
{
    vec2 smokeUV = vTexCoords;
    smokeUV.x *= 0.5;
    smokeUV.y *= 0.3;
    smokeUV.y -= uTime * 0.03;
    float smoke = texture2D(uPerlinTexture, smokeUV).r;

    smoke = smoothstep(0.4, 1.0, smoke);

    // Blur edges
    smoke *= smoothstep(0.0, 0.1, vTexCoords.x);
    smoke *= 1.0 - smoothstep(0.9, 1.0, vTexCoords.x);
    smoke *= 1.0 - smoothstep(0.4, 1.0, vTexCoords.y);
    smoke *= smoothstep(0.0, 0.1, vTexCoords.y);

    gl_FragColor = vec4(uSmokeColor, smoke);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}