import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('space-canvas');
const flashEl = document.getElementById('flash');
const controlsContent = document.getElementById('controls-content');
const jsonInput = document.getElementById('json-input');
const jsonStatus = document.getElementById('json-status');
const jsonFile = document.getElementById('json-file');
const captureStatusEl = document.getElementById('capture-status');

const btnToggleControls = document.getElementById('btn-toggle-controls');
const btnToggleJson = document.getElementById('btn-toggle-json');
const btnCloseControls = document.getElementById('btn-close-controls');
const btnCloseJson = document.getElementById('btn-close-json');

const btnApplyJson = document.getElementById('btn-apply-json');
const btnExportJson = document.getElementById('btn-export-json');
const btnCopyJson = document.getElementById('btn-copy-json');
const btnDownloadJson = document.getElementById('btn-download-json');
const btnCaptureFree = document.getElementById('btn-capture-free');

const btnExport4k = document.getElementById('btn-export-4k');
const btnExportSquare = document.getElementById('btn-export-square');
const btnPresetReal = document.getElementById('btn-preset-real');
const btnPresetCrescent = document.getElementById('btn-preset-crescent');
const btnPresetWallpaper = document.getElementById('btn-preset-wallpaper');
const btnResetCamera = document.getElementById('btn-reset-camera');

const VERSION = '5.0.0';
const MOON_RADIUS = 5.18;

let scene;
let camera;
let renderer;
let controls;
let moonGroup;
let moonMesh;
let starField;
let sunLight;
let ambientLight;
let sunDisc;
let moonRebuildTimer = null;
let starsRebuildTimer = null;

const params = {
  sceneProfile: 'Lua Realista Premium',

  // composição
  fov: 21.0,
  distance: 17.8,
  offsetX: 0.0,
  offsetY: 0.04,
  frameRotationZ: -0.8,
  subjectScale: 1.0,

  // sol / luz
  sunVisible: false,
  sunAzimuth: -42,
  sunElevation: 7,
  sunDistance: 180,
  sunScale: 8,
  lightIntensity: 3.8,
  ambientIntensity: 0.0008,
  exposure: 0.97,

  // lua
  seed: 91824,
  textureResolution: 2048,
  moonBrightness: 0.95,
  moonContrast: 1.20,
  regolithTint: 0.030,
  roughness: 1.0,
  bumpScale: 0.090,
  displacementScale: 0.004,
  rotateMoonY: -22,
  rotateMoonX: 2.5,
  moonSpinSpeed: 0.0,

  // superfície
  craterCount: 620,
  craterStrength: 0.26,
  craterRimStrength: 0.08,
  craterMinRadius: 0.0024,
  craterMaxRadius: 0.032,
  mareStrength: 0.60,
  mareSoftness: 0.88,
  highlandNoise: 0.38,
  microRelief: 0.19,
  ejectaStrength: 0.020,

  // pós
  cameraMono: false,
  sensorNoise: 0.003,
  vignette: 0.10,
  bloomMin: 0.002,
  filmDust: 0.0,
  showReticle: false,
  labelOverlay: false,
  labelText: 'ISOMIUM • Lua realista',

  // fundo
  starCount: 140,
  starSize: 0.012,
  starBrightness: 0.22,
  showStars: true,
  backgroundGradient: 0.003,

  // captura
  freeWidth: 4096,
  freeHeight: 4096
};

const PRESETS = {
  real: {
    sceneProfile: 'Lua Realista Premium',
    fov: 21.0,
    distance: 17.8,
    offsetX: 0.0,
    offsetY: 0.04,
    frameRotationZ: -0.8,
    subjectScale: 1.0,
    sunVisible: false,
    sunAzimuth: -42,
    sunElevation: 7,
    lightIntensity: 3.8,
    ambientIntensity: 0.0008,
    exposure: 0.97,
    seed: 91824,
    textureResolution: 2048,
    moonBrightness: 0.95,
    moonContrast: 1.20,
    regolithTint: 0.030,
    roughness: 1.0,
    bumpScale: 0.090,
    displacementScale: 0.004,
    rotateMoonY: -22,
    rotateMoonX: 2.5,
    moonSpinSpeed: 0.0,
    craterCount: 620,
    craterStrength: 0.26,
    craterRimStrength: 0.08,
    craterMinRadius: 0.0024,
    craterMaxRadius: 0.032,
    mareStrength: 0.60,
    mareSoftness: 0.88,
    highlandNoise: 0.38,
    microRelief: 0.19,
    ejectaStrength: 0.020,
    cameraMono: false,
    sensorNoise: 0.003,
    vignette: 0.10,
    bloomMin: 0.002,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    starCount: 140,
    starBrightness: 0.22,
    starSize: 0.012,
    showStars: true,
    backgroundGradient: 0.003
  },
  crescent: {
    sceneProfile: 'Lua Crescente Realista',
    fov: 19.8,
    distance: 17.0,
    offsetX: -0.26,
    offsetY: 0.08,
    frameRotationZ: -2.0,
    subjectScale: 1.06,
    sunVisible: false,
    sunAzimuth: -82,
    sunElevation: 5,
    lightIntensity: 4.1,
    ambientIntensity: 0.0002,
    exposure: 0.93,
    seed: 12841,
    textureResolution: 2048,
    moonBrightness: 0.92,
    moonContrast: 1.28,
    regolithTint: 0.022,
    roughness: 1.0,
    bumpScale: 0.10,
    displacementScale: 0.004,
    rotateMoonY: -30,
    rotateMoonX: 2.2,
    moonSpinSpeed: 0.0,
    craterCount: 580,
    craterStrength: 0.24,
    craterRimStrength: 0.07,
    craterMinRadius: 0.0022,
    craterMaxRadius: 0.028,
    mareStrength: 0.58,
    mareSoftness: 0.90,
    highlandNoise: 0.42,
    microRelief: 0.20,
    ejectaStrength: 0.016,
    cameraMono: false,
    sensorNoise: 0.004,
    vignette: 0.14,
    bloomMin: 0.003,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    starCount: 240,
    starBrightness: 0.30,
    starSize: 0.012,
    showStars: true,
    backgroundGradient: 0.002
  },
  wallpaper: {
    sceneProfile: 'Lua Wallpaper Isomium',
    fov: 18.6,
    distance: 15.6,
    offsetX: -2.05,
    offsetY: 0.12,
    frameRotationZ: -3.2,
    subjectScale: 1.24,
    sunVisible: false,
    sunAzimuth: -66,
    sunElevation: 8,
    lightIntensity: 4.0,
    ambientIntensity: 0.0005,
    exposure: 0.95,
    seed: 54318,
    textureResolution: 2048,
    moonBrightness: 0.93,
    moonContrast: 1.26,
    regolithTint: 0.018,
    roughness: 1.0,
    bumpScale: 0.085,
    displacementScale: 0.003,
    rotateMoonY: -26,
    rotateMoonX: 3.0,
    moonSpinSpeed: 0.0,
    craterCount: 540,
    craterStrength: 0.22,
    craterRimStrength: 0.06,
    craterMinRadius: 0.0022,
    craterMaxRadius: 0.028,
    mareStrength: 0.66,
    mareSoftness: 0.92,
    highlandNoise: 0.36,
    microRelief: 0.18,
    ejectaStrength: 0.014,
    cameraMono: true,
    sensorNoise: 0.002,
    vignette: 0.10,
    bloomMin: 0.002,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    starCount: 0,
    starBrightness: 0.0,
    starSize: 0.012,
    showStars: false,
    backgroundGradient: 0.0
  }
};

const CONTROL_GROUPS = [
  {
    title: 'Composição',
    controls: [
      { key: 'fov', label: 'FOV', type: 'range', min: 8, max: 50, step: 0.1 },
      { key: 'distance', label: 'Distância', type: 'range', min: 8, max: 40, step: 0.1 },
      { key: 'offsetX', label: 'Offset X', type: 'range', min: -10, max: 10, step: 0.01 },
      { key: 'offsetY', label: 'Offset Y', type: 'range', min: -10, max: 10, step: 0.01 },
      { key: 'frameRotationZ', label: 'Rotação quadro', type: 'range', min: -20, max: 20, step: 0.1 },
      { key: 'subjectScale', label: 'Escala da Lua', type: 'range', min: 0.4, max: 2.0, step: 0.01 }
    ]
  },
  {
    title: 'Iluminação Solar',
    controls: [
      { key: 'sunVisible', label: 'Mostrar disco do Sol', type: 'checkbox' },
      { key: 'sunAzimuth', label: 'Azimute do Sol', type: 'range', min: -180, max: 180, step: 0.1 },
      { key: 'sunElevation', label: 'Elevação do Sol', type: 'range', min: -20, max: 45, step: 0.1 },
      { key: 'lightIntensity', label: 'Intensidade solar', type: 'range', min: 0, max: 10, step: 0.01 },
      { key: 'ambientIntensity', label: 'Luz ambiente', type: 'range', min: 0, max: 0.2, step: 0.0005 },
      { key: 'exposure', label: 'Exposição', type: 'range', min: 0.2, max: 2.0, step: 0.01 }
    ]
  },
  {
    title: 'Lua',
    controls: [
      { key: 'moonBrightness', label: 'Brilho da Lua', type: 'range', min: 0.5, max: 1.4, step: 0.01 },
      { key: 'moonContrast', label: 'Contraste', type: 'range', min: 0.6, max: 1.8, step: 0.01, rebuildMoon: true },
      { key: 'regolithTint', label: 'Tom do regolito', type: 'range', min: 0, max: 0.08, step: 0.001, rebuildMoon: true },
      { key: 'roughness', label: 'Rugosidade', type: 'range', min: 0.5, max: 1.0, step: 0.01 },
      { key: 'bumpScale', label: 'Relevo (bump)', type: 'range', min: 0, max: 0.25, step: 0.001 },
      { key: 'displacementScale', label: 'Deslocamento 3D', type: 'range', min: 0, max: 0.02, step: 0.0005 },
      { key: 'rotateMoonY', label: 'Longitude visível', type: 'range', min: -180, max: 180, step: 0.1 },
      { key: 'rotateMoonX', label: 'Inclinação', type: 'range', min: -30, max: 30, step: 0.1 },
      { key: 'moonSpinSpeed', label: 'Rotação automática', type: 'range', min: 0, max: 0.01, step: 0.0001 }
    ]
  },
  {
    title: 'Superfície',
    controls: [
      { key: 'seed', label: 'Seed', type: 'range', min: 1, max: 99999, step: 1, rebuildMoon: true, rebuildStars: true },
      { key: 'textureResolution', label: 'Resolução da textura', type: 'range', min: 512, max: 4096, step: 256, rebuildMoon: true },
      { key: 'craterCount', label: 'Quantidade de crateras', type: 'range', min: 0, max: 1600, step: 1, rebuildMoon: true },
      { key: 'craterStrength', label: 'Profundidade das crateras', type: 'range', min: 0, max: 0.6, step: 0.005, rebuildMoon: true },
      { key: 'craterRimStrength', label: 'Força da borda', type: 'range', min: 0, max: 0.25, step: 0.005, rebuildMoon: true },
      { key: 'craterMinRadius', label: 'Raio mínimo', type: 'range', min: 0.001, max: 0.01, step: 0.0001, rebuildMoon: true },
      { key: 'craterMaxRadius', label: 'Raio máximo', type: 'range', min: 0.01, max: 0.08, step: 0.0005, rebuildMoon: true },
      { key: 'mareStrength', label: 'Força dos mares', type: 'range', min: 0, max: 1.0, step: 0.01, rebuildMoon: true },
      { key: 'mareSoftness', label: 'Suavidade dos mares', type: 'range', min: 0.5, max: 1.2, step: 0.01, rebuildMoon: true },
      { key: 'highlandNoise', label: 'Ruído das terras altas', type: 'range', min: 0, max: 1.0, step: 0.01, rebuildMoon: true },
      { key: 'microRelief', label: 'Micro relevo', type: 'range', min: 0, max: 0.5, step: 0.01, rebuildMoon: true },
      { key: 'ejectaStrength', label: 'Ejetos craterais', type: 'range', min: 0, max: 0.08, step: 0.001, rebuildMoon: true }
    ]
  },
  {
    title: 'Pós e Fundo',
    controls: [
      { key: 'cameraMono', label: 'Preto e branco', type: 'checkbox' },
      { key: 'sensorNoise', label: 'Ruído', type: 'range', min: 0, max: 0.05, step: 0.001 },
      { key: 'vignette', label: 'Vinheta', type: 'range', min: 0, max: 0.4, step: 0.01 },
      { key: 'showStars', label: 'Mostrar estrelas', type: 'checkbox' },
      { key: 'starCount', label: 'Quantidade de estrelas', type: 'range', min: 0, max: 2000, step: 1, rebuildStars: true },
      { key: 'starSize', label: 'Tamanho das estrelas', type: 'range', min: 0.001, max: 0.05, step: 0.001 },
      { key: 'starBrightness', label: 'Brilho das estrelas', type: 'range', min: 0, max: 1.0, step: 0.01 },
      { key: 'backgroundGradient', label: 'Gradiente de fundo', type: 'range', min: 0, max: 0.05, step: 0.001 }
    ]
  }
];

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0, 0, 0);

  camera = new THREE.PerspectiveCamera(params.fov, window.innerWidth / window.innerHeight, 0.1, 2500);
  camera.position.set(0, 0, params.distance);

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
  controls.minDistance = 8;
  controls.maxDistance = 80;

  moonGroup = new THREE.Group();
  scene.add(moonGroup);

  ambientLight = new THREE.AmbientLight(0xffffff, params.ambientIntensity);
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xffffff, params.lightIntensity);
  scene.add(sunLight);

  createMoon();
  createStars();
  createSunDisc();
  buildControlsUI();
  bindUI();
  applyParams({ rebuildMoon: true, rebuildStars: true, updateJson: true, refreshControls: true });

  animate();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
}

function createMoon() {
  if (moonMesh) {
    moonGroup.remove(moonMesh);
    disposeObject(moonMesh);
  }

  const geometry = new THREE.SphereGeometry(MOON_RADIUS, 256, 160);
  const textures = buildMoonTextures();

  const material = new THREE.MeshStandardMaterial({
    map: textures.albedo,
    bumpMap: textures.height,
    bumpScale: params.bumpScale,
    displacementMap: textures.height,
    displacementScale: params.displacementScale,
    roughness: params.roughness,
    metalness: 0,
    color: new THREE.Color(params.moonBrightness, params.moonBrightness, params.moonBrightness)
  });

  moonMesh = new THREE.Mesh(geometry, material);
  moonGroup.add(moonMesh);
}

function buildMoonTextures() {
  const requested = Math.round(params.textureResolution || 2048);
  const width = clampInt(requested, 512, 4096);
  const height = Math.floor(width / 2);
  const heightData = new Float32Array(width * height);
  const mareData = new Float32Array(width * height);
  const prng = mulberry32((params.seed >>> 0) || 1);

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const lat = Math.abs(v - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const i = y * width + x;

      const mare = computeMareMask(u, v, params.mareSoftness);
      const broadNoise =
        fbmPeriodic(u, v, 5.0, 3.6, 4) * 0.72 +
        fbmPeriodic(u + 0.13, v + 0.21, 13.0, 8.4, 3) * params.highlandNoise * 0.46;
      const microNoise = fbmPeriodic(u + 0.42, v + 0.11, 28.0, 16.0, 2) * params.microRelief * 0.22;

      let h = 0.5;
      h += broadNoise * 0.16;
      h += microNoise;
      h += lat * 0.013;
      h -= mare * params.mareStrength * 0.11;

      heightData[i] = h;
      mareData[i] = mare;
    }
  }

  addCraters(heightData, mareData, width, height, prng);

  // força continuidade exata na emenda para evitar costura vertical
  copySeam(heightData, width, height);
  copySeam(mareData, width, height);

  normalizeHeight(heightData);

  const albedoCanvas = document.createElement('canvas');
  const heightCanvas = document.createElement('canvas');
  albedoCanvas.width = heightCanvas.width = width;
  albedoCanvas.height = heightCanvas.height = height;

  const albedoCtx = albedoCanvas.getContext('2d', { willReadFrequently: true });
  const heightCtx = heightCanvas.getContext('2d', { willReadFrequently: true });

  const albedoImage = albedoCtx.createImageData(width, height);
  const heightImage = heightCtx.createImageData(width, height);

  const tint = params.regolithTint;
  const contrast = params.moonContrast;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const h = heightData[i];
      const mare = mareData[i];

      const albedoNoise =
        fbmPeriodic(x / width + 0.07, y / height + 0.19, 36.0, 18.0, 2) * 7.0 +
        fbmPeriodic(x / width + 0.31, y / height + 0.41, 9.0, 5.0, 3) * 6.0;

      let shade = 138;
      shade += (h - 0.5) * 82;
      shade -= mare * 23;
      shade += albedoNoise;
      shade = (shade - 128) * contrast + 128;

      albedoImage.data[idx] = clamp255(shade * (1.0 + tint * 0.08));
      albedoImage.data[idx + 1] = clamp255(shade * (1.0 + tint * 0.03));
      albedoImage.data[idx + 2] = clamp255(shade * (1.0 - tint * 0.06));
      albedoImage.data[idx + 3] = 255;

      const hv = clamp255(h * 255);
      heightImage.data[idx] = hv;
      heightImage.data[idx + 1] = hv;
      heightImage.data[idx + 2] = hv;
      heightImage.data[idx + 3] = 255;
    }
  }

  albedoCtx.putImageData(albedoImage, 0, 0);
  heightCtx.putImageData(heightImage, 0, 0);

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const heightTexture = new THREE.CanvasTexture(heightCanvas);

  albedo.colorSpace = THREE.SRGBColorSpace;
  heightTexture.colorSpace = THREE.NoColorSpace;

  for (const texture of [albedo, heightTexture]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
  }

  return { albedo, height: heightTexture };
}

function computeMareMask(u, v, softness = 0.88) {
  const patches = [
    [0.595, 0.408, 0.100, 0.068, -0.10, 1.00],
    [0.649, 0.500, 0.143, 0.092, 0.18, 0.92],
    [0.534, 0.532, 0.091, 0.064, -0.18, 0.75],
    [0.704, 0.384, 0.081, 0.054, 0.12, 0.68],
    [0.458, 0.454, 0.061, 0.044, 0.14, 0.53],
    [0.338, 0.536, 0.054, 0.038, -0.18, 0.35]
  ];

  let m = 0;
  for (const [cx, cy, rx, ry, rot, strength] of patches) {
    const dx0 = wrapDistanceSigned(u, cx);
    const dy0 = v - cy;
    const ca = Math.cos(rot);
    const sa = Math.sin(rot);
    const dx = dx0 * ca - dy0 * sa;
    const dy = dx0 * sa + dy0 * ca;
    const d = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
    const n = fbmPeriodic(u + cx, v + cy, 12.0, 8.0, 2) * 0.14;
    const edge = 1.0 - smoothstep(0.72 + n, 1.06 + softness * 0.14, d);
    m += edge * strength;
  }
  return clampNumber(m, 0, 1);
}

function addCraters(heightData, mareData, width, height, prng) {
  const count = clampInt(params.craterCount, 0, 2200);
  const minR = clampNumber(params.craterMinRadius, 0.001, 0.03);
  const maxR = clampNumber(params.craterMaxRadius, minR, 0.09);

  for (let c = 0; c < count; c++) {
    const u = prng();
    const v = 0.03 + prng() * 0.94;
    const sizeBias = Math.pow(prng(), 3.1);
    const r = minR + sizeBias * (maxR - minR);

    const elliptic = 0.88 + prng() * 0.24;
    const depth = params.craterStrength * (0.016 + r * 0.22) * (0.7 + prng() * 0.4);
    const rim = params.craterRimStrength * (0.008 + r * 0.09) * (0.7 + prng() * 0.35);
    const angle = prng() * Math.PI * 2;

    const px = Math.max(2, Math.ceil(r * width * 1.35));
    const py = Math.max(2, Math.ceil(r * height * 2.4));

    const cx = Math.floor(u * width);
    const cy = Math.floor(v * height);

    for (let yy = cy - py; yy <= cy + py; yy++) {
      if (yy < 0 || yy >= height) continue;

      const vv = yy / (height - 1);
      const latScale = Math.max(0.40, Math.cos((vv - 0.5) * Math.PI));

      for (let xx = cx - px; xx <= cx + px; xx++) {
        const wrappedX = (xx + width) % width;
        const uu = wrappedX / width;

        let du = wrapDistanceSigned(uu, u) / Math.max(0.0001, r / latScale);
        let dv = (vv - v) / Math.max(0.0001, r * elliptic * 1.9);

        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const rx = du * ca - dv * sa;
        const ry = du * sa + dv * ca;
        const d = Math.sqrt(rx * rx + ry * ry);

        if (d > 1.45) continue;

        const i = yy * width + wrappedX;
        const mare = mareData[i];
        const localSoftening = 1.0 - mare * 0.22;

        const bowl = -depth * smoothBell(d, 0.0, 0.98) * localSoftening;
        const centralLift = depth * 0.08 * Math.exp(-Math.pow(d / 0.35, 2.0)) * (r > maxR * 0.45 ? 1 : 0);
        const rimShape = Math.exp(-Math.pow((d - 1.0) / 0.13, 2.0));
        const outerSlope = -depth * 0.12 * Math.exp(-Math.pow((d - 1.18) / 0.24, 2.0));
        const rimValue = rim * rimShape * localSoftening;

        heightData[i] += bowl + centralLift + rimValue + outerSlope;

        if (params.ejectaStrength > 0 && r > maxR * 0.50 && d > 1.0 && d < 1.35) {
          const radialNoise = fbmPeriodic(uu + c * 0.013, vv + c * 0.021, 42.0, 22.0, 1);
          heightData[i] += params.ejectaStrength * r * 0.32 * radialNoise * (1.35 - d);
        }
      }
    }
  }
}

function copySeam(array, width, height) {
  for (let y = 0; y < height; y++) {
    array[y * width + (width - 1)] = array[y * width];
  }
}

function createStars() {
  if (starField) {
    scene.remove(starField);
    disposeObject(starField);
  }

  const count = clampInt(params.starCount, 0, 4000);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const prng = mulberry32(((params.seed + 1013904223) >>> 0) || 1);

  for (let i = 0; i < count; i++) {
    const radius = 500 + prng() * 1200;
    const theta = prng() * Math.PI * 2;
    const phi = Math.acos(prng() * 2 - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = 0.58 + prng() * 0.42;
    colors[i * 3] = c;
    colors[i * 3 + 1] = c;
    colors[i * 3 + 2] = Math.min(1, c + prng() * 0.04);
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
  scene.add(starField);
}

function createSunDisc() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0.00, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,246,210,0.95)');
  g.addColorStop(0.42, 'rgba(255,190,90,0.38)');
  g.addColorStop(1.00, 'rgba(255,120,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  sunDisc = new THREE.Sprite(material);
  scene.add(sunDisc);
}

function applyParams(options = {}) {
  const rebuildMoon = !!options.rebuildMoon;
  const rebuildStars = !!options.rebuildStars;
  const updateJson = !!options.updateJson;
  const refreshControls = !!options.refreshControls;

  if (rebuildMoon) createMoon();
  if (rebuildStars) createStars();

  renderer.toneMappingExposure = params.exposure;

  const lift = clampNumber(params.backgroundGradient, 0, 0.5);
  scene.background = new THREE.Color(lift * 0.12, lift * 0.13, lift * 0.16);

  camera.fov = params.fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = params.distance;

  moonGroup.position.set(params.offsetX, params.offsetY, 0);
  moonGroup.scale.setScalar(params.subjectScale);
  moonGroup.rotation.z = THREE.MathUtils.degToRad(params.frameRotationZ);

  controls.target.set(params.offsetX, params.offsetY, 0);
  controls.update();

  if (moonMesh) {
    moonMesh.rotation.x = THREE.MathUtils.degToRad(params.rotateMoonX);
    moonMesh.rotation.y = THREE.MathUtils.degToRad(params.rotateMoonY);
    moonMesh.material.roughness = params.roughness;
    moonMesh.material.bumpScale = params.bumpScale;
    moonMesh.material.displacementScale = params.displacementScale;
    moonMesh.material.color.setScalar(params.moonBrightness);
    moonMesh.material.needsUpdate = true;
  }

  ambientLight.intensity = params.ambientIntensity;
  sunLight.intensity = params.lightIntensity;

  const lightDir = directionFromAzimuthElevation(params.sunAzimuth, params.sunElevation);
  sunLight.position.copy(lightDir.clone().multiplyScalar(100));

  if (sunDisc) {
    sunDisc.visible = params.sunVisible;
    sunDisc.position.copy(lightDir.clone().multiplyScalar(params.sunDistance));
    sunDisc.scale.setScalar(params.sunScale);
  }

  if (starField) {
    starField.visible = params.showStars;
    starField.material.size = params.starSize;
    starField.material.opacity = params.starBrightness;
  }

  if (updateJson) updateJsonText();
  if (refreshControls) refreshControlsUI();
}

function buildControlsUI() {
  controlsContent.innerHTML = '';

  for (const group of CONTROL_GROUPS) {
    const groupEl = document.createElement('section');
    groupEl.className = 'control-group';

    const title = document.createElement('h3');
    title.textContent = group.title;
    groupEl.appendChild(title);

    for (const def of group.controls) {
      const row = document.createElement('div');
      row.className = `control-row${def.type === 'checkbox' ? ' checkbox' : ''}`;
      row.dataset.key = def.key;

      const label = document.createElement('label');
      label.textContent = def.label;
      row.appendChild(label);

      if (def.type === 'checkbox') {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!params[def.key];
        input.addEventListener('change', () => {
          params[def.key] = input.checked;
          handleControlUpdate(def);
        });
        row.appendChild(input);
      } else {
        const value = document.createElement('div');
        value.className = 'control-value';
        value.textContent = formatValue(params[def.key], def.step);
        row.appendChild(value);

        const wrap = document.createElement('div');
        wrap.className = 'control-slider-wrap';

        const range = document.createElement('input');
        range.type = 'range';
        range.min = def.min;
        range.max = def.max;
        range.step = def.step;
        range.value = params[def.key];

        const number = document.createElement('input');
        number.type = 'number';
        number.min = def.min;
        number.max = def.max;
        number.step = def.step;
        number.value = params[def.key];

        const update = (rawValue) => {
          let newValue = rawValue;
          if (def.step >= 1) newValue = Math.round(Number(rawValue));
          else newValue = Number(rawValue);
          if (!Number.isFinite(newValue)) return;

          params[def.key] = newValue;
          value.textContent = formatValue(newValue, def.step);
          range.value = newValue;
          number.value = newValue;
          handleControlUpdate(def);
        };

        range.addEventListener('input', () => update(range.value));
        number.addEventListener('change', () => update(number.value));

        wrap.appendChild(range);
        wrap.appendChild(number);
        row.appendChild(wrap);
      }

      groupEl.appendChild(row);
    }

    controlsContent.appendChild(groupEl);
  }
}

function refreshControlsUI() {
  for (const def of CONTROL_GROUPS.flatMap((g) => g.controls)) {
    const row = controlsContent.querySelector(`.control-row[data-key="${def.key}"]`);
    if (!row) continue;
    if (def.type === 'checkbox') {
      const input = row.querySelector('input[type="checkbox"]');
      if (input) input.checked = !!params[def.key];
    } else {
      const value = row.querySelector('.control-value');
      const range = row.querySelector('input[type="range"]');
      const number = row.querySelector('input[type="number"]');
      if (value) value.textContent = formatValue(params[def.key], def.step);
      if (range) range.value = params[def.key];
      if (number) number.value = params[def.key];
    }
  }
}

function handleControlUpdate(def) {
  clampParams();

  if (def.rebuildMoon) {
    scheduleMoonRebuild(120);
  } else if (def.rebuildStars) {
    scheduleStarsRebuild(80);
  } else {
    applyParams({ updateJson: true, refreshControls: false });
  }
}

function scheduleMoonRebuild(delay = 100) {
  clearTimeout(moonRebuildTimer);
  moonRebuildTimer = setTimeout(() => {
    applyParams({ rebuildMoon: true, updateJson: true, refreshControls: false });
  }, delay);
}

function scheduleStarsRebuild(delay = 80) {
  clearTimeout(starsRebuildTimer);
  starsRebuildTimer = setTimeout(() => {
    applyParams({ rebuildStars: true, updateJson: true, refreshControls: false });
  }, delay);
}

function bindUI() {
  btnToggleControls.addEventListener('click', toggleControlsPanel);
  btnCloseControls.addEventListener('click', () => document.body.classList.remove('controls-open'));
  btnToggleJson.addEventListener('click', toggleJsonPanel);
  btnCloseJson.addEventListener('click', () => document.body.classList.remove('json-open'));

  btnApplyJson.addEventListener('click', applyJsonFromText);
  btnExportJson.addEventListener('click', updateJsonText);
  btnCopyJson.addEventListener('click', copyJson);
  btnDownloadJson.addEventListener('click', downloadJson);
  btnCaptureFree.addEventListener('click', () => captureAt(params.freeWidth, params.freeHeight, 'isomium-moon-v5-free'));

  btnExport4k.addEventListener('click', () => captureAt(3840, 2160, 'isomium-moon-v5-4k'));
  btnExportSquare.addEventListener('click', () => captureAt(4096, 4096, 'isomium-moon-v5-square'));
  btnPresetReal.addEventListener('click', () => setPreset('real'));
  btnPresetCrescent.addEventListener('click', () => setPreset('crescent'));
  btnPresetWallpaper.addEventListener('click', () => setPreset('wallpaper'));
  btnResetCamera.addEventListener('click', resetCamera);

  jsonFile.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    jsonInput.value = text;
    applyJsonFromText();
    jsonFile.value = '';
  });
}

function setPreset(name) {
  Object.assign(params, PRESETS[name]);
  clampParams();
  applyParams({ rebuildMoon: true, rebuildStars: true, updateJson: true, refreshControls: true });
  setStatus(`Preset aplicado: ${params.sceneProfile}`);
}

function resetCamera() {
  camera.position.set(0, 0, params.distance);
  controls.target.set(params.offsetX, params.offsetY, 0);
  controls.update();
}

function toggleControlsPanel() {
  document.body.classList.toggle('controls-open');
}
function toggleJsonPanel() {
  document.body.classList.toggle('json-open');
  updateJsonText();
}

function updateJsonText() {
  jsonInput.value = JSON.stringify({
    engine: 'ISOMIUM Moon Realistic Engine',
    version: VERSION,
    instructions: 'Edite params e clique em Aplicar JSON. Também aceita JSON parcial, por exemplo: { "params": { "sunAzimuth": -80 } }.',
    params: structuredClone(params)
  }, null, 2);

  setStatus('JSON atualizado.');
}

function applyJsonFromText() {
  try {
    const parsed = JSON.parse(jsonInput.value);
    const incoming = parsed.params && typeof parsed.params === 'object' ? parsed.params : parsed;

    const rebuildMoonKeys = new Set([
      'seed', 'textureResolution', 'craterCount', 'craterStrength', 'craterRimStrength',
      'craterMinRadius', 'craterMaxRadius', 'mareStrength', 'mareSoftness',
      'highlandNoise', 'microRelief', 'ejectaStrength', 'moonContrast', 'regolithTint'
    ]);

    let rebuildMoon = false;
    let rebuildStars = false;

    for (const [key, value] of Object.entries(incoming)) {
      if (!(key in params)) continue;
      params[key] = value;
      if (rebuildMoonKeys.has(key)) rebuildMoon = true;
      if (key === 'starCount' || key === 'seed') rebuildStars = true;
    }

    clampParams();
    applyParams({ rebuildMoon, rebuildStars, updateJson: true, refreshControls: true });
    setStatus('JSON aplicado com sucesso.');
  } catch (error) {
    setStatus(`Erro no JSON: ${error.message}`, true);
  }
}

function clampParams() {
  params.textureResolution = clampInt(params.textureResolution, 512, 4096);
  params.craterCount = clampInt(params.craterCount, 0, 2200);
  params.craterMinRadius = clampNumber(params.craterMinRadius, 0.001, 0.03);
  params.craterMaxRadius = clampNumber(params.craterMaxRadius, params.craterMinRadius, 0.09);
  params.bumpScale = clampNumber(params.bumpScale, 0, 0.25);
  params.displacementScale = clampNumber(params.displacementScale, 0, 0.02);
  params.ambientIntensity = clampNumber(params.ambientIntensity, 0, 1);
  params.lightIntensity = clampNumber(params.lightIntensity, 0, 12);
  params.freeWidth = clampInt(params.freeWidth, 320, 12000);
  params.freeHeight = clampInt(params.freeHeight, 320, 12000);
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(jsonInput.value);
    setStatus('JSON copiado.');
  } catch {
    setStatus('Não foi possível copiar automaticamente.', true);
  }
}

function downloadJson() {
  const blob = new Blob([jsonInput.value], { type: 'application/json' });
  downloadBlob(blob, 'isomium-moon-config.json');
  setStatus('JSON baixado.');
}

async function captureAt(width, height, filename) {
  width = clampInt(width, 320, 12000);
  height = clampInt(height, 320, 12000);
  captureStatusEl.style.display = 'block';

  await nextFrame();

  const oldRatio = renderer.getPixelRatio();
  const oldSize = new THREE.Vector2();
  renderer.getSize(oldSize);
  const oldAspect = camera.aspect;

  try {
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    const processed = buildProcessedCanvas(renderer.domElement, width, height);
    processed.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${filename}-${width}x${height}.png`);
    }, 'image/png');

    flash();
  } finally {
    renderer.setPixelRatio(oldRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    captureStatusEl.style.display = 'none';
  }
}

function buildProcessedCanvas(sourceCanvas, width, height) {
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const ctx = output.getContext('2d', { willReadFrequently: true });

  if (params.bloomMin > 0.001) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.14, params.bloomMin * 4);
    ctx.filter = `blur(${Math.max(2, Math.round(Math.min(width, height) * 0.004))}px) brightness(1.18)`;
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
    ctx.restore();
  }

  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  applyTone(ctx, width, height);
  drawVignette(ctx, width, height, params.vignette);

  if (params.showReticle) drawReticle(ctx, width, height);
  if (params.labelOverlay) drawLabel(ctx, width, height, params.labelText);
  if (params.filmDust > 0) drawFilmDust(ctx, width, height, params.filmDust);

  return output;
}

function applyTone(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const noise = params.sensorNoise * 255;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (params.cameraMono) {
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = g = b = gray;
    }

    if (noise > 0.01) {
      const n = (Math.random() - 0.5) * noise;
      r += n;
      g += n;
      b += n;
    }

    data[i] = clamp255(r);
    data[i + 1] = clamp255(g);
    data[i + 2] = clamp255(b);
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawVignette(ctx, width, height, amount) {
  if (amount <= 0) return;

  const gradient = ctx.createRadialGradient(
    width * 0.5, height * 0.5, Math.min(width, height) * 0.22,
    width * 0.5, height * 0.5, Math.max(width, height) * 0.72
  );

  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.65, `rgba(0,0,0,${amount * 0.18})`);
  gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.9, amount)})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawReticle(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(20,20,20,0.55)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.00075));
  const cols = 5;
  const rows = 4;
  const size = Math.min(width, height) * 0.014;

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

function drawLabel(ctx, width, height, text) {
  ctx.save();
  const pad = Math.max(18, Math.round(Math.min(width, height) * 0.018));
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.018));
  ctx.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = fontSize * 0.7;
  ctx.fillText(text, pad, height - pad);
  ctx.restore();
}

function drawFilmDust(ctx, width, height, amount) {
  ctx.save();
  ctx.globalAlpha = Math.min(0.4, amount);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  const specks = Math.floor((width * height / 110000) * amount * 10);
  for (let i = 0; i < specks; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * Math.max(0.5, Math.min(width, height) * 0.0007);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function animate() {
  requestAnimationFrame(animate);

  if (moonMesh && params.moonSpinSpeed > 0) {
    moonMesh.rotation.y += params.moonSpinSpeed;
  }
  if (starField) starField.rotation.y += 0.00008;

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === 'h') document.body.classList.toggle('ui-hidden');
  if (key === 'j') toggleJsonPanel();
  if (key === 'c') toggleControlsPanel();
}

function setStatus(message, isError = false) {
  jsonStatus.textContent = message;
  jsonStatus.style.color = isError ? '#ff9a9a' : 'rgba(245,245,247,0.62)';
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function flash() {
  flashEl.style.opacity = '0.92';
  setTimeout(() => { flashEl.style.opacity = '0'; }, 80);
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function disposeObject(object) {
  object.traverse?.((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        for (const key of Object.keys(material)) {
          const value = material[key];
          if (value && typeof value.dispose === 'function') value.dispose();
        }
        material.dispose();
      });
    }
  });
}

function directionFromAzimuthElevation(azDeg, elDeg) {
  const az = THREE.MathUtils.degToRad(azDeg);
  const el = THREE.MathUtils.degToRad(elDeg);
  return new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el)
  ).normalize();
}

function normalizeHeight(data) {
  let min = Infinity;
  let max = -Infinity;
  for (const h of data) {
    if (h < min) min = h;
    if (h > max) max = h;
  }
  const range = Math.max(0.0001, max - min);
  for (let i = 0; i < data.length; i++) {
    data[i] = 0.12 + ((data[i] - min) / range) * 0.76;
  }
}

function smoothBell(d, inner, outer) {
  const t = smoothstep(inner, outer, d);
  return Math.pow(1 - t, 1.6);
}

function smoothstep(edge0, edge1, x) {
  const t = clampNumber((x - edge0) / Math.max(0.000001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function fbmPeriodic(u, v, scaleX, scaleY, octaves) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    value += periodicValueNoise(u * scaleX * freq, v * scaleY * freq, scaleX * freq, scaleY * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }

  return value / norm;
}

function periodicValueNoise(x, y, px, py) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const x0 = mod(xi, px);
  const y0 = mod(yi, py);
  const x1 = mod(xi + 1, px);
  const y1 = mod(yi + 1, py);

  const a = hash2(x0, y0);
  const b = hash2(x1, y0);
  const c = hash2(x0, y1);
  const d = hash2(x1, y1);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wrapDistanceSigned(a, b) {
  let d = a - b;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatValue(value, step = 1) {
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  const decimals = step >= 1 ? 0 : String(step).split('.')[1]?.length || 2;
  return Number(value).toFixed(decimals);
}

function clamp255(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clampInt(value, min, max) {
  return Math.round(clampNumber(value, min, max));
}
