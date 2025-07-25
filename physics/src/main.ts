import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";

/*  Sounds */
const hitSound = new Audio("/sounds/hit.mp3");
const playHitSound = (collision: any) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();
  if (impactStrength > 1.5) {
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
};

/* Physics */
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

// Materials
const defaultMaterial = new CANNON.Material("default");

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  { friction: 0.1, restitution: 0.7 }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
floorBody.addShape(floorShape);
world.addBody(floorBody);

/**
 * Base
 */
// Debug
const gui = new GUI();

const debugObject: { [key: string]: any } = {};
debugObject.createSphere = () => {
  createSphere(
    Math.random() * 0.5,
    new CANNON.Vec3((Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 3)
  );
};
gui.add(debugObject, "createSphere");

debugObject.createBox = () => {
  createBox(
    Math.random(),
    Math.random(),
    Math.random(),
    new CANNON.Vec3((Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 3)
  );
};
gui.add(debugObject, "createBox");

debugObject.reset = () => {
  for (const object of sphereObjects) {
    object.body.removeEventListener("collide", playHitSound);
    world.removeBody(object.body);
    scene.remove(object.mesh);
  }

  sphereObjects.splice(0, sphereObjects.length);

  for (const object of boxObjects) {
    object.body.removeEventListener("collide", playHitSound);
    world.removeBody(object.body);
    scene.remove(object.mesh);
  }

  boxObjects.splice(0, boxObjects.length);
};
gui.add(debugObject, "reset");

// Canvas
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas element not found.");
}
// Scene
const scene = new THREE.Scene();

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial()
);
floor.rotation.x = -Math.PI * 0.5;

scene.add(floor);

/* Light */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/* Shadows */
floor.receiveShadow = true;
directionalLight.castShadow = true;

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

const sphereObjects: {
  mesh: THREE.Mesh<
    THREE.SphereGeometry,
    THREE.MeshStandardMaterial,
    THREE.Object3DEventMap
  >;
  body: CANNON.Body;
}[] = [];

const boxObjects: {
  mesh: THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshStandardMaterial,
    THREE.Object3DEventMap
  >;
  body: CANNON.Body;
}[] = [];

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
});

const createSphere = (radius: number, position: CANNON.Vec3) => {
  // Threejs mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannonjs body
  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  body.addEventListener("collide", playHitSound);
  world.addBody(body);

  // Save in objects to update
  sphereObjects.push({ mesh, body });
};

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
});

const createBox = (
  width: number,
  height: number,
  depth: number,
  position: CANNON.Vec3
) => {
  // Threejs mesh
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannonjs body
  const shape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  );
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  body.addEventListener("collide", playHitSound);
  world.addBody(body);

  // Save in objects to update
  boxObjects.push({ mesh, body });
};

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastTime;
  lastTime = elapsedTime;

  // Update physics world
  world.step(1 / 60, deltaTime, 3);

  for (const sphere of sphereObjects) {
    sphere.mesh.position.copy(sphere.body.position);
  }

  for (const box of boxObjects) {
    box.mesh.position.copy(box.body.position);
    box.mesh.quaternion.copy(box.body.quaternion);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
