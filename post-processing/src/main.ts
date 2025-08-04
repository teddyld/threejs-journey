import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  DotScreenPass,
  EffectComposer,
  GlitchPass,
  RenderPass,
  RGBShiftShader,
  GammaCorrectionShader,
  ShaderPass,
  SMAAPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

import tintVertexShader from "./shaders/tint/vertex.glsl";
import tintFragmentShader from "./shaders/tint/fragment.glsl";
import displacementVertexShader from "./shaders/displacement/vertex.glsl";
import displacementFragmentShader from "./shaders/displacement/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("No canvas");
}

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMapIntensity = 2.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(2, 2, 2);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

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

  // Update effect composer
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas as HTMLElement);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Post processing
 */
// Render target
const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  samples: renderer.getPixelRatio() === 1 ? 2 : 0,
});

const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

gui.add(dotScreenPass, "enabled").name("dotScreenPass");

const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

gui.add(glitchPass, "enabled").name("glitchPass");

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

gui.add(rgbShiftPass, "enabled").name("rgbShiftPass");

const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(1920, 1080),
  0.3,
  1,
  0.6
);
unrealBloomPass.enabled = false;
effectComposer.addPass(unrealBloomPass);

gui.add(unrealBloomPass, "enabled").name("unrealBloomPass");
gui.add(unrealBloomPass, "strength").min(0).max(2).step(0.001);
gui.add(unrealBloomPass, "radius").min(0).max(2).step(0.001);
gui.add(unrealBloomPass, "threshold").min(0).max(1).step(0.001);

const DisplacementShader = {
  uniforms: {
    tDiffuse: new THREE.Uniform(null),
    uNormalMap: new THREE.Uniform(null),
  },
  vertexShader: displacementVertexShader,
  fragmentShader: displacementFragmentShader,
};

const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.enabled = false;
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load(
  "/textures/interfaceNormalMap.png"
);
effectComposer.addPass(displacementPass);

gui.add(displacementPass, "enabled").name("displacementPass");

const TintShader = {
  uniforms: {
    tDiffuse: new THREE.Uniform(null),
    uTint: new THREE.Uniform(null),
  },
  vertexShader: tintVertexShader,
  fragmentShader: tintFragmentShader,
};

const tintPass = new ShaderPass(TintShader);
tintPass.enabled = false;
tintPass.material.uniforms.uTint.value = new THREE.Vector3();
effectComposer.addPass(tintPass);

gui.add(tintPass, "enabled").name("tintPass");

gui
  .add(tintPass.material.uniforms.uTint.value, "x")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("red");
gui
  .add(tintPass.material.uniforms.uTint.value, "y")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("green");
gui
  .add(tintPass.material.uniforms.uTint.value, "z")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("blue");

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionPass);

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
  const smaaPass = new SMAAPass();
  effectComposer.addPass(smaaPass);
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  // renderer.render(scene, camera);
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
