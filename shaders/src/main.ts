import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

import textureVertexShader from "./shaders/textureVertex.glsl";
import textureFragmentShader from "./shaders/textureFragment.glsl";
import gradientVertexShader from "./shaders/gradientVertex.glsl";
import gradientFragmentShader from "./shaders/gradientFragment.glsl";
import noiseVertexShader from "./shaders/noiseVertex.glsl";
import noiseFragmentShader from "./shaders/noiseFragment.glsl";
import waterVertexShader from "./shaders/waterVertex.glsl";
import waterFragmentShader from "./shaders/waterFragment.glsl";

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

/**
 * Objects
 */
const geometry = new THREE.PlaneGeometry(2, 2, 512, 512);
const material = new THREE.ShaderMaterial();

let name = "";
let lastName = "";
let onTickUpdateShader: (elapsedTime: number) => void = () => {};

gui.onOpenClose((changedGUI) => {
  name = changedGUI._title;
  for (const folder of gui.folders) {
    if (folder._title !== name) {
      folder.close();
    }
  }

  if (name !== lastName) {
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
            .name("uFrequencyZ");
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
        material.vertexShader = waterVertexShader;
        material.fragmentShader = waterFragmentShader;

        const debugObject = {
          depthColor: "#3f78d5",
          surfaceColor: "#a3d2f0",
        };

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
      default:
        console.log(`Select a folder`);
    }

    material.needsUpdate = true;
    lastName = name;
  }
});

const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI * 0.5;
scene.add(mesh);

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
