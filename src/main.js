import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ---------------------------------------------------------------------------------
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const cursor = {
  x: 0,
  y: 0,
};

const canvas = document.querySelector("canvas.webgl");

// ---------------------------------------------------------------------------------
function generateScene() {
  return new THREE.Scene();
}

function generateCamera(pov, near, far) {
  return new THREE.PerspectiveCamera(pov, size.width / size.height, near, far);
}

function generateRenderer() {
  return new THREE.WebGLRenderer({
    canvas: canvas,
  });
}

function generateAxesHelper(size) {
  return new THREE.AxesHelper(size);
}

function generateOrbitControls(object) {
  return new OrbitControls(object, canvas);
}

function generateAmbientLight(color, intensity) {
  return new THREE.AmbientLight(color, intensity);
}

// ---------------------------------------------------------------------------------
const scene = generateScene();
const camera = generateCamera(75, 0.01, 1000);
const renderer = generateRenderer();
const axesHelper = generateAxesHelper(1);
const orbit = generateOrbitControls(camera);
orbit.enableDamping = true;
const light = generateAmbientLight(0xffffff, 0.5);
const gui = new dat.GUI();

// ---------------------------------------------------------------------------------
const parameters = {
  count: 5000000,
  size: 0.002,
  radius: 2,
  branches: 5,
  spin: 3,
  randomness: 0.2,
  randomPower: 2,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let geometry,
  galaxyMaterial,
  galaxyMesh = null;

function generateGalaxy() {
  if (galaxyMesh != null) {
    geometry.dispose();
    galaxyMaterial.dispose();
    scene.remove(galaxyMesh);
  }

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  geometry = new THREE.BufferGeometry();

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    const spinAngle = radius * parameters.spin;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    const randomX =
      Math.pow(Math.random(), parameters.randomPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  galaxyMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  galaxyMesh = new THREE.Points(geometry, galaxyMaterial);

  scene.add(galaxyMesh);
}

gui
  .add(parameters, "count")
  .min(100)
  .max(10000000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.0001)
  .max(0.005)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(10)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches")
  .min(3)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0.05)
  .max(1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

// ---------------------------------------------------------------------------------
camera.position.set(1, 1, 1);

scene.add(camera, axesHelper, light);

renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------------------------------------------------------------------------------
// const clock = new THREE.Clock();

window.addEventListener("resize", () => {
  size.height = window.innerHeight;
  size.width = window.innerWidth;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / size.width - 0.5;
  cursor.y = -(event.clientY / size.height - 0.5);
});

function init() {
  orbit.update();
  renderer.render(scene, camera);

  window.requestAnimationFrame(init);
}

generateGalaxy();
init();
