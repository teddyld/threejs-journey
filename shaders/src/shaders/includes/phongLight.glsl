struct AmbientLight {
    vec3 color;
    float intensity;
};

struct DirectionalLight {
    vec3 color;
    vec3 direction;
    float intensity;
    float shininess;
};

struct PointLight {
    vec3 color;
    vec3 position;
    float intensity;
    float shininess;

    float constant;
    float linear;
    float quadratic;
};

struct SpotLight {
    vec3 color;
    vec3 position;
    vec3 direction;
    float intensity;
    float shininess;

    float innerCutOff;
    float outerCutOff;

    float constant;
    float linear;
    float quadratic;
};

float diffuseLight(vec3 lightDir, vec3 normal)
{
    float diff = max(dot(normal, lightDir), 0.0);
    return diff;
}

float specularLight(vec3 lightDir, vec3 normal, vec3 viewDir, float shininess)
{
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    return spec;
}

vec3 phongAmbientLight(AmbientLight light)
{
    return light.color * light.intensity;
}

vec3 phongDirectionalLight(DirectionalLight light, vec3 normal, vec3 fragPos, vec3 cameraPos)
{
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(-light.direction);
    vec3 viewDir = normalize(cameraPos - fragPos);

    float diffuse = diffuseLight(lightDir, norm);
    float specular = specularLight(norm, lightDir, viewDir, light.shininess);

    return (diffuse + specular) * light.intensity * light.color;
}

vec3 phongPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 cameraPos)
{
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 viewDir = normalize(cameraPos - fragPos);

    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    float diffuse = diffuseLight(lightDir, norm) * attenuation;
    float specular = specularLight(lightDir, norm, viewDir, light.shininess) * attenuation;

    return (diffuse + specular) * light.intensity * light.color;
}

vec3 phongSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 cameraPos)
{
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 viewDir = normalize(cameraPos - fragPos);

    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));

    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.innerCutOff - light.outerCutOff;
    float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);

    float diffuse = diffuseLight(lightDir, norm) * attenuation * intensity;
    float specular = specularLight(lightDir, norm, viewDir, light.shininess) * attenuation * intensity;

    return (diffuse + specular) * light.color * light.intensity;
}

