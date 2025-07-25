import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader, RGBELoader } from "three/examples/jsm/Addons.js";
import { GroundedSkybox } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

/* Loaders */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();

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

/* Environment map */
scene.environmentIntensity = 1;
scene.backgroundBlurriness = 0;
scene.backgroundIntensity = 1;
scene.backgroundRotation.y = 0;
scene.environmentRotation.y = 0;

gui.add(scene, "environmentIntensity").min(0).max(10).step(0.001);
gui.add(scene, "backgroundBlurriness").min(0).max(1).step(0.001);
gui.add(scene, "backgroundIntensity").min(0).max(10).step(0.001);
gui
  .add(scene.backgroundRotation, "y")
  .min(0)
  .max(Math.PI * 2)
  .step(0.001)
  .name("backgroundRotationY");
gui
  .add(scene.environmentRotation, "y")
  .min(0)
  .max(Math.PI * 2)
  .step(0.001)
  .name("environmentRotationY");

// LDR cube texture
const environmentMap = cubeTextureLoader.load([
  "/environmentMaps/0/px.png",
  "/environmentMaps/0/nx.png",
  "/environmentMaps/0/py.png",
  "/environmentMaps/0/ny.png",
  "/environmentMaps/0/pz.png",
  "/environmentMaps/0/nz.png",
]);
scene.environment = environmentMap;
scene.background = environmentMap;

// HDR (RGBE) equirectangular
// rgbeLoader.load("/environmentMaps/blender-lights-2k.hdr", (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = environmentMap;
//   scene.background = environmentMap;
// });

// LDR equirectangular
// const environmentMap = textureLoader.load(
//   "/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg"
// );
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// environmentMap.colorSpace = THREE.SRGBColorSpace;
// scene.background = environmentMap;
// scene.environment = environmentMap;

// Ground projected skybox
// rgbeLoader.load("/environmentMaps/2/2k.hdr", (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.environment = environmentMap;

// Skybox
//   const skybox = new GroundedSkybox(environmentMap, 15, 70);
//   skybox.position.y = 15;
//   scene.add(skybox);
// });

/* Real-time environment map */
// const environmentMap = textureLoader.load(
//   "/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg"
// );
// environmentMap.mapping = THREE.EquirectangularReflectionMapping;
// environmentMap.colorSpace = THREE.SRGBColorSpace;
// scene.background = environmentMap;

// Holy donut
const holyDonut = new THREE.Mesh(
  new THREE.TorusGeometry(8, 0.5),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
);
holyDonut.position.y = 3.5;
holyDonut.layers.enable(1);
// scene.add(holyDonut);

// Cube render target
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
});
// scene.environment = cubeRenderTarget.texture;

// Cube camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    roughness: 0,
    metalness: 1,
    color: "grey",
  })
);
torusKnot.position.x = -4;
torusKnot.position.y = 4;
scene.add(torusKnot);

/* Models */
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(10, 10, 10);
  for (const object of gltf.scene.children) {
    object.receiveShadow = true;
    object.castShadow = true;
  }
  scene.add(gltf.scene);
});

/* Lights */
const directionalLight = new THREE.DirectionalLight("white", 6);
directionalLight.position.set(3, 7, 6);
directionalLight.target.position.set(0, 4, 0);
directionalLight.target.updateWorldMatrix(true, true);
scene.add(directionalLight);

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("lightIntensity");
gui
  .add(directionalLight.position, "x")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("lightX");
gui
  .add(directionalLight.position, "y")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("lightY");
gui
  .add(directionalLight.position, "z")
  .min(-10)
  .max(10)
  .step(0.001)
  .name("lightZ");

/* Shadows */
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(512, 512);
gui.add(directionalLight, "castShadow");

const directionalLightHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightHelper.visible = false;
scene.add(directionalLightHelper);

gui
  .add(directionalLightHelper, "visible")
  .name("directionalLightCameraHelperVisible");

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

camera.position.set(4, 5, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas as HTMLElement);
controls.target.y = 3.5;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Tone mapping
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;

gui.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  AcesFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  // Time
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  if (holyDonut) {
    holyDonut.rotation.x = Math.sin(elapsedTime);
    cubeCamera.update(renderer, scene);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
