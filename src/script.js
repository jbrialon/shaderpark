import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSculptureWithGeometry } from "https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js";
import { spCodeTexture, spCodeSphere } from "/sp-code.js";

import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1.2;

let renderer = new THREE.WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(new THREE.Color(1, 1, 1), 0);
document.body.appendChild(renderer.domElement);

let clock = new THREE.Clock();

let button = document.querySelector(".button");
button.innerHTML = "Loading Audio...";

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// create an Audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load("/audio/3.wav", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);

  button.innerHTML = "Play Audio";

  button.addEventListener("pointerdown", () => {
    button.style.display = "none";
    sound.play();
  });
});

// create an AudioAnalyser, passing in the sound and desired fftSize
const analyser = new THREE.AudioAnalyser(sound, 32);
console.log(analyser);
// get the average frequency of the sound
const data = analyser.getAverageFrequency();
let state = {
  mouse: new THREE.Vector3(),
  currMouse: new THREE.Vector3(),
  pointerDown: 0.0,
  currPointerDown: 0.0,
  size: 0.5,
  audio: 0.0,
  currAudio: 0.0,
  time: 0.0,
};

// create our geometry and material
//let geometry = new SphereGeometry(2, 45, 45);
// let material = new MeshBasicMaterial({ color: 0x33aaee });
// let mesh = new Mesh(geometry, material);

// let mesh = createSculptureWithGeometry(geometry, spCodeTexture(), () => {
//   return {
//     time: state.time,
//     pointerDown: state.pointerDown,
//     mouse: state.mouse,
//     audio: state.audio,
//     _scale: 0.5,
//   };
// });

// scene.add(mesh);

/**
 * Particles
 */

const parameters = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff7300",
  outsideColor: "#ffffff",
};

let geometry = null;
let material = null;
let points = null;
let indexPosition = 0;
let positions = new Float32Array(3000 * 3 * 3);

const generatePoints = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  // const positions = new Float32Array(parameters.count * 3 * 3);
  const colorsArray = new Float32Array(parameters.count * 3 * 3);

  // for (let index = 0; index < parameters.count * 3 * 3; index++) {
  //   const i3 = index * 3;

  //   positions[i3 + 0] = index / 100; // AXE X
  //   positions[i3 + 1] = Math.sin(index / 100, 3); // AXE Y
  //   positions[i3 + 2] = 1; // AYE Z
  // }
  const positionsAttribute = new THREE.BufferAttribute(positions, 3);

  geometry.setAttribute("position", positionsAttribute);

  material = new THREE.PointsMaterial({
    size: 0.01,
    sizeAttenuation: true,
    transparent: true,
    // color: '#ff88cc',
    // alphaTest: 0.001,
    // depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  // Points
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generatePoints();

const addToPosition = (y) => {
  const index = indexPosition;
  const i3 = index * 3;

  positions[i3 + 0] = index / 500; // AXE X
  positions[i3 + 1] = y; // AXE Y
  positions[i3 + 2] = 1; // AYE Z
};

const paramFolder = gui.addFolder("Curve generatePoints");
paramFolder
  .add(parameters, "count", 0, 1000000, 100)
  .onFinishChange(generatePoints);
paramFolder
  .add(parameters, "size", 0.001, 0.1, 0.001)
  .onFinishChange(generatePoints);
paramFolder
  .add(parameters, "radius", 0.01, 20, 0.01)
  .onFinishChange(generatePoints);
paramFolder
  .add(parameters, "branches", 2, 20, 1)
  .onFinishChange(generatePoints);
paramFolder.add(parameters, "spin", -5, 5, 1).onFinishChange(generatePoints);
paramFolder
  .add(parameters, "randomness", 0, 2, 0.01)
  .onFinishChange(generatePoints);
paramFolder
  .add(parameters, "randomnessPower", 1, 10, 1)
  .onFinishChange(generatePoints);
paramFolder.addColor(parameters, "insideColor").onFinishChange(generatePoints);
paramFolder.addColor(parameters, "outsideColor").onFinishChange(generatePoints);

window.addEventListener(
  "pointermove",
  (event) => {
    state.currMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    state.currMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  },
  false
);

window.addEventListener(
  "pointerdown",
  (event) => (state.currPointerDown = 1.0),
  false
);
window.addEventListener(
  "pointerup",
  (event) => (state.currPointerDown = 0.0),
  false
);

// Add mouse controlls
let controls = new OrbitControls(camera, renderer.domElement, {
  enableDamping: true,
  dampingFactor: 0.25,
  zoomSpeed: 0.5,
  rotateSpeed: 0.5,
});

let onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", onWindowResize);

let render = () => {
  requestAnimationFrame(render);
  state.time += clock.getDelta();
  state.pointerDown = 0.1 * state.currPointerDown + 0.9 * state.pointerDown;
  state.mouse.lerp(state.currMouse, 0.05);

  let analysis = Math.pow((analyser.getFrequencyData()[2] / 255) * 0.85, 8);
  state.currAudio += analysis + clock.getDelta() * 0.5;
  state.audio = 0.2 * state.currAudio + 0.8 * state.audio;

  if (analysis) {
    indexPosition++;
    addToPosition(analysis);
    generatePoints();
  }
  controls.update();
  renderer.render(scene, camera);
};

render();
