import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
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

/* Models */
const gltfLoader = new GLTFLoader();

let model: THREE.Object3D<THREE.Object3DEventMap> | null = null;
gltfLoader.load("/models/Duck/glTF-Binary/Duck.glb", (gltf) => {
  model = gltf.scene;
  scene.add(model);
});

// Objects
const objectGroup = new THREE.Group();

const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "red" })
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "red" })
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "red" })
);
object3.position.x = 2;

objectGroup.add(object1, object2, object3);
scene.add(objectGroup);

/* Lighting */
const ambientLight = new THREE.AmbientLight("white", 0.6);
scene.add(ambientLight);

/* Raycaster */
const raycaster = new THREE.Raycaster();

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
camera.position.y = 2;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas as HTMLElement);
controls.enableDamping = true;

/* Cursor */
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event: MouseEvent) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -((event.clientY / sizes.height) * 2 - 1);
});

window.addEventListener("click", () => {
  if (currentIntersect) {
    console.log("click on an object");
  }
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastTime = 0;

// Witness variable
let currentIntersect: THREE.Intersection<
  THREE.Object3D<THREE.Object3DEventMap>
> | null = null;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastTime;
  lastTime = elapsedTime;

  // Animate objects
  object1.position.y = Math.sin(elapsedTime) * 1.5;
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
  object3.position.y = Math.sin(elapsedTime * 1.5) * 1.5;

  // Cast ray
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objectGroup.children);
  for (const object of objectGroup.children) {
    if (
      object instanceof THREE.Mesh &&
      object.material instanceof THREE.MeshBasicMaterial
    ) {
      object.material.color.set("#ff0000");
    }
  }

  for (const intersect of intersects) {
    if (
      intersect.object instanceof THREE.Mesh &&
      intersect.object.material instanceof THREE.MeshBasicMaterial
    )
      intersect.object.material.color.set("#0000ff");
  }

  if (intersects.length) {
    if (!currentIntersect) {
      console.log("mouse enter");
    }
    currentIntersect = intersects[0];
  } else {
    if (currentIntersect) {
      console.log("mouse leave");
    }
    currentIntersect = null;
  }

  if (model) {
    const modelIntersects = raycaster.intersectObject(model);

    if (modelIntersects.length) {
      model.scale.set(1.5, 1.5, 1.5);
    } else {
      model.scale.set(1, 1, 1);
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
