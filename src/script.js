import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Canvas
const canvas = document.querySelector('canvas');

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

camera.position.z = 3; // Pull the camera back a bit, if not you cannot see
scene.add(camera);

/// point light
const pointLight = new THREE.PointLight(0xffffff, 2.55);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

/// spot light at back
const spotLight_1 = new THREE.SpotLight( 0xff66ff, 1 );
spotLight_1.position.set( 10, 40, -30 );

spotLight_1.castShadow = false;

spotLight_1.shadow.mapSize.width = 1024;
spotLight_1.shadow.mapSize.height = 1024;

spotLight_1.shadow.camera.near = 500;
spotLight_1.shadow.camera.far = 4000;
spotLight_1.shadow.camera.fov = 30;

scene.add( spotLight_1 );

/// spot light at left
const spotLight_2 = new THREE.SpotLight( 0x00e6b8 , 0.5);
spotLight_2.position.set( -15, -5, 5 );

spotLight_2.castShadow = false;

spotLight_2.shadow.mapSize.width = 720;
spotLight_2.shadow.mapSize.height = 720;

spotLight_2.shadow.camera.near = 500;
spotLight_2.shadow.camera.far = 4000;
spotLight_2.shadow.camera.fov = 30;

scene.add( spotLight_2 );

// star reflection
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRndIntegerZ(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
//

function returnFloatAOrB(a, b, condition) {
  if (condition) {
      return a;
  } else {
      return b;
  }
}

for (let i = 0; i < 10; i++) {
  const isTrue = i % 2 === 1; // isTrue lần lượt là true, false, true, false, ...
  const pointLight = new THREE.PointLight(0xffffff, returnFloatAOrB(0.001, 0.0003, isTrue));
  pointLight.position.set(getRndInteger(-50, 50), getRndInteger(-50, 50), getRndIntegerZ(5,30));
  scene.add(pointLight);
}


// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // Set to true is used to give a sense of weight to the controls

// Particles
// Star particles
// Star particles
const particlesCount = 300; // Increased number of particles
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3;
  const distanceFromMars = Math.random() * 10000 + 30000;
  const angle = Math.random() * Math.PI * 2;
  const separation = 1000; // Adjust this value for the desired separation distance

  const x = Math.cos(angle) * distanceFromMars;
  const y = Math.sin(angle) * distanceFromMars;
  const z = (Math.random() - 0.5) * separation;

  positions[i3] = x;
  positions[i3 + 1] = y;
  positions[i3 + 2] = z;
}

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 1,
  sizeAttenuation: true,
  map: new THREE.TextureLoader().load('/textures/particles/star.png'),
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const starParticles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(starParticles);

const vertices = new Float32Array(particlesCount); // Float32Array is an array of 32-bit floats. This is used to represent an array of vertices. (we have 3 values for each vertex - coordinates x, y, z)

// Loop through all the vertices and set their random position
for (let i = 0; i < particlesCount; i++) {
  vertices[i] = (Math.random() - 0.5) * 300; // -0.5 to get the range from -0.5 to 0.5 than * 100 to get a range from -50 to 50
}

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(vertices, 3) // 3 values for each vertex (x, y, z)
);



const stars = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(stars);
//Import 3D Mars
let loadedModelMars;
const marsLoader = new GLTFLoader();
marsLoader.load('/mars_the_red_planet_free.glb', (gltf) => {
  console.log('MARS HERE', gltf);
  const mars = gltf.scene;
  loadedModelMars = mars;
  mars.position.set(0, 0, 0);
  mars.scale.set(2, 2, 2);
  scene.add(mars);
});

//Import Deimos Model
let loadedModelDeimos;
const deimosLoader = new GLTFLoader();
deimosLoader.load('/deimos.glb', (gltf) => {
  const deimos = gltf.scene;
  loadedModelDeimos = deimos;
  deimos.scale.set(0.001, 0.001, 0.001); // Adjust the scale of Deimos
  scene.add(deimos);
  // Set initial position of Deimos relative to Mars
  const radius = 100; // Increase the radius to make the orbit larger
  const angle = Math.random() * Math.PI * 2; // Randomize the initial angle

  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  deimos.position.set(x, 0, z);
});
// Import the astronaut 3D model
let loadedModelAstronaut;
let mixer;
const gltfLoader = new GLTFLoader(); // Create a loader
gltfLoader.load('/scene.glb', (gltf) => {
  console.log('success');
  console.log('ASTRONAULT HERE', gltf);

  const astronault = gltf.scene;
  loadedModelAstronaut = astronault;
  astronault.position.set(40, 0, 0);
  astronault.scale.set(4 , 4, 4);


});

////
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);


// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas, // canvas is the canvas element from the html
});

const clock = new THREE.Clock();
function animated_astronaut(){
  if(mixer)
    mixer.update(clock.getDelta());
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animated_astronaut)

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // to avoid picelation on high resolution screenss
// Animation function for Mars rotation and Deimos orbit
const orbitRadius = 20;
const animate_planet = () => {
  if (loadedModelMars) {
    loadedModelMars.rotation.y += 0.001; // Adjust the rotation speed of Mars
  }

  if (loadedModelDeimos && loadedModelMars) {
    const speed = 0.06; // Adjust the speed of Deimos' rotation

    const angle = speed * Date.now() * 0.001; // Calculate the angle based on time

    // Calculate the new position of Deimos based on the angle and orbit radius
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;

    loadedModelDeimos.position.x = loadedModelMars.position.x + x;
    loadedModelDeimos.position.z = loadedModelMars.position.z + z;
    loadedModelDeimos.rotation.y = -angle + Math.PI / 2; // Adjust the rotation to align Deimos with the orbit
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate_planet);
};

animate_planet();

// Animate Astronaut
const animate_Astronaut = () => {
  if (loadedModelAstronaut) {
    loadedModelAstronaut.rotation.x += 0.00;
    loadedModelAstronaut.rotation.y += 0.00;
    loadedModelAstronaut.rotation.z += 0.00;
  }
  requestAnimationFrame(animate_Astronaut);
};
animate_Astronaut();

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 50, 0);
scene.add(directionalLight);


// Animate star
const animate = () => {
  // Update the controls
  controls.update();
  if (loadedModelAstronaut) {
    loadedModelAstronaut.rotation.y += 0.001; // Adjust the rotation speed of the scene.glb model as per your requirement
  }
  // Rotate a bit the stars
  stars.rotation.y += -0.01;

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
};
animate_planet();
