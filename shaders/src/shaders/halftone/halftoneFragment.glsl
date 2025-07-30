uniform vec2 uResolution;

struct Halftone {
    vec3 color;
    vec3 pointColor;
    vec3 lightColor;
    float pointRepetitions;
    float lightRepetitions;
    vec3 direction;
    float low;
    float high;
};

uniform Halftone uHalftone;

varying vec3 vNormal;
varying vec3 vFragPos;

#include ../includes/phongLight.glsl

vec3 addHalftone(vec3 fromColor, vec3 withColor, float repetitions, vec3 direction, float low, float high)
{
    vec2 uv = mod((gl_FragCoord.xy / uResolution.y) * repetitions, 1.0);

    float intensity = dot(direction, vNormal);
    intensity = smoothstep(low, high, intensity);  
    float point = 1.0 - step(0.5 * intensity, distance(uv, vec2(0.5)));

    return mix(fromColor, withColor, point);
}

void main()
{
    vec3 light = vec3(0.0);
    AmbientLight ambientLight = AmbientLight(vec3(1.0), 1.0);
    DirectionalLight directionalLight = DirectionalLight(vec3(1.0), vec3(1.0), 1.0, 1.0);

    light += phongAmbientLight(ambientLight);
    light += phongDirectionalLight(directionalLight, vNormal, vFragPos, cameraPosition);
    vec3 color = uHalftone.color * light;

    color = addHalftone(color, uHalftone.pointColor, uHalftone.pointRepetitions, uHalftone.direction, uHalftone.low, uHalftone.high);
    color = addHalftone(color, uHalftone.lightColor, uHalftone.lightRepetitions, directionalLight.direction, 0.5, 1.5);

    gl_FragColor = vec4(color, 1.0);
}