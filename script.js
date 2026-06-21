import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

const canvas = document.getElementById('space-canvas');
const flashEl = document.getElementById('flash');
const captureStatusEl = document.getElementById('capture-status');
const phonePreviewEl = document.getElementById('phone-preview');
const filmLayerEl = document.getElementById('film-layer');

const btnToggleUI = document.getElementById('btn-toggle-ui');
const btnExport4K = document.getElementById('btn-export-4k');
const btnExportVertical = document.getElementById('btn-export-vertical');
const btnExportSquare = document.getElementById('btn-export-square');
const btnExportIphone = document.getElementById('btn-export-iphone');
const btnExportFree = document.getElementById('btn-export-free');
const btnReset = document.getElementById('btn-reset');

const MOON_RADIUS = 5.25;
const DEFAULT_TEXTURE_URL = 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg';

let scene;
let camera;
let renderer;
let controls;
let gui;
let clock;

let moonGroup;
let moonMesh;
let rimGlowMesh;
let waterGroup;
let starField;
let sunLight;
let ambientLight;
let guiControllers = [];

let moonTexture;
let moonBumpTexture;
let textureIsExternal = false;

const params = {
  sceneProfile: 'Missão LRO',
  captureProfile: 'Missão LRO',

  phoneOrientation: 'Vertical',
  showPhoneFrame: false,
  keepPhoneGuideInFreeMode: false,

  // Composição
  fov: 22,
  distance: 18,
  offsetX: 0,
  offsetY: 0.12,
  frameRotationZ: 0,
  subjectScale: 1.0,

  // Fase e orientação da luz
  phaseAngle: 54,
  lightElevation: 5,
  lightIntensity: 3.4,
  ambientIntensity: 0.015,

  // Lua
  moonBrightness: 1.02,
  moonContrast: 1.08,
  regolithTint: 0.12,
  roughness: 1.0,
  bumpScale: 0.105,
  moonSpinSpeed: 0.0018,
  rotateMoonY: -23,
  rotateMoonX: 0,
  textureMode: 'Textura online + fallback procedural',

  // Ciência/visualização
  showWaterHydrogen: false,
  waterSignalStrength: 0.34,
  showPolarIceHint: true,
  showTerminatorLine: false,

  // Pós-processamento / câmera
  cameraMono: true,
  sensorNoise: 0.022,
  vignette: 0.22,
  bloomMin: 0.020,
  filmDust: 0.18,
  showReticle: true,
  labelOverlay: false,
  labelText: 'LRO • Lunar Reconnaissance Orbiter',

  // Fundo
  exposure: 1.00,
  starCount: 750,
  starSize: 0.018,
  starBrightness: 0.72,
  showStars: true,
  backgroundGradient: 0.04,

  // Captura livre
  freeWidth: 3000,
  freeHeight: 3000
};

const PROFILE_PRESETS = {
  'Missão LRO': {
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 21.5,
    distance: 16.2,
    offsetX: 0.12,
    offsetY: 0.10,
    frameRotationZ: -1.4,
    subjectScale: 1.05,
    phaseAngle: 38,
    lightElevation: 4,
    lightIntensity: 3.7,
    ambientIntensity: 0.010,
    moonBrightness: 1.04,
    moonContrast: 1.12,
    regolithTint: 0.03,
    roughness: 1.0,
    bumpScale: 0.125,
    moonSpinSpeed: 0.0006,
    rotateMoonY: -18,
    rotateMoonX: 2,
    showWaterHydrogen: false,
    waterSignalStrength: 0.28,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: true,
    sensorNoise: 0.024,
    vignette: 0.20,
    bloomMin: 0.015,
    filmDust: 0.16,
    showReticle: true,
    labelOverlay: false,
    labelText: 'LRO • Lunar Reconnaissance Orbiter',
    exposure: 0.96,
    starCount: 160,
    starSize: 0.015,
    starBrightness: 0.55,
    showStars: false,
    backgroundGradient: 0.02
  },

  'Apollo / Hasselblad': {
    showPhoneFrame: false,
    phoneOrientation: 'Horizontal',
    fov: 31,
    distance: 14.6,
    offsetX: -0.32,
    offsetY: -0.08,
    frameRotationZ: 0.8,
    subjectScale: 1.15,
    phaseAngle: 72,
    lightElevation: 10,
    lightIntensity: 3.2,
    ambientIntensity: 0.035,
    moonBrightness: 1.14,
    moonContrast: 1.22,
    regolithTint: 0.0,
    roughness: 1.0,
    bumpScale: 0.16,
    moonSpinSpeed: 0.0002,
    rotateMoonY: -34,
    rotateMoonX: -2,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: true,
    sensorNoise: 0.060,
    vignette: 0.28,
    bloomMin: 0.012,
    filmDust: 0.42,
    showReticle: true,
    labelOverlay: false,
    labelText: 'Apollo • Hasselblad Data Frame',
    exposure: 0.92,
    starCount: 0,
    starSize: 0.012,
    starBrightness: 0.0,
    showStars: false,
    backgroundGradient: 0.0
  },

  'iPhone 17 Pro Max da Terra': {
    showPhoneFrame: true,
    phoneOrientation: 'Vertical',
    fov: 8.8,
    distance: 132,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: 0,
    subjectScale: 0.58,
    phaseAngle: 0,
    lightElevation: 0,
    lightIntensity: 2.85,
    ambientIntensity: 0.0,
    moonBrightness: 1.34,
    moonContrast: 1.00,
    regolithTint: 0.05,
    roughness: 1.0,
    bumpScale: 0.04,
    moonSpinSpeed: 0.0,
    rotateMoonY: -7,
    rotateMoonX: 0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.038,
    vignette: 0.35,
    bloomMin: 0.085,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    labelText: 'iPhone 17 Pro Max • Terra',
    exposure: 0.86,
    starCount: 180,
    starSize: 0.012,
    starBrightness: 0.42,
    showStars: true,
    backgroundGradient: 0.06
  },

  'Wallpaper Isomium': {
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 20.5,
    distance: 15.2,
    offsetX: -4.65,
    offsetY: 0.16,
    frameRotationZ: -4,
    subjectScale: 1.62,
    phaseAngle: 103,
    lightElevation: 3,
    lightIntensity: 3.8,
    ambientIntensity: 0.0,
    moonBrightness: 0.96,
    moonContrast: 1.28,
    regolithTint: 0.0,
    roughness: 1.0,
    bumpScale: 0.12,
    moonSpinSpeed: 0.0004,
    rotateMoonY: -31,
    rotateMoonX: 2,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: true,
    sensorNoise: 0.006,
    vignette: 0.12,
    bloomMin: 0.022,
    filmDust: 0.03,
    showReticle: false,
    labelOverlay: false,
    labelText: 'ISOMIUM • Moon Wallpaper',
    exposure: 0.92,
    starCount: 90,
    starSize: 0.012,
    starBrightness: 0.34,
    showStars: false,
    backgroundGradient: 0.0,
    freeWidth: 4096,
    freeHeight: 4096
  },

  'Água / Hidrogênio Lunar': {
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 24,
    distance: 17.0,
    offsetX: 0,
    offsetY: 0.14,
    frameRotationZ: -8,
    subjectScale: 1.04,
    phaseAngle: 46,
    lightElevation: 11,
    lightIntensity: 3.45,
    ambientIntensity: 0.020,
    moonBrightness: 1.00,
    moonContrast: 1.10,
    regolithTint: 0.07,
    roughness: 1.0,
    bumpScale: 0.105,
    moonSpinSpeed: 0.0003,
    rotateMoonY: -16,
    rotateMoonX: 8,
    showWaterHydrogen: true,
    waterSignalStrength: 0.48,
    showPolarIceHint: true,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.014,
    vignette: 0.18,
    bloomMin: 0.025,
    filmDust: 0.02,
    showReticle: false,
    labelOverlay: true,
    labelText: 'H₂O / OH • sinal polar e hidrogênio lunar',
    exposure: 1.02,
    starCount: 260,
    starSize: 0.017,
    starBrightness: 0.56,
    showStars: true,
    backgroundGradient: 0.04
  },

  'Mapa de Fases': {
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 19,
    distance: 18.8,
    offsetX: 0,
    offsetY: 0.05,
    frameRotationZ: 0,
    subjectScale: 1.00,
    phaseAngle: 116,
    lightElevation: 0,
    lightIntensity: 3.55,
    ambientIntensity: 0.0,
    moonBrightness: 1.00,
    moonContrast: 1.16,
    regolithTint: 0.05,
    roughness: 1.0,
    bumpScale: 0.095,
    moonSpinSpeed: 0.0001,
    rotateMoonY: 0,
    rotateMoonX: 0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.010,
    vignette: 0.16,
    bloomMin: 0.018,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: true,
    labelText: 'Fase lunar ajustável pelo controle “Ângulo da fase”',
    exposure: 0.98,
    starCount: 520,
    starSize: 0.018,
    starBrightness: 0.60,
    showStars: true,
    backgroundGradient: 0.03
  },

  'Modo Livre': {
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 24,
    distance: 18,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: -2,
    subjectScale: 1.0,
    phaseAngle: 60,
    lightElevation: 4,
    lightIntensity: 3.3,
    ambientIntensity: 0.015,
    moonBrightness: 1.05,
    moonContrast: 1.12,
    regolithTint: 0.10,
    roughness: 1.0,
    bumpScale: 0.11,
    moonSpinSpeed: 0.001,
    rotateMoonY: -15,
    rotateMoonX: 0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.25,
    showPolarIceHint: true,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.012,
    vignette: 0.16,
    bloomMin: 0.020,
    filmDust: 0.02,
    showReticle: false,
    labelOverlay: false,
    labelText: 'ISOMIUM • Modo Livre',
    exposure: 1.00,
    starCount: 500,
    starSize: 0.018,
    starBrightness: 0.64,
    showStars: true,
    backgroundGradient: 0.04,
    freeWidth: 3000,
    freeHeight: 3000
  }
};

init();
animate();

function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    params.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    2500
  );

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = params.exposure;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = true;
  controls.minDistance = 4;
  controls.maxDistance = 260;

  moonGroup = new THREE.Group();
  scene.add(moonGroup);

  ambientLight = new THREE.AmbientLight(0xffffff, params.ambientIntensity);
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xffffff, params.lightIntensity);
  scene.add(sunLight);

  createMoon();
  createRimGlow();
  createWaterHydrogenOverlay();
  createStars();
  createGui();
  bindHud();

  applySceneProfile('Missão LRO', { forcePreset: true });
  loadMoonTexture(DEFAULT_TEXTURE_URL);

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
}

function createMoon() {
  const geometry = new THREE.SphereGeometry(MOON_RADIUS, 192, 128);
  moonTexture = new THREE.CanvasTexture(createProceduralMoonCanvas(1536));
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  moonTexture.wrapS = THREE.RepeatWrapping;
  moonTexture.wrapT = THREE.ClampToEdgeWrapping;

  moonBumpTexture = moonTexture;

  const material = new THREE.MeshStandardMaterial({
    map: moonTexture,
    bumpMap: moonBumpTexture,
    bumpScale: params.bumpScale,
    color: new THREE.Color(1, 1, 1),
    roughness: params.roughness,
    metalness: 0
  });

  moonMesh = new THREE.Mesh(geometry, material);
  moonGroup.add(moonMesh);
}

function createRimGlow() {
  const geometry = new THREE.SphereGeometry(MOON_RADIUS * 1.018, 128, 96);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowColor: { value: new THREE.Color(0xd8e6ff) },
      intensity: { value: 0.18 },
      power: { value: 2.9 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      uniform float power;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float rim = 1.0 - abs(dot(normalize(vNormal), viewDir));
        rim = pow(max(rim, 0.0), power) * intensity;
        gl_FragColor = vec4(glowColor, rim);
      }
    `
  });

  rimGlowMesh = new THREE.Mesh(geometry, material);
  moonGroup.add(rimGlowMesh);
}

function createWaterHydrogenOverlay() {
  waterGroup = new THREE.Group();
  moonGroup.add(waterGroup);

  const polarMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      strength: { value: params.waterSignalStrength },
      showPoles: { value: params.showPolarIceHint ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        vPos = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float strength;
      uniform float showPoles;
      varying vec3 vPos;
      varying vec3 vNormal;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      void main() {
        vec3 p = normalize(vPos);
        float pole = smoothstep(0.72, 0.98, abs(p.y));
        float craterTrap = smoothstep(0.25, 1.0, hash(p.xz * 26.0 + p.yy * 9.0));
        float signal = pole * mix(0.55, 1.0, craterTrap) * showPoles;
        vec3 col = mix(vec3(0.25, 0.58, 1.0), vec3(0.92, 0.98, 1.0), pole);
        gl_FragColor = vec4(col, signal * strength * 0.48);
      }
    `
  });

  const polarShell = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_RADIUS * 1.006, 128, 96),
    polarMaterial
  );
  waterGroup.add(polarShell);

  const particleCount = 420;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const north = i % 2 === 0 ? 1 : -1;
    const theta = Math.random() * Math.PI * 2;
    const y = north * (0.76 + Math.random() * 0.22);
    const r = Math.sqrt(Math.max(0.0, 1.0 - y * y));
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const radius = MOON_RADIUS * (1.018 + Math.random() * 0.006);
    positions[i * 3 + 0] = x * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = z * radius;
    colors[i * 3 + 0] = 0.32 + Math.random() * 0.25;
    colors[i * 3 + 1] = 0.62 + Math.random() * 0.22;
    colors[i * 3 + 2] = 1.0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: params.waterSignalStrength,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  waterGroup.add(particles);
}

function createStars() {
  if (starField) {
    scene.remove(starField);
    starField.geometry.dispose();
    starField.material.dispose();
    starField = null;
  }

  const count = Math.max(0, Math.floor(params.starCount));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 420 + Math.random() * 950;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

    positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = 0.62 + Math.random() * 0.38;
    colors[i * 3 + 0] = c;
    colors[i * 3 + 1] = c;
    colors[i * 3 + 2] = c + Math.random() * 0.04;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: params.starSize,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: params.starBrightness,
    depthWrite: false
  });

  starField = new THREE.Points(geometry, material);
  starField.visible = params.showStars;
  scene.add(starField);
}

function createGui() {
  gui = new GUI({ title: 'MOON MODE' });

  const actions = {
    'Aplicar perfil': () => applySceneProfile(params.sceneProfile, { forcePreset: true }),
    'Resetar modo atual': () => resetCurrentMode(),
    'Recarregar textura': () => loadMoonTexture(DEFAULT_TEXTURE_URL, true),
    'Usar textura procedural': () => useProceduralTexture(),
    'Capturar 3840x2160': () => capturePreset('4k'),
    'Capturar 2160x3840': () => capturePreset('vertical4k'),
    'Capturar 4096x4096': () => capturePreset('square4096'),
    'Capturar iPhone 17 PM': () => capturePreset('iphone17pm'),
    'Capturar Livre': () => captureFree()
  };

  const folderMode = gui.addFolder('Modo');
  track(folderMode.add(params, 'sceneProfile', Object.keys(PROFILE_PRESETS)).name('Perfil').onChange((value) => applySceneProfile(value)));
  track(folderMode.add(params, 'showPhoneFrame').name('Mostrar guia celular').onChange(updatePhonePreview));
  track(folderMode.add(params, 'phoneOrientation', ['Vertical', 'Horizontal']).name('Orientação celular').onChange(updatePhonePreview));
  track(folderMode.add(params, 'keepPhoneGuideInFreeMode').name('Guia no Livre').onChange(updatePhonePreview));
  track(folderMode.add(actions, 'Aplicar perfil'));
  track(folderMode.add(actions, 'Resetar modo atual'));

  const folderComp = gui.addFolder('Composição');
  track(folderComp.add(params, 'fov', 5, 80, 0.1).name('FOV').onChange(applyCameraFromParams));
  track(folderComp.add(params, 'distance', 4, 260, 0.1).name('Distância').onChange(applyCameraFromParams));
  track(folderComp.add(params, 'offsetX', -40, 40, 0.01).name('Offset X').onChange(applyCameraFromParams));
  track(folderComp.add(params, 'offsetY', -40, 40, 0.01).name('Offset Y').onChange(applyCameraFromParams));
  track(folderComp.add(params, 'frameRotationZ', -180, 180, 0.1).name('Rotação quadro').onChange(updateScene));
  track(folderComp.add(params, 'subjectScale', 0.01, 5.0, 0.001).name('Escala assunto').onChange(updateScene));

  const folderPhase = gui.addFolder('Fase / Luz');
  track(folderPhase.add(params, 'phaseAngle', 0, 180, 0.1).name('Ângulo da fase').onChange(updateScene));
  track(folderPhase.add(params, 'lightElevation', -45, 45, 0.1).name('Elevação solar').onChange(updateScene));
  track(folderPhase.add(params, 'lightIntensity', 0, 12.0, 0.01).name('Intensidade').onChange(updateScene));
  track(folderPhase.add(params, 'ambientIntensity', 0, 1.2, 0.001).name('Luz ambiente').onChange(updateScene));
  track(folderPhase.add(params, 'showTerminatorLine').name('Linha terminador').onChange(updateScene));

  const folderMoon = gui.addFolder('Lua');
  track(folderMoon.add(params, 'moonBrightness', 0.05, 3.0, 0.01).name('Brilho').onChange(updateScene));
  track(folderMoon.add(params, 'moonContrast', 0.2, 2.5, 0.01).name('Contraste').onChange(updateScene));
  track(folderMoon.add(params, 'regolithTint', 0, 1, 0.01).name('Tom regolito').onChange(updateScene));
  track(folderMoon.add(params, 'roughness', 0.4, 1, 0.01).name('Rugosidade').onChange(updateScene));
  track(folderMoon.add(params, 'bumpScale', 0, 0.42, 0.001).name('Relevo').onChange(updateScene));
  track(folderMoon.add(params, 'moonSpinSpeed', 0, 0.04, 0.0001).name('Rotação automática'));
  track(folderMoon.add(params, 'rotateMoonY', -180, 180, 0.1).name('Longitude visível').onChange(updateScene));
  track(folderMoon.add(params, 'rotateMoonX', -90, 90, 0.1).name('Inclinação').onChange(updateScene));
  track(folderMoon.add(actions, 'Recarregar textura'));
  track(folderMoon.add(actions, 'Usar textura procedural'));

  const folderScience = gui.addFolder('Camada científica');
  track(folderScience.add(params, 'showWaterHydrogen').name('Água/Hidrogênio').onChange(updateScene));
  track(folderScience.add(params, 'waterSignalStrength', 0, 1.2, 0.01).name('Força sinal H₂O/OH').onChange(updateScene));
  track(folderScience.add(params, 'showPolarIceHint').name('Realce polar').onChange(updateScene));

  const folderRender = gui.addFolder('Render / Câmera');
  track(folderRender.add(params, 'cameraMono').name('Preto e branco').onChange(updateScene));
  track(folderRender.add(params, 'exposure', 0.1, 3.5, 0.01).name('Exposição').onChange(updateScene));
  track(folderRender.add(params, 'sensorNoise', 0, 0.25, 0.001).name('Ruído sensor').onChange(updateScene));
  track(folderRender.add(params, 'vignette', 0, 1.2, 0.01).name('Vinheta').onChange(updateScene));
  track(folderRender.add(params, 'bloomMin', 0, 0.35, 0.001).name('Bloom mínimo').onChange(updateScene));
  track(folderRender.add(params, 'filmDust', 0, 1.0, 0.01).name('Poeira/filme').onChange(updateScene));
  track(folderRender.add(params, 'showReticle').name('Marcas ópticas').onChange(updateScene));
  track(folderRender.add(params, 'labelOverlay').name('Legenda técnica').onChange(updateScene));
  track(folderRender.add(params, 'labelText').name('Texto legenda'));

  const folderStars = gui.addFolder('Fundo');
  track(folderStars.add(params, 'showStars').name('Mostrar estrelas').onChange(updateScene));
  track(folderStars.add(params, 'starCount', 0, 5000, 1).name('Qtd estrelas').onFinishChange(createStars));
  track(folderStars.add(params, 'starSize', 0.001, 0.12, 0.001).name('Tam. estrelas').onFinishChange(createStars));
  track(folderStars.add(params, 'starBrightness', 0, 1.2, 0.01).name('Brilho estrelas').onChange(updateScene));
  track(folderStars.add(params, 'backgroundGradient', 0, 0.5, 0.01).name('Gradiente fundo').onChange(updateScene));

  const folderCapture = gui.addFolder('Captura Livre');
  track(folderCapture.add(params, 'freeWidth', 320, 12000, 1).name('Largura'));
  track(folderCapture.add(params, 'freeHeight', 320, 12000, 1).name('Altura'));
  track(folderCapture.add(actions, 'Capturar 3840x2160'));
  track(folderCapture.add(actions, 'Capturar 2160x3840'));
  track(folderCapture.add(actions, 'Capturar 4096x4096'));
  track(folderCapture.add(actions, 'Capturar iPhone 17 PM'));
  track(folderCapture.add(actions, 'Capturar Livre'));

  folderMode.open();
  folderComp.open();
  folderPhase.open();
  folderMoon.open();
  folderRender.open();
}

function bindHud() {
  btnToggleUI.addEventListener('click', () => toggleUI());
  btnExport4K.addEventListener('click', () => capturePreset('4k'));
  btnExportVertical.addEventListener('click', () => capturePreset('vertical4k'));
  btnExportSquare.addEventListener('click', () => capturePreset('square4096'));
  btnExportIphone.addEventListener('click', () => capturePreset('iphone17pm'));
  btnExportFree.addEventListener('click', () => captureFree());
  btnReset.addEventListener('click', () => resetCurrentMode());
}

function track(controller) {
  guiControllers.push(controller);
  return controller;
}

function refreshGui() {
  guiControllers.forEach((controller) => controller.updateDisplay());
}

function applySceneProfile(profileName, options = {}) {
  const preset = PROFILE_PRESETS[profileName];
  if (!preset) return;

  Object.entries(preset).forEach(([key, value]) => {
    if (options.forcePreset || key !== 'freeWidth' && key !== 'freeHeight') {
      params[key] = value;
    }
  });

  params.sceneProfile = profileName;
  params.captureProfile = profileName;

  updateScene();
  applyCameraFromParams();
  updatePhonePreview();
  createStars();
  refreshGui();
}

function resetCurrentMode() {
  applySceneProfile(params.sceneProfile, { forcePreset: true });
}

function applyCameraFromParams() {
  camera.fov = params.fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  camera.position.set(0, 0, params.distance);
  moonGroup.position.set(params.offsetX, params.offsetY, 0);
  controls.target.set(params.offsetX, params.offsetY, 0);
  controls.update();
}

function updateScene() {
  renderer.toneMappingExposure = params.exposure;

  const backgroundLift = THREE.MathUtils.clamp(params.backgroundGradient, 0, 0.5);
  scene.background = new THREE.Color(backgroundLift * 0.16, backgroundLift * 0.17, backgroundLift * 0.21);

  const scale = params.subjectScale;
  moonGroup.scale.setScalar(scale);
  moonGroup.position.set(params.offsetX, params.offsetY, 0);
  moonGroup.rotation.z = THREE.MathUtils.degToRad(params.frameRotationZ);

  moonMesh.rotation.x = THREE.MathUtils.degToRad(params.rotateMoonX);
  moonMesh.rotation.y = THREE.MathUtils.degToRad(params.rotateMoonY);
  moonMesh.material.bumpScale = params.bumpScale;
  moonMesh.material.roughness = params.roughness;

  const gray = 1.0 + (params.moonBrightness - 1.0);
  const warm = params.regolithTint;
  moonMesh.material.color.setRGB(
    gray * (1.0 + warm * 0.10),
    gray * (1.0 + warm * 0.04),
    gray * (1.0 - warm * 0.08)
  );

  ambientLight.intensity = params.ambientIntensity;
  sunLight.intensity = params.lightIntensity;

  const phase = THREE.MathUtils.degToRad(params.phaseAngle);
  const elev = THREE.MathUtils.degToRad(params.lightElevation);
  const lightDirection = new THREE.Vector3(
    Math.sin(phase) * Math.cos(elev),
    Math.sin(elev),
    Math.cos(phase) * Math.cos(elev)
  ).normalize();
  sunLight.position.copy(lightDirection.multiplyScalar(60));

  if (rimGlowMesh) {
    rimGlowMesh.visible = params.bloomMin > 0.001;
    rimGlowMesh.material.uniforms.intensity.value = Math.max(0.04, params.bloomMin * 2.4);
    rimGlowMesh.material.uniforms.power.value = 2.4 + params.vignette * 2.2;
  }

  updateWaterOverlay();
  updatePhonePreview();
  updateFilmLayer();

  if (starField) {
    starField.visible = params.showStars;
    starField.material.opacity = params.starBrightness;
    starField.material.size = params.starSize;
  }
}

function updateWaterOverlay() {
  if (!waterGroup) return;
  waterGroup.visible = params.showWaterHydrogen;

  waterGroup.traverse((child) => {
    if (!child.material) return;

    if (child.material.uniforms?.strength) {
      child.material.uniforms.strength.value = params.waterSignalStrength;
    }

    if (child.material.uniforms?.showPoles) {
      child.material.uniforms.showPoles.value = params.showPolarIceHint ? 1.0 : 0.0;
    }

    if (child.isPoints) {
      child.material.opacity = params.waterSignalStrength;
      child.visible = params.showPolarIceHint;
    }
  });
}

function updateFilmLayer() {
  document.body.classList.toggle('reticle-on', params.showReticle);
  filmLayerEl.style.opacity = params.showReticle ? '1' : '0';
}

function updatePhonePreview() {
  const shouldShow = params.showPhoneFrame || (params.sceneProfile === 'Modo Livre' && params.keepPhoneGuideInFreeMode);
  phonePreviewEl.classList.toggle('active', shouldShow);
  phonePreviewEl.classList.toggle('landscape', params.phoneOrientation === 'Horizontal');

  if (params.phoneOrientation === 'Horizontal') {
    phonePreviewEl.dataset.label = 'iPhone 17 Pro Max • 2868 × 1320';
  } else {
    phonePreviewEl.dataset.label = 'iPhone 17 Pro Max • 1320 × 2868';
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (moonMesh && params.moonSpinSpeed > 0) {
    moonMesh.rotation.y += delta * params.moonSpinSpeed;
  }

  if (waterGroup) {
    waterGroup.rotation.y += delta * 0.015;
  }

  if (starField) {
    starField.rotation.y += delta * 0.002;
  }

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  applyCameraFromParams();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();

  if (key === 'h') {
    toggleUI();
  }

  if (key === 'p') {
    capturePreset('4k');
  }
}

function toggleUI() {
  document.body.classList.toggle('ui-hidden');
}

function capturePreset(kind) {
  if (kind === '4k') {
    captureAt(3840, 2160, 'isomium-moon-4k');
    return;
  }

  if (kind === 'vertical4k') {
    captureAt(2160, 3840, 'isomium-moon-vertical-4k');
    return;
  }

  if (kind === 'square4096') {
    captureAt(4096, 4096, 'isomium-moon-4096-square');
    return;
  }

  if (kind === 'iphone17pm') {
    const width = params.phoneOrientation === 'Horizontal' ? 2868 : 1320;
    const height = params.phoneOrientation === 'Horizontal' ? 1320 : 2868;
    captureAt(width, height, 'isomium-moon-iphone-17-pro-max');
  }
}

function captureFree() {
  const width = Math.max(320, Math.floor(params.freeWidth));
  const height = Math.max(320, Math.floor(params.freeHeight));
  captureAt(width, height, `isomium-moon-free-${width}x${height}`);
}

async function captureAt(width, height, filename) {
  setCaptureStatus(true);

  await nextFrame();

  const oldPixelRatio = renderer.getPixelRatio();
  const oldSize = new THREE.Vector2();
  renderer.getSize(oldSize);
  const oldAspect = camera.aspect;

  try {
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    const output = buildProcessedCanvas(renderer.domElement, width, height);
    downloadCanvas(output, `${filename}.png`);
    flash();
  } catch (error) {
    console.error(error);
    alert('Não foi possível exportar a imagem. Se estiver usando textura externa, tente “Usar textura procedural” e capture novamente.');
  } finally {
    renderer.setPixelRatio(oldPixelRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    setCaptureStatus(false);
  }
}

function buildProcessedCanvas(sourceCanvas, width, height) {
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const ctx = output.getContext('2d', { willReadFrequently: true });

  if (params.bloomMin > 0.001) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.32, params.bloomMin * 2.8);
    ctx.filter = `blur(${Math.max(2, Math.round(Math.min(width, height) * 0.006))}px) brightness(1.45)`;
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
    ctx.restore();
  }

  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  applyCameraTone(ctx, width, height);
  drawVignette(ctx, width, height, params.vignette);

  if (params.showReticle) {
    drawReticle(ctx, width, height);
  }

  if (params.filmDust > 0.001) {
    drawFilmDust(ctx, width, height, params.filmDust);
  }

  if (params.showTerminatorLine) {
    drawTerminatorGuide(ctx, width, height);
  }

  if (params.labelOverlay) {
    drawLabel(ctx, width, height, params.labelText);
  }

  return output;
}

function applyCameraTone(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const noiseAmount = params.sensorNoise * 255;
  const contrast = params.moonContrast;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (params.cameraMono) {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = gray;
      g = gray;
      b = gray;
    }

    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    if (noiseAmount > 0.01) {
      const grain = (Math.random() - 0.5) * noiseAmount;
      r += grain;
      g += grain;
      b += grain;
    }

    data[i] = clamp255(r);
    data[i + 1] = clamp255(g);
    data[i + 2] = clamp255(b);
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawVignette(ctx, width, height, amount) {
  if (amount <= 0) return;

  const radius = Math.max(width, height) * 0.74;
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.20,
    width * 0.5,
    height * 0.5,
    radius
  );

  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.58, `rgba(0,0,0,${amount * 0.22})`);
  gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.92, amount)})`);

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawReticle(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(22,22,22,0.62)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.00085));

  const cols = 5;
  const rows = 4;
  const size = Math.min(width, height) * 0.018;

  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      const cx = (width / (cols + 1)) * x;
      const cy = (height / (rows + 1)) * y;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx, cy + size);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawFilmDust(ctx, width, height, amount) {
  ctx.save();
  ctx.globalAlpha = Math.min(0.55, amount);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';

  const specks = Math.floor((width * height / 90000) * amount * 18);
  for (let i = 0; i < specks; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * Math.max(0.6, Math.min(width, height) * 0.0009);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = Math.min(0.25, amount * 0.35);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.00045));
  const scratches = Math.floor(amount * 20);
  for (let i = 0; i < scratches; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const len = Math.random() * height * 0.18;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + THREE.MathUtils.randFloatSpread(10), y + len);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTerminatorGuide(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.001));
  ctx.setLineDash([Math.min(width, height) * 0.012, Math.min(width, height) * 0.010]);
  const x = width * (0.5 + Math.sin(THREE.MathUtils.degToRad(params.phaseAngle - 90)) * 0.16);
  ctx.beginPath();
  ctx.moveTo(x, height * 0.12);
  ctx.bezierCurveTo(x + width * 0.05, height * 0.35, x - width * 0.05, height * 0.65, x, height * 0.88);
  ctx.stroke();
  ctx.restore();
}

function drawLabel(ctx, width, height, text) {
  ctx.save();
  const pad = Math.max(18, Math.round(Math.min(width, height) * 0.018));
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.018));
  ctx.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = fontSize * 0.7;
  ctx.fillText(text, pad, height - pad);
  ctx.restore();
}

function downloadCanvas(canvasEl, filename) {
  const link = document.createElement('a');
  link.href = canvasEl.toDataURL('image/png');
  link.download = filename;
  link.click();
}

function setCaptureStatus(visible) {
  captureStatusEl.style.display = visible ? 'block' : 'none';
}

function flash() {
  flashEl.style.opacity = '0.92';
  setTimeout(() => {
    flashEl.style.opacity = '0';
  }, 80);
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function clamp255(value) {
  return Math.max(0, Math.min(255, value));
}

function loadMoonTexture(url, force = false) {
  if (textureIsExternal && !force) return;

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  loader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      setMoonTexture(texture, texture, true);
    },
    undefined,
    () => {
      console.warn('Textura externa não carregou. Usando textura procedural.');
      useProceduralTexture();
    }
  );
}

function useProceduralTexture() {
  const texture = new THREE.CanvasTexture(createProceduralMoonCanvas(2048));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  setMoonTexture(texture, texture, false);
}

function setMoonTexture(map, bump, external) {
  moonTexture = map;
  moonBumpTexture = bump;
  textureIsExternal = external;

  if (!moonMesh) return;
  moonMesh.material.map = moonTexture;
  moonMesh.material.bumpMap = moonBumpTexture;
  moonMesh.material.needsUpdate = true;
}

function createProceduralMoonCanvas(size = 1536) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size / 2;
  const ctx = c.getContext('2d', { willReadFrequently: true });

  const w = c.width;
  const h = c.height;
  const image = ctx.createImageData(w, h);
  const data = image.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      const lat = Math.abs(v - 0.5) * 2;
      const n1 = valueNoise(u * 15.0, v * 8.0);
      const n2 = valueNoise(u * 52.0 + 7.0, v * 26.0 + 3.0);
      const n3 = valueNoise(u * 170.0 + 11.0, v * 92.0 + 5.0);
      const mare = mareMask(u, v);
      let shade = 126 + n1 * 26 + n2 * 10 + n3 * 5 - mare * 42;
      shade += lat * 8;
      const idx = (y * w + x) * 4;
      data[idx] = clamp255(shade * 1.02);
      data[idx + 1] = clamp255(shade * 1.00);
      data[idx + 2] = clamp255(shade * 0.95);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  drawMarePatches(ctx, w, h);
  drawCraterField(ctx, w, h, 950);
  drawSubtleLongitudeSeams(ctx, w, h);

  return c;
}

function drawMarePatches(ctx, w, h) {
  const mare = [
    [0.59, 0.42, 0.095, 0.060, -0.2],
    [0.64, 0.50, 0.135, 0.085, 0.25],
    [0.53, 0.54, 0.095, 0.060, -0.1],
    [0.70, 0.39, 0.082, 0.050, 0.15],
    [0.45, 0.45, 0.062, 0.040, 0.2],
    [0.34, 0.53, 0.060, 0.036, -0.25],
    [0.75, 0.58, 0.052, 0.035, 0.0]
  ];

  ctx.save();
  mare.forEach(([u, v, rx, ry, rot]) => {
    ctx.translate(u * w, v * h);
    ctx.rotate(rot);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx * w, ry * h));
    gradient.addColorStop(0, 'rgba(36,36,36,0.42)');
    gradient.addColorStop(0.65, 'rgba(36,36,36,0.28)');
    gradient.addColorStop(1, 'rgba(36,36,36,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * w, ry * h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(-rot);
    ctx.translate(-u * w, -v * h);
  });
  ctx.restore();
}

function drawCraterField(ctx, w, h, count) {
  ctx.save();

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const latFactor = 0.55 + Math.abs(v - 0.5) * 0.7;
    const base = Math.pow(Math.random(), 2.15);
    const r = (1.4 + base * 22.0) * latFactor;

    const x = u * w;
    const y = v * h;
    const squash = 0.78 + Math.random() * 0.42;

    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);

    ctx.strokeStyle = `rgba(235,235,225,${0.10 + base * 0.26})`;
    ctx.lineWidth = Math.max(0.7, r * 0.12);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(20,20,20,${0.05 + base * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(r * 0.12, r * 0.16, r * 0.74, r * squash * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,245,${0.05 + base * 0.12})`;
    ctx.beginPath();
    ctx.arc(-r * 0.18, -r * 0.2, r * 0.55, Math.PI * 0.92, Math.PI * 1.85);
    ctx.stroke();

    ctx.rotate(-Math.random() * Math.PI);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  ctx.restore();
}

function drawSubtleLongitudeSeams(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 9; i++) {
    const x = (i / 9) * w;
    ctx.fillRect(x, 0, 1, h);
  }
  ctx.restore();
}

function mareMask(u, v) {
  const patches = [
    [0.59, 0.42, 0.12, 0.075],
    [0.64, 0.50, 0.16, 0.11],
    [0.53, 0.54, 0.10, 0.07],
    [0.70, 0.39, 0.10, 0.065],
    [0.45, 0.45, 0.075, 0.055],
    [0.34, 0.53, 0.074, 0.050],
    [0.75, 0.58, 0.070, 0.050]
  ];

  let m = 0;
  for (const [cx, cy, rx, ry] of patches) {
    const dx = wrapDistance(u, cx) / rx;
    const dy = (v - cy) / ry;
    const d = dx * dx + dy * dy;
    m += Math.max(0, 1 - d);
  }
  return Math.min(1, m);
}

function wrapDistance(a, b) {
  let d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

function valueNoise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  return lerp(lerp(a, b, u), lerp(c, d, u), v) - 0.5;
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
