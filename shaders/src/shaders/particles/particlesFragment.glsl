varying vec3 vColor;

void main()
{
    float d = length(gl_PointCoord - 0.5);

    if (d > 0.5) discard;

    gl_FragColor = vec4(vColor, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}