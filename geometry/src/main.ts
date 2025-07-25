import * as THREE from "three";
import {
  OrbitControls,
  RGBELoader,
  FontLoader,
  Font,
  TextGeometry,
} from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

/* Debug */
const gui = new GUI({
  width: 300,
  title: "Debug UI",
  closeFolders: false,
});
const tweaks = gui.addFolder("Tweaks");

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "h") gui.show(gui._hidden);
});

/* Sizes */
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

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

/* Cursor */
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e: MouseEvent) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = -(e.clientY / sizes.height - 0.5);
});

/* Canvas */
const canvas = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("Canvas element not found.");
}

/* Scene */
const scene = new THREE.Scene();

/* Textures */
const loadingManager = new THREE.LoadingManager();
loadingManager.onError = () => {
  console.log("loading error");
};
const textureLoader = new THREE.TextureLoader(loadingManager);

const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
doorColorTexture.colorSpace = THREE.SRGBColorSpace;
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "/textures/door/ambientOcclusion.jpg"
);
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");

const matcapTexture = textureLoader.load("/textures/matcaps/8.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");

/* Fonts */
const fontLoader = new FontLoader();
fontLoader.load("fonts/helvetiker_regular.typeface.json", (font: Font) => {
  const textGeometry = new TextGeometry("Vincent Pham", {
    font: font,
    size: 0.5,
    depth: 0.2,
    curveSegments: 5,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 4,
  });
  // textGeometry.computeBoundingBox();
  // if (textGeometry.boundingBox) {
  //   textGeometry.translate(
  //     -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
  //     -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
  //     -(textGeometry.boundingBox.max.z - 0.03) * 0.5
  //   );
  // }
  textGeometry.center();

  const material = new THREE.MeshMatcapMaterial();
  material.matcap = matcapTexture;
  const text = new THREE.Mesh(textGeometry, material);
  scene.add(text);

  const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

  for (let i = 0; i < 100; i++) {
    const donut = new THREE.Mesh(donutGeometry, material);

    donut.position.x = (Math.random() - 0.5) * 10;
    donut.position.y = (Math.random() - 0.5) * 10;
    donut.position.z = (Math.random() - 0.5) * 10;

    donut.rotation.x = Math.random() * Math.PI;
    donut.rotation.y = Math.random() * Math.PI;

    const scale = Math.random();
    donut.scale.set(scale, scale, scale);

    scene.add(donut);
  }
});

/* Axes */
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

/* Objects */
// MeshBasicMaterial
// const material = new THREE.MeshBasicMaterial();
// material.map = doorColorTexture;
// material.color = new THREE.Color("white");
// material.wireframe = false;
// material.transparent = true;
// material.opacity = 1.0;

// MeshNormalMaterial
// const material = new THREE.MeshNormalMaterial();
// material.flatShading = true;

// MeshMatcapMaterial
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// MeshDepthMaterial
// const material = new THREE.MeshDepthMaterial();

// MeshLambertMaterial
// const material = new THREE.MeshLambertMaterial();

// MeshPhongMaterial
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 100;
// material.specular = new THREE.Color(0x1188ff);

// MeshToonMaterial
// const material = new THREE.MeshToonMaterial();
// material.gradientMap = gradientTexture;
// gradientTexture.generateMipmaps = false;
// gradientTexture.minFilter = THREE.NearestFilter;
// gradientTexture.magFilter = THREE.NearestFilter;

// MeshStandardMaterial
// const material = new THREE.MeshStandardMaterial();
// material.metalness = 1;
// material.roughness = 1;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(0.5, 0.5);
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;

// MeshPhysicalMaterial
const material = new THREE.MeshPhysicalMaterial();
material.metalness = 1;
material.roughness = 1;
material.map = doorColorTexture;
material.aoMap = doorAmbientOcclusionTexture;
material.aoMapIntensity = 1;
material.displacementMap = doorHeightTexture;
material.displacementScale = 0.1;
material.metalnessMap = doorMetalnessTexture;
material.roughnessMap = doorRoughnessTexture;
material.normalMap = doorNormalTexture;
material.normalScale.set(0.5, 0.5);
material.transparent = true;
material.alphaMap = doorAlphaTexture;

// Clearcoat
// material.clearcoat = 1;
// material.clearcoatRoughness = 0;
// tweaks.add(material, "clearcoat").min(0).max(1).step(0.001);
// tweaks.add(material, "clearcoatRoughness").min(0).max(1).step(0.001);

// Sheen
// material.sheen = 1;
// material.sheenRoughness = 0.25;
// material.sheenColor.set(1, 1, 1);
// tweaks.add(material, "sheen").min(0).max(1).step(0.001);
// tweaks.add(material, "sheenRoughness").min(0).max(1).step(0.001);
// tweaks.addColor(material, "sheenColor");

// Iridescence
// material.iridescence = 1;
// material.iridescenceIOR = 1;
// material.iridescenceThicknessRange = [100, 800];
// tweaks.add(material, "iridescence").min(0).max(1).step(0.001);
// tweaks.add(material, "iridescenceIOR").min(1).max(2.33).step(0.001);
// tweaks.add(material.iridescenceThicknessRange, "0").min(1).max(1000).step(1);
// tweaks.add(material.iridescenceThicknessRange, "1").min(1).max(1000).step(1);

// Transmission
// material.transmission = 1;
// material.ior = 1.5;
// material.thickness = 0.5;
// tweaks.add(material, "transmission").min(0).max(1).step(0.001);
// tweaks.add(material, "ior").min(1).max(10).step(1);
// tweaks.add(material, "thickness").min(0).max(1).step(0.001);

tweaks.add(material, "metalness").min(0).max(1).step(0.01);
tweaks.add(material, "roughness").min(0).max(1).step(0.01);
tweaks.add(material, "aoMapIntensity").min(0).max(1).step(0.01);
tweaks.add(material, "displacementScale").min(0).max(1).step(0.01);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
plane.position.x = -1.5;

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 64, 128),
  material
);
torus.position.x = 1.5;

// scene.add(plane, sphere, torus);

tweaks.add(material, "wireframe");
// tweaks.addColor(material, "color").onChange(() => {
//   material.color.set(debugObject.color);
// });
tweaks.add(material, "side").options({
  FrontSide: THREE.FrontSide,
  BackSide: THREE.BackSide,
  DoubleSide: THREE.DoubleSide,
});

/* Lights */
// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// scene.add(ambientLight);

// const pointLight = new THREE.PointLight(0xffffff, 30);
// pointLight.position.x = 2;
// pointLight.position.x = 3;
// pointLight.position.x = 4;
// scene.add(pointLight);

/* Environment Map */
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "/textures/environmentMap/2k.hdr",
  (environmentMap: THREE.DataTexture) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = environmentMap;
    scene.environment = environmentMap;
  }
);

/* Camera */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.z = 3;
scene.add(camera);

/* Controls */
const controls = new OrbitControls(camera, canvas as HTMLElement);
controls.enableDamping = true;

/* Renderer */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Clock
const clock = new THREE.Clock();

// Animations
let lastTime = 0;

const tick = () => {
  // Time
  const curentTime = Date.now();
  const deltaTime = curentTime - lastTime;
  lastTime = curentTime;
  const elapsedTime = clock.getElapsedTime();

  sphere.rotation.y = 0.1 * elapsedTime;
  plane.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = -0.15 * elapsedTime;
  plane.rotation.x = -0.15 * elapsedTime;
  torus.rotation.x = -0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
