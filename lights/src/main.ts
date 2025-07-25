import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

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

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight();
ambientLight.color = new THREE.Color(0xffffff);
ambientLight.intensity = 1;
scene.add(ambientLight);
const ambientLightFolder = gui.addFolder("ambientLight");
ambientLightFolder.add(ambientLight, "intensity").min(0).max(3).step(0.001);
ambientLightFolder.addColor(ambientLight, "color");

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.9);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);
const directionalLightFolder = gui.addFolder("directionalLight");
directionalLightFolder
  .add(directionalLight, "intensity")
  .min(0)
  .max(3)
  .step(0.001);
directionalLightFolder.addColor(directionalLight, "color");

const pointLight = new THREE.PointLight(0xff9000, 1.5, 3);
pointLight.position.x = 1;
pointLight.position.y = -0.5;
pointLight.position.z = 1;
scene.add(pointLight);
const pointLightFolder = gui.addFolder("pointLight");
pointLightFolder.add(pointLight.position, "x").min(-3).max(3).step(0.01);
pointLightFolder.add(pointLight.position, "y").min(-3).max(3).step(0.01);
pointLightFolder.add(pointLight.position, "z").min(-3).max(3).step(0.01);
pointLightFolder.add(pointLight, "distance").min(0).max(10).step(0.01);
pointLightFolder.add(pointLight, "intensity").min(0).max(3).step(0.001);
pointLightFolder.addColor(pointLight, "color");

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.9);
const hemisphereFolder = gui.addFolder("hemisphereLight");
hemisphereFolder.add(hemisphereLight, "intensity").min(0).max(3).step(0.001);
scene.add(hemisphereLight);

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 6, 1, 1);
rectAreaLight.position.y = 1;
rectAreaLight.position.z = 1.5;
rectAreaLight.lookAt(new THREE.Vector3());
const rectFolder = gui.addFolder("rectAreaLight");
rectFolder.add(rectAreaLight, "intensity").min(0).max(3).step(0.001);
rectFolder.addColor(rectAreaLight, "color");
scene.add(rectAreaLight);

const spotLight = new THREE.SpotLight(
  0x78ff00,
  4.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
const spotLightFolder = gui.addFolder("spotLight");
spotLightFolder.add(spotLight, "intensity").min(0).max(3).step(0.001);
spotLightFolder.addColor(spotLight, "color");
spotLightFolder.add(spotLight, "distance").min(0).max(10).step(0.001);
spotLightFolder.add(spotLight, "penumbra").min(0).max(3).step(0.001);
spotLightFolder.add(spotLight, "decay").min(0).max(3).step(0.001);
scene.add(spotLight);

spotLight.target.position.x = -0.75;
scene.add(spotLight.target);

/* Helpers */
const hemisphereLightHelper = new THREE.HemisphereLightHelper(
  hemisphereLight,
  0.2
);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

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

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
