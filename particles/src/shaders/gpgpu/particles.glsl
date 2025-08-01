uniform float uTime;
uniform sampler2D uBase;
uniform float uDeltaTime;
uniform float uFlowfieldInfluence;
uniform float uFlowfieldStrength;
uniform float uFlowfieldFrequency;

#include ../includes/simplexNoise4d.glsl

void main()
{
    float time = uTime * 0.2;
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 particle = texture(uParticles, uv);
    vec4 base = texture(uBase, uv);

    if (particle.a >= 1.0) {
        particle.a = fract(particle.a);
        particle.xyz = base.xyz;
    }
    else
    {
        // Strength
        float strength = simplexNoise4d(vec4(base.xyz * 0.2, time + 1.0));
        float influence = (uFlowfieldInfluence - 0.5) * (-2.0);
        strength = smoothstep(influence, 1.0, strength);

        // Flow field
        vec3 flowField = vec3(
            simplexNoise4d(vec4(particle.xyz * uFlowfieldFrequency, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowfieldFrequency + 1.0, time)),
            simplexNoise4d(vec4(particle.xyz * uFlowfieldFrequency + 2.0, time))
        );

        flowField = normalize(flowField);
        particle.xyz += flowField * uFlowfieldStrength * uDeltaTime * strength;
        
        // Decay
        particle.a += uDeltaTime * 0.3;
    }

    gl_FragColor = particle;
}