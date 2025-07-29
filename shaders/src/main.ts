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
const smokeFolder = gui.addFolder("Smoke");
const hologramFolder = gui.addFolder("Hologram");

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas element not found.");
}
// Scene
const scene = new THREE.Scene();

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
        mesh.rotation.x = -Math.PI * 0.5;

        material.vertexShader = waterVertexShader;
        material.fragmentShader = waterFragmentShader;

        debugObject.depthColor = "#3f78d5";
        debugObject.surfaceColor = "#a3d2f0";

        material.uniforms = {
          uTime: { value: 0 },
          uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
          uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
          uColorOffset: { value: 0.1 },
          uColorMultiplier: { value: 2.5 },
          uBigWavesElevation: { value: 0.2 },
          uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
          uBigWavesSpeed: { value: 0.75 },
          uSmallWavesElevation: { value: 0.15 },
          uSmallWavesFrequency: { value: 3 },
          uSmallWavesSpeed: { value: 0.2 },
          uSmallWavesIteration: { value: 3 },
        };

        if (!waterFolder.children.length) {
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
        }

        onTickUpdateShader = (elapsedTime) => {
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
      default:
        console.log(`Select a folder`);
    }

    material.needsUpdate = true;
    lastName = name;
  }
});

// Default shader opened
smokeFolder.open();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
