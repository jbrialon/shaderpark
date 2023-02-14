import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  MeshLine,
  MeshLineGeometry,
  MeshLineMaterial,
} from "@lume/three-meshline";

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
audioLoader.load("/audio/7.mp3", function (buffer) {
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
let geometryShader = new THREE.SphereGeometry(2, 45, 45);
// let material = new MeshBasicMaterial({ color: 0x33aaee });
// let mesh = new Mesh(geometry, material);

let mesh = createSculptureWithGeometry(geometryShader, spCodeTexture(), () => {
  return {
    time: state.time,
    pointerDown: state.pointerDown,
    mouse: state.mouse,
    audio: state.audio,
    _scale: 0.5,
  };
});
console.log("deploy");
// scene.add(mesh);

/**
 * Particles
 */

const parameters = {
  color: "#ff7300",
  linewidth: 10,
};
var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
let geometry = null;
let material = null;
let line = null;
let indexPosition = 0;
let points = [];

const generateLine = () => {
  if (line !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(line);
  }

  geometry = new MeshLineGeometry();
  geometry.setPoints(points);

  material = new MeshLineMaterial({
    useMap: false,
    color: new THREE.Color(parameters.color),
    opacity: 1,
    resolution: resolution,
    sizeAttenuation: false,
    lineWidth: parameters.linewidth,
  });

  // Line
  line = new MeshLine(geometry, material);
  scene.add(line);
};

generateLine();

const addToPosition = (y) => {
  const lastPos = new THREE.Vector3(indexPosition / 500, y, 1);
  points.push(lastPos);
  camera.position.x = indexPosition / 500;
  geometryShader.x = indexPosition / 500;
  parameters.linewidth = Math.max(10, y * 100);
  // camera.rotation.y = 10;
};

const paramFolder = gui.addFolder("Curve generateLine");
paramFolder.addColor(parameters, "color").onFinishChange(generateLine);
paramFolder.add(parameters, "linewidth").onFinishChange(generateLine);

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
    generateLine();
  }

  camera.rotation.x = -0.03645093342527904;
  camera.rotation.y = 0.5617532931037452;
  camera.rotation.z = 0.019422511558217;

  // controls.update();
  renderer.render(scene, camera);
};

render();
