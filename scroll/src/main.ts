import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";

/* Textures */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("/gradients/3.jpg");

gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Base
 */
// Debug
const gui = new GUI();

const parameters = {
  color: "#579dff",
  objectDistance: 4,
};

gui.addColor(parameters, "color").onChange(() => {
  material.color.set(parameters.color);
  particlesMaterial.color.set(parameters.color);
});

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas element not found.");
}
// Scene
const scene = new THREE.Scene();

/* Objects */
const material = new THREE.MeshToonMaterial({
  color: parameters.color,
  gradientMap: gradientTexture,
});

const section = new THREE.Group();
scene.add(section);

const torus = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
torus.position.x = 2;

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
torusKnot.position.x = -2;
torusKnot.position.y = -parameters.objectDistance * 1;

const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
cone.position.y = -parameters.objectDistance * 2;
cone.position.x = 2;

section.add(torus, torusKnot, cone);

/* Particles */
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3;
  positions[i3] = (Math.random() - 0.5) * 10;
  positions[i3 + 1] =
    parameters.objectDistance * 0.5 -
    Math.random() * parameters.objectDistance * section.children.length;
  positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.color,
  sizeAttenuation: true,
  size: 0.02,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/* Light */
const directionalLight = new THREE.DirectionalLight("white", 2);
directionalLight.position.set(1, 1, 0);
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
camera.position.z = 3;
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* Scroll */
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(section.children[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
    });
  }
});

/* Cursor */
const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (e: MouseEvent) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastTime;
  lastTime = elapsedTime;

  // Update objects
  for (const mesh of section.children) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.13;
  }

  // Update camera
  camera.position.y = (-scrollY / sizes.height) * parameters.objectDistance;
  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 2 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 2 * deltaTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
