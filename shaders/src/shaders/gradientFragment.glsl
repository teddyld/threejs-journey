varying vec2 vTexCoords;

void main() {
    // float barX = step(0.4, mod(vTexCoords.x * 10.0, 1.0));
    // barX *= step(0.8, mod(vTexCoords.y * 10.0, 1.0));

    // float barY = step(0.8, mod(vTexCoords.x * 10.0, 1.0));
    // barY *= step(0.4, mod(vTexCoords.y * 10.0, 1.0));

    // float strength = barX + barY;

    float strength = floor(vTexCoords.x * 10.0) / 10.0 * floor(vTexCoords.y * 10.0) / 10.0;

    vec3 color = mix(vec3(0.0), vec3(vTexCoords, 1.0), strength);

    gl_FragColor = vec4(color, 1.0);
}