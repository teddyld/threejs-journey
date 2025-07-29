uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main()
{
    vec3 color = mix(
        uDepthColor,
        uSurfaceColor,
        (vElevation + uColorOffset) * uColorMultiplier
    );

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}