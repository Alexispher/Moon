import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('space-canvas');
const flashEl = document.getElementById('flash');
const filmOverlayEl = document.getElementById('film-overlay');
const captureStatusEl = document.getElementById('capture-status');
const phonePreviewEl = document.getElementById('phone-preview');
const jsonPanelEl = document.getElementById('json-panel');
const jsonInputEl = document.getElementById('json-input');
const jsonStatusEl = document.getElementById('json-status');

const btnToggleUI = document.getElementById('btn-toggle-ui');
const btnExport4K = document.getElementById('btn-export-4k');
const btnExportVertical = document.getElementById('btn-export-vertical');
const btnExportSquare = document.getElementById('btn-export-square');
const btnExportIphone = document.getElementById('btn-export-iphone');
const btnExportFree = document.getElementById('btn-export-free');
const btnJson = document.getElementById('btn-json');
const btnCloseJson = document.getElementById('btn-close-json');
const btnApplyJson = document.getElementById('btn-apply-json');
const btnExportJson = document.getElementById('btn-export-json');
const btnCopyJson = document.getElementById('btn-copy-json');
const btnDownloadJson = document.getElementById('btn-download-json');
const jsonFileEl = document.getElementById('json-file');

const ENGINE_NAME = 'ISOMIUM Moon Realistic Engine';
const ENGINE_VERSION = '3.0.0';
const MOON_RADIUS = 5.25;

let scene;
let camera;
let renderer;
let controls;
let clock;
let moonGroup;
let moonMesh;
let sunLight;
let ambientLight;
let sunSprite;
let sunTarget;
let starField;
let satelliteGroup;
let orbitLineGroup;
let moonAlbedoTexture;
let moonHeightTexture;
let currentTextureSignature = '';
let captureInProgress = false;

const params = {
  sceneProfile: 'Lua Realista Premium',
  phoneOrientation: 'Vertical',
  showPhoneFrame: false,
  keepPhoneGuideInFreeMode: false,

  // composição
  fov: 19.8,
  distance: 17.4,
  offsetX: -0.08,
  offsetY: 0.10,
  frameRotationZ: -1.4,
  subjectScale: 1.08,

  // luz solar real da cena
  sunAzimuth: -38,
  sunElevation: 8,
  sunDistance: 150,
  sunVisible: false,
  sunScale: 8.5,
  sunFlare: 0.18,
  lightIntensity: 3.65,
  ambientIntensity: 0.006,

  // lua procedural
  seed: 73421,
  textureResolution: 3072,
  moonBrightness: 1.02,
  moonContrast: 1.18,
  regolithTint: 0.035,
  roughness: 1.0,
  bumpScale: 0.046,
  moonSpinSpeed: 0.00010,
  rotateMoonY: -24,
  rotateMoonX: 3.0,
  craterCount: 1500,
  craterStrength: 0.78,
  craterRimStrength: 0.40,
  mareStrength: 0.68,
  mareSoftness: 0.82,
  highlandNoise: 0.34,
  microRelief: 0.28,
  limbGlow: 0.0,

  // elementos extras: desligados por padrão para manter realismo
  showEarth: false,
  showSatellites: false,
  satelliteCount: 3,
  satelliteScale: 0.18,
  satelliteOrbitRadius: 9.4,
  satelliteOrbitTilt: 24,
  satelliteSpeed: 0.055,
  satelliteBrightness: 0.72,
  showOrbitLines: false,
  orbitLineOpacity: 0.06,

  // visual científico opcional
  showWaterHydrogen: false,
  waterSignalStrength: 0.16,
  showPolarIceHint: false,
  showTerminatorLine: false,

  // câmera / pós
  cameraMono: false,
  sensorNoise: 0.006,
  vignette: 0.13,
  bloomMin: 0.010,
  filmDust: 0.0,
  showReticle: false,
  labelOverlay: false,
  labelText: 'ISOMIUM • Lua realista',
  exposure: 1.0,

  // fundo
  starCount: 280,
  starSize: 0.014,
  starBrightness: 0.36,
  showStars: true,
  backgroundGradient: 0.012,

  // exportação livre
  freeWidth: 4096,
  freeHeight: 4096
};

const PRESETS = {
  realista: {
    sceneProfile: 'Lua Realista Premium',
    fov: 19.8,
    distance: 17.4,
    offsetX: -0.08,
    offsetY: 0.10,
    frameRotationZ: -1.4,
    subjectScale: 1.08,
    sunAzimuth: -38,
    sunElevation: 8,
    sunVisible: false,
    sunScale: 8.5,
    sunFlare: 0.18,
    lightIntensity: 3.65,
    ambientIntensity: 0.006,
    seed: 73421,
    textureResolution: 3072,
    moonBrightness: 1.02,
    moonContrast: 1.18,
    regolithTint: 0.035,
    roughness: 1,
    bumpScale: 0.046,
    moonSpinSpeed: 0.0001,
    rotateMoonY: -24,
    rotateMoonX: 3,
    craterCount: 1500,
    craterStrength: 0.78,
    craterRimStrength: 0.40,
    mareStrength: 0.68,
    mareSoftness: 0.82,
    highlandNoise: 0.34,
    microRelief: 0.28,
    limbGlow: 0,
    showEarth: false,
    showSatellites: false,
    showOrbitLines: false,
    showWaterHydrogen: false,
    showPolarIceHint: false,
    cameraMono: false,
    sensorNoise: 0.006,
    vignette: 0.13,
    bloomMin: 0.01,
    filmDust: 0,
    showReticle: false,
    labelOverlay: false,
    exposure: 1.0,
    starCount: 280,
    starSize: 0.014,
    starBrightness: 0.36,
    showStars: true,
    backgroundGradient: 0.012,
    freeWidth: 4096,
    freeHeight: 4096
  },

  cinematico: {
    sceneProfile: 'Lua Cinemática Realista',
    fov: 17.4,
    distance: 16.3,
    offsetX: -0.72,
    offsetY: 0.20,
    frameRotationZ: -4.2,
    subjectScale: 1.18,
    sunAzimuth: -58,
    sunElevation: 11,
    sunVisible: false,
    sunFlare: 0.22,
    lightIntensity: 3.9,
    ambientIntensity: 0.004,
    seed: 84290,
    textureResolution: 3072,
    moonBrightness: 0.98,
    moonContrast: 1.28,
    regolithTint: 0.02,
    bumpScale: 0.052,
    rotateMoonY: -31,
    rotateMoonX: 4.5,
    craterCount: 1700,
    craterStrength: 0.82,
    craterRimStrength: 0.45,
    mareStrength: 0.72,
    mareSoftness: 0.86,
    highlandNoise: 0.38,
    microRelief: 0.30,
    limbGlow: 0,
    showEarth: false,
    showSatellites: false,
    showOrbitLines: false,
    cameraMono: false,
    sensorNoise: 0.008,
    vignette: 0.18,
    bloomMin: 0.016,
    filmDust: 0,
    showReticle: false,
    labelOverlay: false,
    exposure: 0.96,
    starCount: 420,
    starSize: 0.014,
    starBrightness: 0.44,
    showStars: true,
    backgroundGradient: 0.018,
    freeWidth: 4096,
    freeHeight: 4096
  },

  apollo: {
    sceneProfile: 'Apollo P&B',
    phoneOrientation: 'Horizontal',
    fov: 24,
    distance: 15.8,
    offsetX: -0.2,
    offsetY: -0.06,
    frameRotationZ: 0.5,
    subjectScale: 1.08,
    sunAzimuth: -46,
    sunElevation: 12,
    sunVisible: false,
    lightIntensity: 3.35,
    ambientIntensity: 0.01,
    seed: 19469,
    textureResolution: 2048,
    moonBrightness: 1.08,
    moonContrast: 1.34,
    regolithTint: 0,
    bumpScale: 0.040,
    rotateMoonY: -19,
    rotateMoonX: 2,
    craterCount: 1250,
    craterStrength: 0.74,
    craterRimStrength: 0.36,
    mareStrength: 0.66,
    mareSoftness: 0.78,
    highlandNoise: 0.32,
    microRelief: 0.22,
    limbGlow: 0,
    showEarth: false,
    showSatellites: false,
    cameraMono: true,
    sensorNoise: 0.045,
    vignette: 0.25,
    bloomMin: 0.006,
    filmDust: 0.22,
    showReticle: true,
    labelOverlay: false,
    exposure: 0.93,
    starCount: 0,
    starBrightness: 0,
    showStars: false,
    backgroundGradient: 0,
    freeWidth: 4096,
    freeHeight: 3072
  },

  iphone: {
    sceneProfile: 'iPhone da Terra',
    showPhoneFrame: true,
    phoneOrientation: 'Vertical',
    fov: 8.2,
    distance: 112,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: 0,
    subjectScale: 0.42,
    sunAzimuth: 0,
    sunElevation: 0,
    sunVisible: false,
    lightIntensity: 2.7,
    ambientIntensity: 0,
    seed: 73421,
    textureResolution: 2048,
    moonBrightness: 1.40,
    moonContrast: 1.04,
    regolithTint: 0.035,
    bumpScale: 0.020,
    moonSpinSpeed: 0,
    rotateMoonY: -7,
    rotateMoonX: 0,
    craterCount: 1000,
    craterStrength: 0.58,
    craterRimStrength: 0.24,
    mareStrength: 0.54,
    mareSoftness: 0.80,
    highlandNoise: 0.20,
    microRelief: 0.12,
    limbGlow: 0,
    showEarth: false,
    showSatellites: false,
    cameraMono: false,
    sensorNoise: 0.028,
    vignette: 0.34,
    bloomMin: 0.060,
    filmDust: 0,
    showReticle: false,
    labelOverlay: false,
    exposure: 0.86,
    starCount: 80,
    starSize: 0.010,
    starBrightness: 0.24,
    showStars: true,
    backgroundGradient: 0.03,
    freeWidth: 1320,
    freeHeight: 2868
  }
};

const NUMERIC_LIMITS = {
  fov: [5, 80], distance: [4, 260], offsetX: [-50, 50], offsetY: [-50, 50], frameRotationZ: [-180, 180], subjectScale: [0.02, 8],
  sunAzimuth: [-180, 180], sunElevation: [-85, 85], sunDistance: [30, 500], sunScale: [0.1, 80], sunFlare: [0, 2], lightIntensity: [0, 12], ambientIntensity: [0, 1.2],
  seed: [1, 999999], textureResolution: [512, 4096], moonBrightness: [0.05, 3], moonContrast: [0.2, 2.6], regolithTint: [0, 1], roughness: [0.4, 1], bumpScale: [0, 0.18],
  moonSpinSpeed: [0, 0.04], rotateMoonY: [-180, 180], rotateMoonX: [-90, 90], craterCount: [0, 3500], craterStrength: [0, 1.5], craterRimStrength: [0, 1.2], mareStrength: [0, 1.5], mareSoftness: [0.1, 1.5], highlandNoise: [0, 1.2], microRelief: [0, 1.2], limbGlow: [0, 1],
  satelliteCount: [0, 24], satelliteScale: [0.02, 2], satelliteOrbitRadius: [5.8, 32], satelliteOrbitTilt: [-89, 89], satelliteSpeed: [0, 2], satelliteBrightness: [0, 2], orbitLineOpacity: [0, 1],
  waterSignalStrength: [0, 1.2], sensorNoise: [0, 0.25], vignette: [0, 1.2], bloomMin: [0, 0.35], filmDust: [0, 1], exposure: [0.1, 3.5],
  starCount: [0, 5000], starSize: [0.001, 0.12], starBrightness: [0, 1.2], backgroundGradient: [0, 0.5], freeWidth: [320, 12000], freeHeight: [320, 12000]
};

const TEXTURE_KEYS = new Set([
  'seed', 'textureResolution', 'craterCount', 'craterStrength', 'craterRimStrength',
  'mareStrength', 'mareSoftness', 'highlandNoise', 'microRelief', 'regolithTint'
]);

const STAR_KEYS = new Set(['starCount', 'starSize', 'starBrightness', 'showStars']);
const SATELLITE_KEYS = new Set(['showSatellites', 'satelliteCount', 'satelliteScale', 'satelliteOrbitRadius', 'satelliteOrbitTilt', 'satelliteBrightness', 'showOrbitLines', 'orbitLineOpacity']);

init();
animate();

function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(params.fov, window.innerWidth / window.innerHeight, 0.1, 2500);

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
  controls.dampingFactor = 0.055;
  controls.enablePan = true;
  controls.minDistance = 4;
  controls.maxDistance = 260;

  sunTarget = new THREE.Object3D();
  scene.add(sunTarget);

  sunLight = new THREE.DirectionalLight(0xffffff, params.lightIntensity);
  sunLight.target = sunTarget;
  scene.add(sunLight);

  ambientLight = new THREE.AmbientLight(0xffffff, params.ambientIntensity);
  scene.add(ambientLight);

  moonGroup = new THREE.Group();
  scene.add(moonGroup);

  createMoon();
  createSunSprite();
  createStars();
  buildSatellites();
  bindUI();
  exportConfigToTextarea();
  applyAll({ forceTexture: true, forceStars: true, forceSatellites: true });

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
}

function createMoon() {
  const geometry = new THREE.SphereGeometry(MOON_RADIUS, 256, 160);
  const textures = createMoonTextures();
  moonAlbedoTexture = textures.albedoTexture;
  moonHeightTexture = textures.heightTexture;

  const material = new THREE.MeshStandardMaterial({
    map: moonAlbedoTexture,
    bumpMap: moonHeightTexture,
    bumpScale: params.bumpScale,
    roughness: params.roughness,
    metalness: 0,
    color: 0xffffff
  });

  moonMesh = new THREE.Mesh(geometry, material);
  moonGroup.add(moonMesh);
}

function createSunSprite() {
  const texture = new THREE.CanvasTexture(createSunCanvas(512));
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    opacity: params.sunFlare
  });

  sunSprite = new THREE.Sprite(material);
  scene.add(sunSprite);
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
  const rng = mulberry32(98981 + Math.floor(params.seed));

  for (let i = 0; i < count; i++) {
    const radius = 450 + rng() * 1000;
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = 0.56 + rng() * 0.44;
    colors[i * 3] = c;
    colors[i * 3 + 1] = c;
    colors[i * 3 + 2] = Math.min(1, c + rng() * 0.06);
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

function buildSatellites() {
  if (satelliteGroup) {
    scene.remove(satelliteGroup);
    disposeObject3D(satelliteGroup);
  }
  if (orbitLineGroup) {
    scene.remove(orbitLineGroup);
    disposeObject3D(orbitLineGroup);
  }

  satelliteGroup = new THREE.Group();
  orbitLineGroup = new THREE.Group();
  scene.add(satelliteGroup);
  scene.add(orbitLineGroup);

  const count = Math.max(0, Math.floor(params.satelliteCount));
  const rng = mulberry32(33011 + Math.floor(params.seed));
  const satMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(params.satelliteBrightness, params.satelliteBrightness, params.satelliteBrightness) });

  for (let i = 0; i < count; i++) {
    const sat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.12), satMaterial.clone());
    sat.userData.angle = (i / Math.max(1, count)) * Math.PI * 2 + rng() * 0.4;
    sat.userData.radius = params.satelliteOrbitRadius * (0.92 + rng() * 0.18);
    sat.userData.speed = params.satelliteSpeed * (0.75 + rng() * 0.5);
    sat.scale.setScalar(params.satelliteScale);
    satelliteGroup.add(sat);
  }

  const orbitGeometry = new THREE.RingGeometry(params.satelliteOrbitRadius - 0.006, params.satelliteOrbitRadius + 0.006, 192);
  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: params.orbitLineOpacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
  orbitLine.rotation.x = Math.PI / 2;
  orbitLineGroup.add(orbitLine);
}

function bindUI() {
  btnToggleUI.addEventListener('click', () => toggleUI());
  btnExport4K.addEventListener('click', () => capturePreset('4k'));
  btnExportVertical.addEventListener('click', () => capturePreset('vertical4k'));
  btnExportSquare.addEventListener('click', () => capturePreset('square4096'));
  btnExportIphone.addEventListener('click', () => capturePreset('iphone17pm'));
  btnExportFree.addEventListener('click', () => captureFree());
  btnJson.addEventListener('click', () => jsonPanelEl.classList.toggle('open'));
  btnCloseJson.addEventListener('click', () => jsonPanelEl.classList.remove('open'));
  btnApplyJson.addEventListener('click', applyJsonFromTextarea);
  btnExportJson.addEventListener('click', exportConfigToTextarea);
  btnCopyJson.addEventListener('click', copyJsonToClipboard);
  btnDownloadJson.addEventListener('click', downloadJsonConfig);

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      applyPartialConfig(PRESETS[button.dataset.preset] || {}, { source: 'preset' });
      exportConfigToTextarea();
      setStatus(`Preset aplicado: ${button.textContent}.`, 'ok');
    });
  });

  jsonFileEl.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    jsonInputEl.value = text;
    applyJsonFromTextarea();
    jsonFileEl.value = '';
  });
}

function applyAll(options = {}) {
  renderer.toneMappingExposure = params.exposure;

  const bg = THREE.MathUtils.clamp(params.backgroundGradient, 0, 0.5);
  scene.background = new THREE.Color(bg * 0.10, bg * 0.11, bg * 0.15);

  applyCamera();
  applyMoonMaterial(options);
  applyLightAndSun();
  applyExtras();
  updatePhonePreview();
  updateFilmOverlay();

  if (options.forceStars) createStars();
  if (options.forceSatellites) buildSatellites();
}

function applyCamera() {
  camera.fov = params.fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  camera.position.set(0, 0, params.distance);
  moonGroup.position.set(params.offsetX, params.offsetY, 0);
  moonGroup.scale.setScalar(params.subjectScale);
  moonGroup.rotation.z = THREE.MathUtils.degToRad(params.frameRotationZ);

  controls.target.set(params.offsetX, params.offsetY, 0);
  controls.update();
}

function applyMoonMaterial(options = {}) {
  const signature = getTextureSignature();
  if (options.forceTexture || signature !== currentTextureSignature) {
    currentTextureSignature = signature;
    const textures = createMoonTextures();

    if (moonAlbedoTexture) moonAlbedoTexture.dispose();
    if (moonHeightTexture) moonHeightTexture.dispose();

    moonAlbedoTexture = textures.albedoTexture;
    moonHeightTexture = textures.heightTexture;
    moonMesh.material.map = moonAlbedoTexture;
    moonMesh.material.bumpMap = moonHeightTexture;
    moonMesh.material.needsUpdate = true;
  }

  moonMesh.rotation.x = THREE.MathUtils.degToRad(params.rotateMoonX);
  moonMesh.rotation.y = THREE.MathUtils.degToRad(params.rotateMoonY);
  moonMesh.material.bumpScale = params.bumpScale;
  moonMesh.material.roughness = params.roughness;

  const b = params.moonBrightness;
  const t = params.regolithTint;
  moonMesh.material.color.setRGB(
    b * (1.00 + t * 0.10),
    b * (1.00 + t * 0.04),
    b * (1.00 - t * 0.08)
  );
}

function applyLightAndSun() {
  const dir = getSunDirection();
  const target = new THREE.Vector3(params.offsetX, params.offsetY, 0);
  sunTarget.position.copy(target);
  sunLight.position.copy(target.clone().add(dir.clone().multiplyScalar(85)));
  sunLight.intensity = params.lightIntensity;
  sunLight.target.updateMatrixWorld();

  if (sunSprite) {
    sunSprite.visible = params.sunVisible;
    sunSprite.position.copy(target.clone().add(dir.clone().multiplyScalar(params.sunDistance)));
    sunSprite.scale.setScalar(params.sunScale);
    sunSprite.material.opacity = THREE.MathUtils.clamp(params.sunFlare, 0, 2);
  }

  if (ambientLight) {
    ambientLight.intensity = params.ambientIntensity;
  }
}

function applyExtras() {
  if (starField) {
    starField.visible = params.showStars;
    starField.material.opacity = params.starBrightness;
    starField.material.size = params.starSize;
  }

  if (satelliteGroup) {
    satelliteGroup.visible = params.showSatellites;
    satelliteGroup.scale.setScalar(params.subjectScale);
    satelliteGroup.position.copy(moonGroup.position);
    satelliteGroup.rotation.z = THREE.MathUtils.degToRad(params.satelliteOrbitTilt);
    satelliteGroup.children.forEach((sat) => {
      sat.scale.setScalar(params.satelliteScale);
      if (sat.material) sat.material.color.setScalar(params.satelliteBrightness);
    });
  }

  if (orbitLineGroup) {
    orbitLineGroup.visible = params.showSatellites && params.showOrbitLines;
    orbitLineGroup.scale.setScalar(params.subjectScale);
    orbitLineGroup.position.copy(moonGroup.position);
    orbitLineGroup.rotation.z = THREE.MathUtils.degToRad(params.satelliteOrbitTilt);
    orbitLineGroup.traverse((child) => {
      if (child.material) child.material.opacity = params.orbitLineOpacity;
    });
  }
}

function getSunDirection() {
  const az = THREE.MathUtils.degToRad(params.sunAzimuth);
  const el = THREE.MathUtils.degToRad(params.sunElevation);
  return new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el)
  ).normalize();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (moonMesh && params.moonSpinSpeed > 0) {
    moonMesh.rotation.y += delta * params.moonSpinSpeed;
  }

  if (starField) {
    starField.rotation.y += delta * 0.0015;
  }

  updateSatellites(delta);
  controls.update();
  renderer.render(scene, camera);
}

function updateSatellites(delta) {
  if (!satelliteGroup || !params.showSatellites) return;

  satelliteGroup.children.forEach((sat) => {
    sat.userData.angle += delta * sat.userData.speed;
    const radius = sat.userData.radius;
    const x = Math.cos(sat.userData.angle) * radius;
    const z = Math.sin(sat.userData.angle) * radius;
    const y = Math.sin(sat.userData.angle * 1.7) * 0.22;
    sat.position.set(x, y, z);
    sat.lookAt(camera.position);
  });
}

function onWindowResize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  applyCamera();
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === 'h') toggleUI();
  if (key === 'p') capturePreset('4k');
}

function toggleUI() {
  document.body.classList.toggle('ui-hidden');
}

function updatePhonePreview() {
  const shouldShow = params.showPhoneFrame || params.keepPhoneGuideInFreeMode;
  phonePreviewEl.classList.toggle('active', shouldShow);
  phonePreviewEl.classList.toggle('landscape', params.phoneOrientation === 'Horizontal');
  phonePreviewEl.dataset.label = params.phoneOrientation === 'Horizontal'
    ? 'iPhone 17 Pro Max • 2868 × 1320'
    : 'iPhone 17 Pro Max • 1320 × 2868';
}

function updateFilmOverlay() {
  const live = Math.min(0.18, params.filmDust * 0.22 + params.sensorNoise * 0.22);
  filmOverlayEl.style.opacity = String(live);
}

function applyJsonFromTextarea() {
  try {
    const parsed = JSON.parse(jsonInputEl.value);
    const payload = parsed.params && typeof parsed.params === 'object' ? parsed.params : parsed;
    const result = applyPartialConfig(payload, { source: 'json' });
    exportConfigToTextarea();
    setStatus(`JSON aplicado. ${result.applied} parâmetro(s) alterado(s).`, 'ok');
  } catch (error) {
    setStatus(`JSON inválido: ${error.message}`, 'error');
  }
}

function applyPartialConfig(input, options = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('O JSON precisa ser um objeto.');
  }

  const oldTextureSignature = getTextureSignature();
  let starChanged = false;
  let satelliteChanged = false;
  let applied = 0;

  Object.entries(input).forEach(([key, value]) => {
    if (!(key in params)) return;

    const old = params[key];

    if (typeof old === 'number') {
      const num = Number(value);
      if (!Number.isFinite(num)) return;
      const [min, max] = NUMERIC_LIMITS[key] || [-Infinity, Infinity];
      params[key] = THREE.MathUtils.clamp(num, min, max);
      if (Number.isInteger(old)) params[key] = Math.round(params[key]);
    } else if (typeof old === 'boolean') {
      params[key] = Boolean(value);
    } else if (typeof old === 'string') {
      params[key] = String(value);
    }

    if (params[key] !== old) applied++;
    if (STAR_KEYS.has(key)) starChanged = true;
    if (SATELLITE_KEYS.has(key)) satelliteChanged = true;
  });

  const textureChanged = oldTextureSignature !== getTextureSignature();
  applyAll({
    forceTexture: textureChanged || options.source === 'preset',
    forceStars: starChanged || options.source === 'preset',
    forceSatellites: satelliteChanged || options.source === 'preset'
  });

  return { applied };
}

function exportConfigToTextarea() {
  const config = {
    engine: ENGINE_NAME,
    version: ENGINE_VERSION,
    instructions: 'Edite params e clique em Aplicar JSON. Pode ser JSON completo ou parcial, por exemplo: { "sunAzimuth": -55, "showEarth": false, "bumpScale": 0.045 }.',
    params: { ...params, showEarth: false }
  };
  jsonInputEl.value = JSON.stringify(config, null, 2);
  setStatus('JSON atual gerado.', 'ok');
}

async function copyJsonToClipboard() {
  try {
    await navigator.clipboard.writeText(jsonInputEl.value);
    setStatus('JSON copiado.', 'ok');
  } catch {
    jsonInputEl.select();
    document.execCommand('copy');
    setStatus('JSON copiado.', 'ok');
  }
}

function downloadJsonConfig() {
  const blob = new Blob([jsonInputEl.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'isomium-moon-config.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Arquivo JSON baixado.', 'ok');
}

function setStatus(message, type = '') {
  jsonStatusEl.textContent = message;
  jsonStatusEl.className = type;
}

function capturePreset(kind) {
  if (kind === '4k') return captureAt(3840, 2160, 'isomium-moon-realistic-4k');
  if (kind === 'vertical4k') return captureAt(2160, 3840, 'isomium-moon-realistic-vertical-4k');
  if (kind === 'square4096') return captureAt(4096, 4096, 'isomium-moon-realistic-4096-square');
  if (kind === 'iphone17pm') {
    const width = params.phoneOrientation === 'Horizontal' ? 2868 : 1320;
    const height = params.phoneOrientation === 'Horizontal' ? 1320 : 2868;
    return captureAt(width, height, 'isomium-moon-realistic-iphone-17-pro-max');
  }
}

function captureFree() {
  const width = Math.max(320, Math.floor(params.freeWidth));
  const height = Math.max(320, Math.floor(params.freeHeight));
  return captureAt(width, height, `isomium-moon-realistic-${width}x${height}`);
}

async function captureAt(width, height, filename) {
  if (captureInProgress) return;
  captureInProgress = true;
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
    alert('Não foi possível exportar a imagem. Tente reduzir a resolução ou usar 4K padrão.');
  } finally {
    renderer.setPixelRatio(oldPixelRatio);
    renderer.setSize(oldSize.x, oldSize.y, false);
    camera.aspect = oldAspect;
    camera.updateProjectionMatrix();
    setCaptureStatus(false);
    captureInProgress = false;
  }
}

function buildProcessedCanvas(sourceCanvas, width, height) {
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const ctx = output.getContext('2d', { willReadFrequently: true });

  if (params.bloomMin > 0.001) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.30, params.bloomMin * 2.4);
    ctx.filter = `blur(${Math.max(2, Math.round(Math.min(width, height) * 0.0045))}px) brightness(1.35)`;
    ctx.drawImage(sourceCanvas, 0, 0, width, height);
    ctx.restore();
  }

  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  applyCameraTone(ctx, width, height);
  drawVignette(ctx, width, height, params.vignette);

  if (params.showReticle) drawReticle(ctx, width, height);
  if (params.filmDust > 0.001) drawFilmDust(ctx, width, height, params.filmDust);
  if (params.showTerminatorLine) drawTerminatorGuide(ctx, width, height);
  if (params.labelOverlay) drawLabel(ctx, width, height, params.labelText);

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

  const radius = Math.max(width, height) * 0.75;
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.20,
    width * 0.5,
    height * 0.5,
    radius
  );

  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.58, `rgba(0,0,0,${amount * 0.20})`);
  gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.92, amount)})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawReticle(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(18,18,18,0.62)';
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
  ctx.globalAlpha = Math.min(0.52, amount);
  ctx.fillStyle = 'rgba(255,255,255,0.70)';
  const specks = Math.floor((width * height / 90000) * amount * 16);

  for (let i = 0; i < specks; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * Math.max(0.6, Math.min(width, height) * 0.00085);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTerminatorGuide(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.26)';
  ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.001));
  ctx.setLineDash([Math.min(width, height) * 0.012, Math.min(width, height) * 0.010]);
  const x = width * (0.5 + Math.sin(THREE.MathUtils.degToRad(params.sunAzimuth)) * 0.16);
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

function createMoonTextures() {
  const size = normalizedTextureResolution(params.textureResolution);
  const width = size;
  const height = Math.floor(size / 2);
  const albedo = document.createElement('canvas');
  const relief = document.createElement('canvas');
  albedo.width = width;
  albedo.height = height;
  relief.width = width;
  relief.height = height;

  const aCtx = albedo.getContext('2d', { willReadFrequently: true });
  const hCtx = relief.getContext('2d', { willReadFrequently: true });
  const aImage = aCtx.createImageData(width, height);
  const hImage = hCtx.createImageData(width, height);
  const aData = aImage.data;
  const hData = hImage.data;

  const rngSeed = Math.floor(params.seed);

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = Math.abs(v - 0.5) * 2;

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const mare = mareMask(u, v, params.mareSoftness);
      const high = fbmPeriodic(u, v, 9.0, 4.8, rngSeed + 11);
      const mid = fbmPeriodic(u, v, 32.0, 16.0, rngSeed + 21);
      const micro = fbmPeriodic(u, v, 148.0, 76.0, rngSeed + 31);

      let shade = 145;
      shade += (high - 0.5) * 30 * params.highlandNoise;
      shade += (mid - 0.5) * 16 * params.highlandNoise;
      shade += (micro - 0.5) * 12 * params.microRelief;
      shade -= mare * 48 * params.mareStrength;
      shade += lat * 8;

      let hVal = 142;
      hVal += (high - 0.5) * 34 * params.highlandNoise;
      hVal += (mid - 0.5) * 24 * params.highlandNoise;
      hVal += (micro - 0.5) * 28 * params.microRelief;
      hVal -= mare * 36 * params.mareStrength;

      const warm = params.regolithTint;
      const idx = (y * width + x) * 4;
      aData[idx] = clamp255(shade * (1.00 + warm * 0.08));
      aData[idx + 1] = clamp255(shade * (0.995 + warm * 0.03));
      aData[idx + 2] = clamp255(shade * (0.965 - warm * 0.06));
      aData[idx + 3] = 255;

      hData[idx] = clamp255(hVal);
      hData[idx + 1] = clamp255(hVal);
      hData[idx + 2] = clamp255(hVal);
      hData[idx + 3] = 255;
    }
  }

  aCtx.putImageData(aImage, 0, 0);
  hCtx.putImageData(hImage, 0, 0);

  drawMareSoftEdges(aCtx, width, height);
  drawCraterSystem(aCtx, hCtx, width, height);
  drawSubtleLatitudeTexture(aCtx, hCtx, width, height);

  const albedoTexture = new THREE.CanvasTexture(albedo);
  albedoTexture.colorSpace = THREE.SRGBColorSpace;
  albedoTexture.wrapS = THREE.RepeatWrapping;
  albedoTexture.wrapT = THREE.ClampToEdgeWrapping;
  albedoTexture.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 4;

  const heightTexture = new THREE.CanvasTexture(relief);
  heightTexture.colorSpace = THREE.NoColorSpace;
  heightTexture.wrapS = THREE.RepeatWrapping;
  heightTexture.wrapT = THREE.ClampToEdgeWrapping;
  heightTexture.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 4;

  return { albedoTexture, heightTexture };
}

function drawMareSoftEdges(ctx, w, h) {
  const mares = getMarePatches();
  ctx.save();
  mares.forEach((m) => {
    ctx.translate(m.u * w, m.v * h);
    ctx.rotate(m.rot || 0);
    const r = Math.max(m.rx * w, m.ry * h);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    const alpha = 0.12 * params.mareStrength;
    gradient.addColorStop(0, `rgba(16,16,16,${alpha})`);
    gradient.addColorStop(0.72, `rgba(16,16,16,${alpha * 0.62})`);
    gradient.addColorStop(1, 'rgba(16,16,16,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, m.rx * w, m.ry * h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });
  ctx.restore();
}

function drawCraterSystem(aCtx, hCtx, w, h) {
  const rng = mulberry32(Math.floor(params.seed) + 451);
  const count = Math.max(0, Math.floor(params.craterCount));
  const strength = params.craterStrength;
  const rimStrength = params.craterRimStrength;

  for (let i = 0; i < count; i++) {
    const near = rng() < 0.68;
    const u = near ? 0.22 + rng() * 0.62 : rng();
    const v = 0.10 + rng() * 0.80;
    const latFactor = 0.68 + Math.abs(v - 0.5) * 0.72;
    const big = Math.pow(rng(), 3.2);
    const r = (1.2 + big * 42) * latFactor * (w / 2048);
    const x = u * w;
    const y = v * h;
    const squash = 0.82 + rng() * 0.32;
    const rot = rng() * Math.PI;
    const alpha = 0.05 + big * 0.24;

    drawCraterAlbedo(aCtx, x, y, r, squash, rot, alpha * strength, rimStrength);
    drawCraterHeight(hCtx, x, y, r, squash, rot, alpha * strength, rimStrength);
  }
}

function drawCraterAlbedo(ctx, x, y, r, squash, rot, alpha, rimStrength) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  const shadow = ctx.createRadialGradient(r * 0.10, r * 0.12, 0, 0, 0, r);
  shadow.addColorStop(0, `rgba(0,0,0,${alpha * 1.15})`);
  shadow.addColorStop(0.62, `rgba(0,0,0,${alpha * 0.55})`);
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.86, r * squash * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(240,240,230,${Math.min(0.55, alpha * 1.7 * rimStrength)})`;
  ctx.lineWidth = Math.max(0.55, r * 0.11);
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255,255,245,${Math.min(0.34, alpha * 1.2 * rimStrength)})`;
  ctx.lineWidth = Math.max(0.45, r * 0.055);
  ctx.beginPath();
  ctx.arc(-r * 0.15, -r * 0.18, r * 0.62, Math.PI * 0.90, Math.PI * 1.82);
  ctx.stroke();

  ctx.restore();
}

function drawCraterHeight(ctx, x, y, r, squash, rot, alpha, rimStrength) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  const depression = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  depression.addColorStop(0, `rgba(0,0,0,${alpha * 1.25})`);
  depression.addColorStop(0.66, `rgba(0,0,0,${alpha * 0.48})`);
  depression.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = depression;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.86, r * squash * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.45, alpha * 1.6 * rimStrength)})`;
  ctx.lineWidth = Math.max(0.6, r * 0.16);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.02, r * squash * 1.02, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawSubtleLatitudeTexture(aCtx, hCtx, w, h) {
  aCtx.save();
  hCtx.save();
  aCtx.globalAlpha = 0.035;
  hCtx.globalAlpha = 0.025;
  for (let i = 0; i < 18; i++) {
    const y = (i / 18) * h;
    aCtx.fillStyle = i % 2 ? '#ffffff' : '#000000';
    hCtx.fillStyle = i % 2 ? '#ffffff' : '#000000';
    aCtx.fillRect(0, y, w, 1);
    hCtx.fillRect(0, y, w, 1);
  }
  aCtx.restore();
  hCtx.restore();
}

function mareMask(u, v, softness = 0.8) {
  let m = 0;
  getMarePatches().forEach((p) => {
    const dx = wrapDistance(u, p.u) / (p.rx * softness);
    const dy = (v - p.v) / (p.ry * softness);
    const d = dx * dx + dy * dy;
    m += Math.max(0, 1 - d);
  });
  return Math.min(1, m);
}

function getMarePatches() {
  return [
    { u: 0.58, v: 0.42, rx: 0.100, ry: 0.064, rot: -0.22 },
    { u: 0.64, v: 0.50, rx: 0.142, ry: 0.092, rot: 0.22 },
    { u: 0.52, v: 0.54, rx: 0.090, ry: 0.060, rot: -0.08 },
    { u: 0.70, v: 0.39, rx: 0.086, ry: 0.055, rot: 0.12 },
    { u: 0.45, v: 0.44, rx: 0.064, ry: 0.042, rot: 0.28 },
    { u: 0.35, v: 0.52, rx: 0.060, ry: 0.040, rot: -0.22 },
    { u: 0.75, v: 0.58, rx: 0.052, ry: 0.035, rot: 0.02 },
    { u: 0.61, v: 0.31, rx: 0.050, ry: 0.036, rot: 0.10 }
  ];
}

function createSunCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.00, 'rgba(255,255,245,1)');
  g.addColorStop(0.10, 'rgba(255,245,210,1)');
  g.addColorStop(0.24, 'rgba(255,197,92,0.75)');
  g.addColorStop(0.46, 'rgba(255,137,34,0.25)');
  g.addColorStop(1.00, 'rgba(255,137,34,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

function getTextureSignature() {
  return JSON.stringify({
    seed: Math.floor(params.seed),
    textureResolution: normalizedTextureResolution(params.textureResolution),
    craterCount: Math.floor(params.craterCount),
    craterStrength: round(params.craterStrength, 3),
    craterRimStrength: round(params.craterRimStrength, 3),
    mareStrength: round(params.mareStrength, 3),
    mareSoftness: round(params.mareSoftness, 3),
    highlandNoise: round(params.highlandNoise, 3),
    microRelief: round(params.microRelief, 3),
    regolithTint: round(params.regolithTint, 3)
  });
}

function normalizedTextureResolution(value) {
  const clamped = THREE.MathUtils.clamp(Math.floor(value), 512, 4096);
  if (clamped <= 512) return 512;
  if (clamped <= 1024) return 1024;
  if (clamped <= 2048) return 2048;
  return 3072;
}

function fbmPeriodic(u, v, sx, sy, seed) {
  let value = 0;
  let amp = 0.5;
  let total = 0;
  let fx = sx;
  let fy = sy;
  for (let i = 0; i < 4; i++) {
    value += valueNoisePeriodic(u * fx, v * fy, seed + i * 17) * amp;
    total += amp;
    amp *= 0.5;
    fx *= 2.03;
    fy *= 2.01;
  }
  return value / total;
}

function valueNoisePeriodic(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);

  const u = smoothstep(xf);
  const v = smoothstep(yf);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

function hash2(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wrapDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

function clamp255(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function disposeObject3D(root) {
  root.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material.dispose();
    }
  });
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

function downloadCanvas(canvasEl, filename) {
  const link = document.createElement('a');
  link.href = canvasEl.toDataURL('image/png');
  link.download = filename;
  link.click();
}
