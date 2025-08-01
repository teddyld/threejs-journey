import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader, DRACOLoader } from "three/examples/jsm/Addons.js";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

import particlesVertexShader from "./shaders/particles/particlesVertex.glsl";
import particlesFragmentShader from "./shaders/particles/particlesFragment.glsl";
import gpgpuShader from "./shaders/gpgpu/particles.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas element not found.");
}

// Scene
const scene = new THREE.Scene();

/* Models */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const gltf = await gltfLoader.loadAsync("/model.glb");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  if (particles.material) {
    particles.material.uniforms.uResolution.value.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    );
  }

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

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
camera.position.set(4.5, 4, 11);
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
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Particles
 */

// Base Geometry
const geometry = (gltf.scene.children[0] as THREE.Mesh).geometry;
const count = geometry.attributes.position.count;

const baseGeometry = {
  geometry,
  count,
};

const size = Math.ceil(Math.sqrt(baseGeometry.count));

const gpgpu: Record<string, any> = {
  size,
  computation: new GPUComputationRenderer(size, size, renderer),
};

const baseParticlesTexture = gpgpu.computation.createTexture();

for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3;
  const i4 = i * 4;

  const data = baseParticlesTexture.image.data as Float32Array;

  // Positions
  data[i4 + 0] = baseGeometry.geometry.attributes.position.array[i3 + 0];
  data[i4 + 1] = baseGeometry.geometry.attributes.position.array[i3 + 1];
  data[i4 + 2] = baseGeometry.geometry.attributes.position.array[i3 + 2];
  // Decay
  data[i4 + 3] = Math.random();
}

gpgpu.particlesVariable = gpgpu.computation.addVariable(
  "uParticles",
  gpgpuShader,
  baseParticlesTexture
);
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
]);

// Uniforms
gpgpu.particlesVariable.material.uniforms = {
  uTime: { value: 0 },
  uBase: { value: baseParticlesTexture },
  uDeltaTime: { value: 0 },
  uFlowfieldInfluence: { value: 0.5 },
  uFlowfieldStrength: { value: 2 },
  uFlowfieldFrequency: { value: 0.5 },
};

// Tweaks
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowfieldInfluence, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uFlowfieldInfluence");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowfieldStrength, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uFlowfieldStrength");
gui
  .add(gpgpu.particlesVariable.material.uniforms.uFlowfieldFrequency, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uFlowfieldFrequency");

gpgpu.particlesVariable.material.uniforms.value = gpgpu.computation.init();
gpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({
    map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
      .texture,
  })
);
gpgpu.debug.position.set(3, 0, 0);
// scene.add(gpgpu.debug);

const particles: {
  geometry?: THREE.BufferGeometry;
  material?: THREE.ShaderMaterial;
  points?: THREE.Points;
} = {};

const particlesUvArray = new Float32Array(baseGeometry.count * 2);
const sizesArray = new Float32Array(baseGeometry.count);

for (let y = 0; y < gpgpu.size; y++) {
  for (let x = 0; x < gpgpu.size; x++) {
    const i = y * gpgpu.size + x;
    const i2 = i * 2;

    const uvX = (x + 0.5) / gpgpu.size;
    const uvY = (y + 0.5) / gpgpu.size;

    particlesUvArray[i2 + 0] = uvX;
    particlesUvArray[i2 + 1] = uvY;
    sizesArray[i] = Math.random();
  }
}

particles.geometry = new THREE.BufferGeometry();
particles.geometry.setDrawRange(0, baseGeometry.count);
particles.geometry.setAttribute(
  "aParticlesUv",
  new THREE.BufferAttribute(particlesUvArray, 2)
);
particles.geometry.setAttribute(
  "aSize",
  new THREE.BufferAttribute(sizesArray, 1)
);
particles.geometry.setAttribute(
  "aColor",
  baseGeometry.geometry.attributes.color
);

particles.material = new THREE.ShaderMaterial({
  vertexShader: particlesVertexShader,
  fragmentShader: particlesFragmentShader,
  uniforms: {
    uSize: { value: 0.05 },
    uResolution: {
      value: new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio
      ),
    },
    uParticlesTexture: new THREE.Uniform(null),
  },
});

particles.points = new THREE.Points(particles.geometry, particles.material);
scene.add(particles.points);

/**
 * Animate
 */
const clock = new THREE.Clock();
let prevTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  // Update controls
  controls.update();

  // GPGPU update
  gpgpu.particlesVariable.material.uniforms.uTime.value = elapsedTime;
  gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime;

  gpgpu.computation.compute();
  particles.material!.uniforms.uParticlesTexture.value =
    gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable!).texture;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
