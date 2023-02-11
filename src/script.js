import {
  Scene,
  SphereGeometry,
  Vector3,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  MeshBasicMaterial,
  Mesh,
  Clock,
  AudioListener,
  Audio,
  AudioLoader,
  AudioAnalyser,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSculptureWithGeometry } from "https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js";
import { spCodeTexture, spCodeSphere } from "/sp-code.js";

let scene = new Scene();

let camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 1.4;

let renderer = new WebGLRenderer({ antialias: true, transparent: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(new Color(1, 1, 1), 0);
document.body.appendChild(renderer.domElement);

let clock = new Clock();

let button = document.querySelector(".button");
button.innerHTML = "Loading Audio...";

// create an AudioListener and add it to the camera
const listener = new AudioListener();
camera.add(listener);

// create an Audio source
const sound = new Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new AudioLoader();
audioLoader.load("/audio/5.mp3", function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);

  button.innerHTML = "Play Audio";

  button.addEventListener("pointerdown", () => {
    button.style.display = "none";
    sound.play();
  });
  // sound.play();
});

// create an AudioAnalyser, passing in the sound and desired fftSize
const analyser = new AudioAnalyser(sound, 32);

// get the average frequency of the sound
const data = analyser.getAverageFrequency();

let state = {
  mouse: new Vector3(),
  currMouse: new Vector3(),
  pointerDown: 0.0,
  currPointerDown: 0.0,
  size: 0.5,
  audio: 0.0,
  currAudio: 0.0,
  time: 0.0,
};

// create our geometry and material
let geometry = new SphereGeometry(2, 45, 45);
// let material = new MeshBasicMaterial({ color: 0x33aaee });
// let mesh = new Mesh(geometry, material);

let mesh = createSculptureWithGeometry(geometry, spCodeSphere(), () => {
  return {
    time: state.time,
    pointerDown: state.pointerDown,
    mouse: state.mouse,
    audio: state.audio,
    _scale: 1.2,
  };
});

scene.add(mesh);

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

  let analysis = Math.pow((analyser.getFrequencyData()[2] / 255) * 0.95, 8);
  state.currAudio += analysis + clock.getDelta() * 0.5;
  state.audio = 0.2 * state.currAudio + 0.8 * state.audio;

  controls.update();
  renderer.render(scene, camera);
};

render();
