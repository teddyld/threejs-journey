#include ../includes/phongLight.glsl

uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

uniform AmbientLight uAmbientLight;
uniform SpotLight uSpotLight;
uniform DirectionalLight uDirectionalLight;
uniform PointLight uPointLight;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vFragPos;

void main()
{
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    mixStrength = smoothstep(0.0, 1.0, mixStrength);
    vec3 color = mix(
        uDepthColor,
        uSurfaceColor,
        mixStrength
    );

    // Lighting
    vec3 light = vec3(0.0);
    light += phongAmbientLight(uAmbientLight);
    light += phongSpotLight(uSpotLight, vNormal, vFragPos, cameraPosition);
    light += phongDirectionalLight(uDirectionalLight, vNormal, vFragPos, cameraPosition);
    light += phongPointLight(uPointLight, vNormal, vFragPos, cameraPosition);

    gl_FragColor = vec4(color * light, 1.0);
    // gl_FragColor = vec4(vNormal, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}