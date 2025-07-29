uniform float uTime;
uniform float uFresnelIntensity;
uniform vec3 uHologramColor;
uniform float uHolographicPower;
uniform float uLowerFalloff;
uniform float uUpperFalloff;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main()
{
    // Stripes
    float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
    stripes = pow(stripes, 3.0);

    // Fresnel
    vec3 normal = normalize(vNormal);
    if (!gl_FrontFacing)
        normal *= -1.0;

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.0; // Remap to [0, 2]
    fresnel = pow(fresnel, uFresnelIntensity);

    // Falloff
    float falloff = smoothstep(uLowerFalloff, uUpperFalloff, fresnel);
    
    // Holographic effect
    float holographic = fresnel * stripes;
    holographic += fresnel * uHolographicPower;
    holographic *= falloff;

    gl_FragColor = vec4(uHologramColor, holographic);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}