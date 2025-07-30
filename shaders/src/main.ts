import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

import textureVertexShader from "./shaders/texture/textureVertex.glsl";
import textureFragmentShader from "./shaders/texture/textureFragment.glsl";
import gradientVertexShader from "./shaders/gradient/gradientVertex.glsl";
import gradientFragmentShader from "./shaders/gradient/gradientFragment.glsl";
import noiseVertexShader from "./shaders/noise/noiseVertex.glsl";
import noiseFragmentShader from "./shaders/noise/noiseFragment.glsl";
import waterVertexShader from "./shaders/water/waterVertex.glsl";
import waterFragmentShader from "./shaders/water/waterFragment.glsl";
import smokeVertexShader from "./shaders/smoke/smokeVertex.glsl";
import smokeFragmentShader from "./shaders/smoke/smokeFragment.glsl";
import hologramVertexShader from "./shaders/hologram/hologramVertex.glsl";
import hologramFragmentShader from "./shaders/hologram/hologramFragment.glsl";
import halftoneVertexShader from "./shaders/halftone/halftoneVertex.glsl";
import halftoneFragmentShader from "./shaders/halftone/halftoneFragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({
  title: "Open a folder to create shader",
  width: 300,
  closeFolders: true,
});

const textureFolder = gui.addFolder("Waving Texture");
const gradientFolder = gui.addFolder("Gradient");
const noiseFolder = gui.addFolder("Noise");
const waterFolder = gui.addFolder("Water");

const waterAmbientFolder = waterFolder.addFolder("Ambient light");
const waterSpotFolder = waterFolder.addFolder("Spot light");
const waterDirectionalFolder = waterFolder.addFolder("Directional light");
const waterPointFolder = waterFolder.addFolder("Point light");

const smokeFolder = gui.addFolder("Smoke");
const hologramFolder = gui.addFolder("Hologram");
const halftoneFolder = gui.addFolder("Halftone");

const fireworkFolder = gui.addFolder("Firework");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: 1,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas element not found.");
}
// Scene
const scene = new THREE.Scene();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

/* Textures */
const textureLoader = new THREE.TextureLoader();
const catTexture = textureLoader.load("/textures/cat.jpg");
const perlinTexture = textureLoader.load("/textures/perlin.png");

perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

/**
 * Objects
 */
const geometry = new THREE.PlaneGeometry(1, 1);
const material = new THREE.ShaderMaterial({ transparent: true });

const mesh = new THREE.Mesh(geometry as THREE.BufferGeometry, material);
scene.add(mesh);

let name = "";
let lastName = "";
let onTickUpdateShader: (elapsedTime: number) => void = () => {};
const debugObject: { [key: string]: any } = {};

gui.onOpenClose((changedGUI) => {
  if (changedGUI.parent._title !== gui._title) {
    return;
  }

  name = changedGUI._title;
  for (const folder of gui.folders) {
    if (folder._title !== name) {
      folder.close();
    }
  }

  if (name !== lastName) {
    // Reset parameters to default
    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

    mesh.material.uniforms = {};
    mesh.material.side = THREE.FrontSide;
    mesh.material.depthWrite = true;
    material.blending = THREE.NormalBlending;

    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);

    onTickUpdateShader = () => {};

    switch (name) {
      case textureFolder._title:
        const count = geometry.attributes.position.count;
        const randoms = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          randoms[i] = Math.random();
        }

        geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

        material.vertexShader = textureVertexShader;
        material.fragmentShader = textureFragmentShader;
        material.uniforms = {
          uFrequency: { value: new THREE.Vector2(10, 5) },
          uTime: { value: 0 },
          uTexture: { value: catTexture },
        };

        if (!textureFolder.children.length) {
          textureFolder
            .add(material.uniforms.uFrequency.value, "x")
            .min(0)
            .max(20)
            .step(0.01)
            .name("uFrequencyX");
          textureFolder
            .add(material.uniforms.uFrequency.value, "y")
            .min(0)
            .max(20)
            .step(0.01)
            .name("uFrequencyY");
        }

        onTickUpdateShader = (elapsedTime) => {
          material.uniforms.uTime.value = elapsedTime;
        };
        break;
      case gradientFolder._title:
        material.vertexShader = gradientVertexShader;
        material.fragmentShader = gradientFragmentShader;
        break;
      case noiseFolder._title:
        material.vertexShader = noiseVertexShader;
        material.fragmentShader = noiseFragmentShader;
        break;
      case waterFolder._title:
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(2, 2, 512, 512);
        mesh.geometry.deleteAttribute("normal");
        mesh.geometry.deleteAttribute("uv");
        mesh.rotation.x = -Math.PI * 0.5;

        material.vertexShader = waterVertexShader;
        material.fragmentShader = waterFragmentShader;

        debugObject.depthColor = "#ff4000";
        debugObject.surfaceColor = "#151c37";
        debugObject.ambientColor = "#ffffff";
        debugObject.spotLightColor = "#ffffff";
        debugObject.dirLightColor = "#ffffff";
        debugObject.pointLightColor = "#ffffff";
        debugObject.innerCutOff = 12.5;
        debugObject.outerCutOff = 17.5;

        material.uniforms = {
          uTime: { value: 0 },
          uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
          uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
          uColorOffset: { value: 0.925 },
          uColorMultiplier: { value: 1 },
          uBigWavesElevation: { value: 0.2 },
          uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
          uBigWavesSpeed: { value: 0.75 },
          uSmallWavesElevation: { value: 0.15 },
          uSmallWavesFrequency: { value: 3 },
          uSmallWavesSpeed: { value: 0.2 },
          uSmallWavesIteration: { value: 3 },
          uAmbientLight: {
            value: {
              color: new THREE.Color(debugObject.ambientColor),
              intensity: 0,
            },
          },
          uSpotLight: {
            value: {
              color: new THREE.Color(debugObject.spotLightColor),
              position: new THREE.Vector3(0, 0, 0),
              direction: new THREE.Vector3(0, -1, 0),
              intensity: 5,
              shininess: 32,
              innerCutOff: Math.cos((debugObject.innerCutOff * Math.PI) / 180),
              outerCutOff: Math.cos((debugObject.outerCutOff * Math.PI) / 180),
              constant: 1,
              linear: 0.7,
              quadratic: 1.8,
            },
          },
          uDirectionalLight: {
            value: {
              color: new THREE.Color(debugObject.dirLightColor),
              direction: new THREE.Vector3(-1, 0.5, 0),
              intensity: 0,
              shininess: 30,
            },
          },
          uPointLight: {
            value: {
              color: new THREE.Color(debugObject.pointLightColor),
              position: new THREE.Vector3(0, 0.25, 0),
              intensity: 5,
              shininess: 30,
              constant: 1,
              linear: 0.7,
              quadratic: 1.8,
            },
          },
        };

        if (waterFolder.children.length === 4) {
          // Water parameters
          waterFolder
            .addColor(debugObject, "depthColor")
            .name("uDepthColor")
            .onChange(() => {
              material.uniforms.uDepthColor.value.set(debugObject.depthColor);
            });
          waterFolder
            .addColor(debugObject, "surfaceColor")
            .name("uSurfaceColor")
            .onChange(() => {
              material.uniforms.uSurfaceColor.value.set(
                debugObject.surfaceColor
              );
            });
          waterFolder
            .add(material.uniforms.uColorOffset, "value")
            .min(0)
            .max(1)
            .step(0.001)
            .name("uColorOffset");
          waterFolder
            .add(material.uniforms.uColorMultiplier, "value")
            .min(0)
            .max(10)
            .step(0.001)
            .name("uColorMultiplier");
          waterFolder
            .add(material.uniforms.uBigWavesElevation, "value")
            .min(0)
            .max(1)
            .step(0.001)
            .name("uBigWavesElevation");
          waterFolder
            .add(material.uniforms.uBigWavesFrequency.value, "x")
            .min(0)
            .max(10)
            .step(0.001)
            .name("uBigWavesFrequencyX");
          waterFolder
            .add(material.uniforms.uBigWavesFrequency.value, "y")
            .min(0)
            .max(10)
            .step(0.001)
            .name("uBigWavesFrequencyY");
          waterFolder
            .add(material.uniforms.uBigWavesSpeed, "value")
            .min(0)
            .max(5)
            .step(0.001)
            .name("uBigWavesSpeed");

          waterFolder
            .add(material.uniforms.uSmallWavesElevation, "value")
            .min(0)
            .max(1)
            .step(0.001)
            .name("uSmallWavesElevation");
          waterFolder
            .add(material.uniforms.uSmallWavesFrequency, "value")
            .min(0)
            .max(30)
            .step(0.001)
            .name("uSmallWavesFrequency");
          waterFolder
            .add(material.uniforms.uSmallWavesSpeed, "value")
            .min(0)
            .max(4)
            .step(0.001)
            .name("uSmallWavesSpeed");
          waterFolder
            .add(material.uniforms.uSmallWavesIteration, "value")
            .min(0)
            .max(5)
            .step(1)
            .name("uSmallWavesIteration");
          // Ambient Light
          waterAmbientFolder
            .addColor(debugObject, "ambientColor")
            .name("uAmbientLight.color")
            .onChange(() => {
              material.uniforms.uAmbientLight.value.color.set(
                debugObject.ambientColor
              );
            });
          waterAmbientFolder
            .add(material.uniforms.uAmbientLight.value, "intensity")
            .min(0)
            .max(5)
            .step(0.001)
            .name("uAmbientLight.intensity");
          // Spot light
          waterSpotFolder
            .addColor(debugObject, "spotLightColor")
            .name("uSpotLight.color")
            .onChange(() => {
              material.uniforms.uSpotLight.value.color.set(
                debugObject.spotLightColor
              );
            });
          waterSpotFolder
            .add(material.uniforms.uSpotLight.value, "intensity")
            .min(0)
            .max(10)
            .step(0.001)
            .name("uSpotLight.intensity");
          waterSpotFolder
            .add(material.uniforms.uSpotLight.value, "shininess")
            .min(1)
            .max(64)
            .step(0.001)
            .name("uSpotLight.shininess");
          waterSpotFolder
            .add(debugObject, "innerCutOff")
            .min(0)
            .max(45)
            .step(0.001)
            .name("uSpotLight.innerCutOff")
            .onFinishChange(() => {
              material.uniforms.uSpotLight.value.innerCutOff = Math.cos(
                (debugObject.innerCutOff * Math.PI) / 180
              );
            });
          waterSpotFolder
            .add(debugObject, "outerCutOff")
            .min(0)
            .max(45)
            .step(0.001)
            .name("uSpotLight.outerCutOff")
            .onFinishChange(() => {
              material.uniforms.uSpotLight.value.outerCutOff = Math.cos(
                (debugObject.outerCutOff * Math.PI) / 180
              );
            });
          waterSpotFolder
            .add(material.uniforms.uSpotLight.value, "constant")
            .min(0)
            .max(1)
            .step(0.0001)
            .name("uSpotLight.constant");
          waterSpotFolder
            .add(material.uniforms.uSpotLight.value, "linear")
            .min(0)
            .max(1)
            .step(0.0001)
            .name("uSpotLight.linear");
          waterSpotFolder
            .add(material.uniforms.uSpotLight.value, "quadratic")
            .min(0)
            .max(3)
            .step(0.0001)
            .name("uSpotLight.quadratic");
          // Directional light
          waterDirectionalFolder
            .addColor(debugObject, "dirLightColor")
            .name("uDirectionalLight.color")
            .onChange(() => {
              material.uniforms.uDirectionalLight.value.color.set(
                debugObject.dirLightColor
              );
            });
          waterDirectionalFolder
            .add(material.uniforms.uDirectionalLight.value, "intensity")
            .min(0)
            .max(5)
            .step(0.001)
            .name("uDirectionalLight.intensity");
          waterDirectionalFolder
            .add(material.uniforms.uDirectionalLight.value, "shininess")
            .min(1)
            .max(64)
            .step(0.001)
            .name("uDirectionalLight.shininess");
          // Point light
          waterPointFolder
            .addColor(debugObject, "pointLightColor")
            .name("uPointLight.color")
            .onChange(() => {
              material.uniforms.uPointLight.value.color.set(
                debugObject.pointLightColor
              );
            });
          waterPointFolder
            .add(material.uniforms.uPointLight.value, "intensity")
            .min(0)
            .max(10)
            .step(0.001)
            .name("uPointLight.intensity");

          waterPointFolder
            .add(material.uniforms.uPointLight.value, "constant")
            .min(0)
            .max(1)
            .step(0.0001)
            .name("uPointLight.constant");
          waterPointFolder
            .add(material.uniforms.uPointLight.value, "linear")
            .min(0)
            .max(5)
            .step(0.0001)
            .name("uPointLight.linear");
          waterPointFolder
            .add(material.uniforms.uPointLight.value, "quadratic")
            .min(0)
            .max(5)
            .step(0.0001)
            .name("uPointLight.quadratic");
        }

        onTickUpdateShader = (elapsedTime) => {
          material.uniforms.uSpotLight.value.position.set(
            Math.sin(elapsedTime * 0.7) * 0.4,
            0.5,
            Math.cos(elapsedTime * 0.5) * 0.4
          );
          material.uniforms.uTime.value = elapsedTime;
        };
        break;
      case smokeFolder._title:
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(1, 1, 16, 64);
        mesh.scale.set(0.75, 3, 0.75);

        material.vertexShader = smokeVertexShader;
        material.fragmentShader = smokeFragmentShader;

        debugObject.smokeColor = "#3f78d5";

        material.uniforms = {
          uTime: { value: 0 },
          uPerlinTexture: { value: perlinTexture },
          uSmokeColor: { value: new THREE.Color(debugObject.smokeColor) },
        };

        material.side = THREE.DoubleSide;
        mesh.material.depthWrite = false;

        if (!smokeFolder.children.length) {
          smokeFolder.add(material, "wireframe");
          smokeFolder.addColor(debugObject, "smokeColor").onChange(() => {
            material.uniforms.uSmokeColor.value.set(debugObject.smokeColor);
          });
        }

        onTickUpdateShader = (elapsedTime) => {
          material.uniforms.uTime.value = elapsedTime;
        };
        break;
      case hologramFolder._title:
        mesh.geometry.dispose();
        mesh.geometry = new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32);
        material.vertexShader = hologramVertexShader;
        material.fragmentShader = hologramFragmentShader;
        material.side = THREE.DoubleSide;
        material.depthWrite = false;
        material.blending = THREE.AdditiveBlending;

        debugObject.hologramColor = "#23c55e";
        debugObject.geometry = "TorusKnot";

        material.uniforms = {
          uTime: { value: 0 },
          uFresnelIntensity: { value: 2 },
          uLowerFalloff: { value: 0.8 },
          uUpperFalloff: { value: 0 },
          uHologramColor: { value: new THREE.Color(debugObject.hologramColor) },
          uHolographicPower: { value: 1.25 },
          uGlitchStrength: { value: 0.25 },
        };

        if (!hologramFolder.children.length) {
          hologramFolder.addColor(debugObject, "hologramColor").onChange(() => {
            material.uniforms.uHologramColor.value.set(
              debugObject.hologramColor
            );
          });
          hologramFolder
            .add(material.uniforms.uLowerFalloff, "value")
            .min(0)
            .max(1)
            .step(0.001)
            .name("uLowerFalloff");
          hologramFolder
            .add(material.uniforms.uUpperFalloff, "value")
            .min(0)
            .max(1)
            .step(0.001)
            .name("uUpperFalloff");
          hologramFolder
            .add(material.uniforms.uFresnelIntensity, "value")
            .min(0)
            .max(10)
            .step(0.001)
            .name("uFresnelIntensity");
          hologramFolder
            .add(material.uniforms.uGlitchStrength, "value")
            .min(0)
            .max(1)
            .step(0.001)
            .name("uGlitchStrength");
          hologramFolder
            .add(debugObject, "geometry")
            .options({ TorusKnot: 0, Sphere: 1, Cone: 2 })
            .onChange((value: number) => {
              mesh.geometry.dispose();
              if (value === 0)
                mesh.geometry = new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32);
              else if (value === 1) mesh.geometry = new THREE.SphereGeometry();
              else if (value === 2)
                mesh.geometry = new THREE.ConeGeometry(1, 1);
            });
          hologramFolder
            .add(material.uniforms.uHolographicPower, "value")
            .min(0)
            .max(5)
            .step(0.001)
            .name("uHolographicPower");
        }

        onTickUpdateShader = (elapsedTime) => {
          mesh.rotation.x = elapsedTime * 0.1;
          mesh.rotation.z = elapsedTime * 0.1;
          material.uniforms.uTime.value = elapsedTime;
        };
        break;
      case halftoneFolder._title:
        mesh.geometry.dispose();
        mesh.geometry = new THREE.SphereGeometry();

        material.vertexShader = halftoneVertexShader;
        material.fragmentShader = halftoneFragmentShader;

        debugObject.color = "#d86e95";
        debugObject.pointColor = "#dde6f5";
        debugObject.lightColor = "#e5ffe0";

        material.uniforms = {
          uHalftone: {
            value: {
              color: new THREE.Color(debugObject.color),
              pointColor: new THREE.Color(debugObject.pointColor),
              lightColor: new THREE.Color(debugObject.lightColor),
              pointRepetitions: 100,
              lightRepetitions: 130,
              direction: new THREE.Vector3(0, -1, 0),
              low: -0.8,
              high: 1.5,
            },
          },

          uResolution: {
            value: new THREE.Vector2(
              sizes.width * sizes.pixelRatio,
              sizes.height * sizes.pixelRatio
            ),
          },
        };

        if (!halftoneFolder.children.length) {
          halftoneFolder
            .addColor(debugObject, "color")
            .name("uHalftone.color")
            .onChange(() => {
              material.uniforms.uHalftone.value.color.set(debugObject.color);
            });
          halftoneFolder
            .addColor(debugObject, "pointColor")
            .name("uHalftone.pointColor")
            .onChange(() => {
              material.uniforms.uHalftone.value.pointColor.set(
                debugObject.pointColor
              );
            });
          halftoneFolder
            .addColor(debugObject, "lightColor")
            .name("uHalftone.lightColor")
            .onChange(() => {
              material.uniforms.uHalftone.value.lightColor.set(
                debugObject.lightColor
              );
            });

          halftoneFolder
            .add(material.uniforms.uHalftone.value, "pointRepetitions")
            .min(0)
            .max(200)
            .step(1);
          halftoneFolder
            .add(material.uniforms.uHalftone.value, "lightRepetitions")
            .min(0)
            .max(200)
            .step(1);

          halftoneFolder
            .add(material.uniforms.uHalftone.value, "low")
            .min(-3)
            .max(3)
            .step(0.001);
          halftoneFolder
            .add(material.uniforms.uHalftone.value, "high")
            .min(-3)
            .max(3)
            .step(0.001);
        }

        onTickUpdateShader = (elapsedTime) => {
          mesh.rotation.x = elapsedTime * 0.1;
          mesh.rotation.z = elapsedTime * 0.1;
        };
        break;
      default:
        console.log(`Select a folder`);
    }

    material.needsUpdate = true;
    lastName = name;
  }
});

// Default shader opened
halftoneFolder.open();

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update material
  material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas as HTMLElement);
controls.enableDamping = true;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  onTickUpdateShader(elapsedTime);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
