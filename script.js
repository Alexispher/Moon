import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('space-canvas');
const flashEl = document.getElementById('flash');
const jsonInput = document.getElementById('json-input');
const jsonStatus = document.getElementById('json-status');
const jsonFile = document.getElementById('json-file');
const captureStatusEl = document.getElementById('capture-status');

const btnToggleJson = document.getElementById('btn-toggle-json');
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

const MOON_RADIUS = 5.2;
const VERSION = '4.0.0';

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
let animationId;

const params = {
  sceneProfile: 'Lua Realista Premium',

  // Composição
  fov: 20.8,
  distance: 17.8,
  offsetX: 0.0,
  offsetY: 0.04,
  frameRotationZ: -0.8,
  subjectScale: 1.0,

  // Sol / iluminação
  sunVisible: false,
  sunAzimuth: -42,
  sunElevation: 7,
  sunDistance: 180,
  sunScale: 8,
  lightIntensity: 3.85,
  ambientIntensity: 0.001,
  exposure: 0.96,

  // Lua procedural
  seed: 87234,
  textureResolution: 2048,
  moonBrightness: 0.94,
  moonContrast: 1.24,
  regolithTint: 0.035,
  roughness: 1.0,
  normalStrength: 2.45,
  displacementScale: 0.018,
  rotateMoonY: -21,
  rotateMoonX: 2.4,
  moonSpinSpeed: 0.0,

  // Superfície lunar
  craterCount: 760,
  craterStrength: 0.34,
  craterRimStrength: 0.16,
  craterMinRadius: 0.0028,
  craterMaxRadius: 0.038,
  mareStrength: 0.66,
  mareSoftness: 0.86,
  highlandNoise: 0.42,
  microRelief: 0.22,
  ejectaStrength: 0.035,

  // Câmera / pós
  cameraMono: false,
  sensorNoise: 0.003,
  vignette: 0.11,
  bloomMin: 0.003,
  filmDust: 0.0,
  showReticle: false,
  labelOverlay: false,
  labelText: 'ISOMIUM • Lua realista',

  // Fundo
  starCount: 160,
  starSize: 0.012,
  starBrightness: 0.25,
  showStars: true,
  backgroundGradient: 0.003,

  // Captura
  freeWidth: 4096,
  freeHeight: 4096
};

const PRESETS = {
  real: {
    sceneProfile: 'Lua Realista Premium',
    fov: 20.8,
    distance: 17.8,
    offsetX: 0.0,
    offsetY: 0.04,
    frameRotationZ: -0.8,
    subjectScale: 1.0,
    sunVisible: false,
    sunAzimuth: -42,
    sunElevation: 7,
    lightIntensity: 3.85,
    ambientIntensity: 0.001,
    exposure: 0.96,
    seed: 87234,
    textureResolution: 2048,
    moonBrightness: 0.94,
    moonContrast: 1.24,
    regolithTint: 0.035,
    normalStrength: 2.45,
    displacementScale: 0.018,
    rotateMoonY: -21,
    rotateMoonX: 2.4,
    moonSpinSpeed: 0.0,
    craterCount: 760,
    craterStrength: 0.34,
    craterRimStrength: 0.16,
    craterMinRadius: 0.0028,
    craterMaxRadius: 0.038,
    mareStrength: 0.66,
    mareSoftness: 0.86,
    highlandNoise: 0.42,
    microRelief: 0.22,
    ejectaStrength: 0.035,
    cameraMono: false,
    sensorNoise: 0.003,
    vignette: 0.11,
    bloomMin: 0.003,
    filmDust: 0,
    showReticle: false,
    starCount: 160,
    starBrightness: 0.25,
    showStars: true,
    backgroundGradient: 0.003
  },

  crescent: {
    sceneProfile: 'Lua Crescente Realista',
    fov: 19.6,
    distance: 17.0,
    offsetX: -0.35,
    offsetY: 0.08,
    frameRotationZ: -2.2,
    subjectScale: 1.06,
    sunVisible: false,
    sunAzimuth: -84,
    sunElevation: 5,
    lightIntensity: 4.2,
    ambientIntensity: 0.000,
    exposure: 0.92,
    seed: 99815,
    textureResolution: 2048,
    moonBrightness: 0.90,
    moonContrast: 1.36,
    regolithTint: 0.025,
    normalStrength: 2.65,
    displacementScale: 0.018,
    rotateMoonY: -31,
    rotateMoonX: 2.0,
    moonSpinSpeed: 0.0,
    craterCount: 720,
    craterStrength: 0.34,
    craterRimStrength: 0.15,
    craterMinRadius: 0.0025,
    craterMaxRadius: 0.034,
    mareStrength: 0.64,
    mareSoftness: 0.88,
    highlandNoise: 0.45,
    microRelief: 0.24,
    ejectaStrength: 0.030,
    cameraMono: false,
    sensorNoise: 0.004,
    vignette: 0.17,
    bloomMin: 0.004,
    filmDust: 0,
    showReticle: false,
    starCount: 320,
    starBrightness: 0.34,
    showStars: true,
    backgroundGradient: 0.001
  },

  wallpaper: {
    sceneProfile: 'Lua Wallpaper Isomium',
    fov: 18.4,
    distance: 15.6,
    offsetX: -2.1,
    offsetY: 0.12,
    frameRotationZ: -3.4,
    subjectScale: 1.24,
    sunVisible: false,
    sunAzimuth: -66,
    sunElevation: 8,
    lightIntensity: 4.0,
    ambientIntensity: 0.0005,
    exposure: 0.94,
    seed: 42219,
    textureResolution: 2048,
    moonBrightness: 0.91,
    moonContrast: 1.30,
    regolithTint: 0.020,
    normalStrength: 2.55,
    displacementScale: 0.017,
    rotateMoonY: -26,
    rotateMoonX: 3,
    moonSpinSpeed: 0.0,
    craterCount: 680,
    craterStrength: 0.32,
    craterRimStrength: 0.13,
    craterMinRadius: 0.0025,
    craterMaxRadius: 0.033,
    mareStrength: 0.70,
    mareSoftness: 0.90,
    highlandNoise: 0.43,
    microRelief: 0.20,
    ejectaStrength: 0.026,
    cameraMono: true,
    sensorNoise: 0.002,
    vignette: 0.12,
    bloomMin: 0.004,
    filmDust: 0,
    showReticle: false,
    starCount: 0,
    starBrightness: 0,
    showStars: false,
    backgroundGradient: 0.0
  }
};

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
  bindUI();
  applyParams({ rebuildMoon: true, rebuildStars: true, updateJson: true });
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
    normalMap: textures.normal,
    normalScale: new THREE.Vector2(params.normalStrength, params.normalStrength),
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
  const requested = Math.floor(params.textureResolution || 2048);
  const width = clampInt(requested, 512, 4096);
  const height = Math.floor(width / 2);

  const prng = mulberry32(params.seed >>> 0);
  const heightData = new Float32Array(width * height);
  const mareData = new Float32Array(width * height);

  // Base: relevo amplo e micro relevo sem faixas horizontais visíveis.
  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const lat = Math.abs(v - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const i = y * width + x;

      const mare = computeMareMask(u, v, params.mareSoftness);
      const highland =
        fbm(u * 9.0 + 13.1, v * 7.0 + 4.7, 5) * params.highlandNoise +
        fbm(u * 36.0 + 1.7, v * 20.0 + 8.2, 3) * params.microRelief * 0.42;

      let h = 0.50;
      h += highland * 0.15;
      h += lat * 0.020;
      h -= mare * params.mareStrength * 0.115;

      heightData[i] = h;
      mareData[i] = mare;
    }
  }

  addCraters(heightData, mareData, width, height, prng);

  normalizeHeight(heightData);

  const albedoCanvas = document.createElement('canvas');
  const normalCanvas = document.createElement('canvas');
  const heightCanvas = document.createElement('canvas');

  albedoCanvas.width = normalCanvas.width = heightCanvas.width = width;
  albedoCanvas.height = normalCanvas.height = heightCanvas.height = height;

  const albedoCtx = albedoCanvas.getContext('2d', { willReadFrequently: true });
  const normalCtx = normalCanvas.getContext('2d', { willReadFrequently: true });
  const heightCtx = heightCanvas.getContext('2d', { willReadFrequently: true });

  const albedoImage = albedoCtx.createImageData(width, height);
  const normalImage = normalCtx.createImageData(width, height);
  const heightImage = heightCtx.createImageData(width, height);

  const tint = params.regolithTint;
  const contrast = params.moonContrast;
  const normalAmp = 3.25;

  for (let y = 0; y < height; y++) {
    const yUp = Math.max(0, y - 1);
    const yDn = Math.min(height - 1, y + 1);

    for (let x = 0; x < width; x++) {
      const xL = (x - 1 + width) % width;
      const xR = (x + 1) % width;
      const i = y * width + x;
      const idx = i * 4;

      const h = heightData[i];
      const mare = mareData[i];

      const smallVariation =
        fbm((x / width) * 180.0 + 2.1, (y / height) * 90.0 + 9.5, 2) * 7.0 +
        fbm((x / width) * 30.0 + 17.0, (y / height) * 20.0 + 3.0, 3) * 6.0;

      // Albedo discreto: nada de contorno branco de cratera.
      let shade = 138;
      shade += (h - 0.5) * 86;
      shade -= mare * 28;
      shade += smallVariation;
      shade = (shade - 128) * contrast + 128;

      albedoImage.data[idx] = clamp255(shade * (1.0 + tint * 0.08));
      albedoImage.data[idx + 1] = clamp255(shade * (1.0 + tint * 0.025));
      albedoImage.data[idx + 2] = clamp255(shade * (1.0 - tint * 0.06));
      albedoImage.data[idx + 3] = 255;

      const hL = heightData[y * width + xL];
      const hR = heightData[y * width + xR];
      const hU = heightData[yUp * width + x];
      const hD = heightData[yDn * width + x];

      const dx = (hR - hL) * normalAmp;
      const dy = (hD - hU) * normalAmp;

      const n = normalize3(-dx, -dy, 1.0);
      normalImage.data[idx] = clamp255((n.x * 0.5 + 0.5) * 255);
      normalImage.data[idx + 1] = clamp255((n.y * 0.5 + 0.5) * 255);
      normalImage.data[idx + 2] = clamp255((n.z * 0.5 + 0.5) * 255);
      normalImage.data[idx + 3] = 255;

      const hv = clamp255(h * 255);
      heightImage.data[idx] = hv;
      heightImage.data[idx + 1] = hv;
      heightImage.data[idx + 2] = hv;
      heightImage.data[idx + 3] = 255;
    }
  }

  albedoCtx.putImageData(albedoImage, 0, 0);
  normalCtx.putImageData(normalImage, 0, 0);
  heightCtx.putImageData(heightImage, 0, 0);

  const albedo = new THREE.CanvasTexture(albedoCanvas);
  const normal = new THREE.CanvasTexture(normalCanvas);
  const heightTexture = new THREE.CanvasTexture(heightCanvas);

  albedo.colorSpace = THREE.SRGBColorSpace;
  normal.colorSpace = THREE.NoColorSpace;
  heightTexture.colorSpace = THREE.NoColorSpace;

  for (const texture of [albedo, normal, heightTexture]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
  }

  return { albedo, normal, height: heightTexture };
}

function addCraters(heightData, mareData, width, height, prng) {
  const count = clampInt(params.craterCount, 0, 3500);
  const minR = clampNumber(params.craterMinRadius, 0.001, 0.03);
  const maxR = clampNumber(params.craterMaxRadius, minR, 0.09);

  for (let c = 0; c < count; c++) {
    const u = prng();
    const v = 0.04 + prng() * 0.92;

    // A maioria das crateras deve ser pequena. Poucas crateras grandes.
    const sizeBias = Math.pow(prng(), 2.7);
    const r = minR + sizeBias * (maxR - minR);
    const elliptic = 0.82 + prng() * 0.34;
    const depth = params.craterStrength * (0.028 + r * 0.34) * (0.65 + prng() * 0.55);
    const rim = params.craterRimStrength * (0.012 + r * 0.14) * (0.65 + prng() * 0.45);
    const angle = prng() * Math.PI * 2;

    const px = Math.max(2, Math.ceil(r * width * 1.45));
    const py = Math.max(2, Math.ceil(r * height * 2.6));

    const cx = Math.floor(u * width);
    const cy = Math.floor(v * height);

    for (let yy = cy - py; yy <= cy + py; yy++) {
      if (yy < 0 || yy >= height) continue;

      const vv = yy / (height - 1);
      const latScale = Math.max(0.35, Math.cos((vv - 0.5) * Math.PI));

      for (let xx = cx - px; xx <= cx + px; xx++) {
        const wrappedX = (xx + width) % width;
        const uu = wrappedX / width;

        let du = wrapDistance(uu, u) / Math.max(0.0001, r / latScale);
        let dv = (vv - v) / Math.max(0.0001, r * elliptic * 2.0);

        const ca = Math.cos(angle);
        const sa = Math.sin(angle);
        const rx = du * ca - dv * sa;
        const ry = du * sa + dv * ca;
        const d = Math.sqrt(rx * rx + ry * ry);

        if (d > 1.55) continue;

        const i = yy * width + wrappedX;
        const mare = mareData[i];

        // Em mares lunares, crateras visualmente ficam um pouco mais suaves.
        const localSoftening = 1.0 - mare * 0.30;

        const bowl = -depth * smoothBell(d, 0.0, 1.0) * localSoftening;
        const rimShape = Math.exp(-Math.pow((d - 1.0) / 0.115, 2.0));
        const outerSlope = -depth * 0.18 * Math.exp(-Math.pow((d - 1.23) / 0.22, 2.0));
        const rimValue = rim * rimShape * localSoftening;

        heightData[i] += bowl + rimValue + outerSlope;

        if (params.ejectaStrength > 0 && r > maxR * 0.45 && d > 1.0 && d < 1.55) {
          const radialNoise = fbm(uu * 120.0 + c * 3.1, vv * 70.0 + c * 5.3, 2);
          heightData[i] += params.ejectaStrength * r * 0.55 * radialNoise * (1.55 - d);
        }
      }
    }
  }
}

function computeMareMask(u, v, softness = 0.86) {
  // Distribuição inspirada nos mares do lado visível, mas não é textura NASA.
  const patches = [
    [0.595, 0.405, 0.105, 0.070, -0.12, 1.00],
    [0.650, 0.500, 0.150, 0.095, 0.18, 0.95],
    [0.530, 0.530, 0.095, 0.065, -0.18, 0.78],
    [0.704, 0.382, 0.083, 0.055, 0.10, 0.72],
    [0.458, 0.452, 0.065, 0.045, 0.14, 0.55],
    [0.742, 0.580, 0.057, 0.042, -0.05, 0.48],
    [0.338, 0.536, 0.060, 0.040, -0.20, 0.38]
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
    const n = fbm(u * 21.0 + cx * 9.0, v * 15.0 + cy * 11.0, 3) * 0.17;
    const edge = 1.0 - smoothstep(0.72 + n, 1.08 + softness * 0.16, d);
    m += edge * strength;
  }

  return clampNumber(m, 0, 1);
}

function createStars() {
  if (starField) {
    scene.remove(starField);
    disposeObject(starField);
  }

  const count = clampInt(params.starCount, 0, 8000);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const prng = mulberry32((params.seed + 1013904223) >>> 0);

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
  const texture = createSunTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  sunDisc = new THREE.Sprite(material);
  scene.add(sunDisc);
}

function createSunTexture() {
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
  return texture;
}

function applyParams(options = {}) {
  const rebuildMoon = !!options.rebuildMoon;
  const rebuildStars = !!options.rebuildStars;
  const updateJson = !!options.updateJson;

  if (rebuildMoon) createMoon();
  if (rebuildStars) createStars();

  renderer.toneMappingExposure = params.exposure;

  const lift = clampNumber(params.backgroundGradient, 0, 0.5);
  scene.background = new THREE.Color(lift * 0.12, lift * 0.13, lift * 0.16);

  camera.fov = params.fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = params.distance;

  controls.target.set(params.offsetX, params.offsetY, 0);
  controls.update();

  moonGroup.position.set(params.offsetX, params.offsetY, 0);
  moonGroup.scale.setScalar(params.subjectScale);
  moonGroup.rotation.z = THREE.MathUtils.degToRad(params.frameRotationZ);

  if (moonMesh) {
    moonMesh.rotation.x = THREE.MathUtils.degToRad(params.rotateMoonX);
    moonMesh.rotation.y = THREE.MathUtils.degToRad(params.rotateMoonY);
    moonMesh.material.roughness = params.roughness;
    moonMesh.material.normalScale.set(params.normalStrength, params.normalStrength);
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

  if (updateJson) {
    updateJsonText();
  }
}

function bindUI() {
  btnToggleJson.addEventListener('click', toggleJsonPanel);
  btnCloseJson.addEventListener('click', () => document.body.classList.remove('json-open'));

  btnApplyJson.addEventListener('click', () => applyJsonFromText());
  btnExportJson.addEventListener('click', updateJsonText);
  btnCopyJson.addEventListener('click', copyJson);
  btnDownloadJson.addEventListener('click', downloadJson);
  btnCaptureFree.addEventListener('click', () => captureAt(params.freeWidth, params.freeHeight, 'isomium-moon-v4-free'));
  btnExport4k.addEventListener('click', () => captureAt(3840, 2160, 'isomium-moon-v4-4k'));
  btnExportSquare.addEventListener('click', () => captureAt(4096, 4096, 'isomium-moon-v4-square'));

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
  applyParams({ rebuildMoon: true, rebuildStars: true, updateJson: true });
  setStatus(`Preset aplicado: ${params.sceneProfile}`);
}

function resetCamera() {
  camera.position.set(0, 0, params.distance);
  controls.target.set(params.offsetX, params.offsetY, 0);
  controls.update();
}

function toggleJsonPanel() {
  document.body.classList.toggle('json-open');
  updateJsonText();
}

function updateJsonText() {
  jsonInput.value = JSON.stringify({
    engine: 'ISOMIUM Moon Realistic Engine',
    version: VERSION,
    instructions: 'Edite params e clique em Aplicar JSON. Também aceita JSON parcial: { "params": { "sunAzimuth": -80 } } ou { "sunAzimuth": -80 }.',
    params: structuredClone(params)
  }, null, 2);

  setStatus('JSON atualizado.');
}

function applyJsonFromText() {
  try {
    const parsed = JSON.parse(jsonInput.value);
    const incoming = parsed.params && typeof parsed.params === 'object' ? parsed.params : parsed;

    const rebuildKeys = new Set([
      'seed',
      'textureResolution',
      'craterCount',
      'craterStrength',
      'craterRimStrength',
      'craterMinRadius',
      'craterMaxRadius',
      'mareStrength',
      'mareSoftness',
      'highlandNoise',
      'microRelief',
      'ejectaStrength',
      'moonContrast',
      'regolithTint'
    ]);

    let rebuildMoon = false;
    let rebuildStars = false;

    for (const [key, value] of Object.entries(incoming)) {
      if (!(key in params)) continue;
      params[key] = value;
      if (rebuildKeys.has(key)) rebuildMoon = true;
      if (key === 'starCount' || key === 'seed') rebuildStars = true;
    }

    clampParams();
    applyParams({ rebuildMoon, rebuildStars, updateJson: true });
    setStatus('JSON aplicado com sucesso.');
  } catch (error) {
    setStatus(`Erro no JSON: ${error.message}`, true);
  }
}

function clampParams() {
  params.textureResolution = clampInt(params.textureResolution, 512, 4096);
  params.craterCount = clampInt(params.craterCount, 0, 3500);
  params.craterMinRadius = clampNumber(params.craterMinRadius, 0.001, 0.03);
  params.craterMaxRadius = clampNumber(params.craterMaxRadius, params.craterMinRadius, 0.09);
  params.normalStrength = clampNumber(params.normalStrength, 0, 6);
  params.displacementScale = clampNumber(params.displacementScale, 0, 0.08);
  params.ambientIntensity = clampNumber(params.ambientIntensity, 0, 1);
  params.lightIntensity = clampNumber(params.lightIntensity, 0, 12);
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
    ctx.globalAlpha = Math.min(0.18, params.bloomMin * 3);
    ctx.filter = `blur(${Math.max(2, Math.round(Math.min(width, height) * 0.005))}px) brightness(1.25)`;
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
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.22,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.72
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
  animationId = requestAnimationFrame(animate);

  if (moonMesh && params.moonSpinSpeed > 0) {
    moonMesh.rotation.y += params.moonSpinSpeed;
  }

  if (starField) {
    starField.rotation.y += 0.00008;
  }

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
  setTimeout(() => {
    flashEl.style.opacity = '0';
  }, 80);
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
    data[i] = 0.08 + ((data[i] - min) / range) * 0.84;
  }
}

function smoothBell(d, inner, outer) {
  const t = smoothstep(inner, outer, d);
  return Math.pow(1 - t, 1.75);
}

function smoothstep(edge0, edge1, x) {
  const t = clampNumber((x - edge0) / Math.max(0.000001, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function fbm(x, y, octaves) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }

  return value / norm;
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

  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wrapDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

function wrapDistanceSigned(a, b) {
  let d = a - b;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

function normalize3(x, y, z) {
  const l = Math.hypot(x, y, z) || 1;
  return { x: x / l, y: y / l, z: z / l };
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
