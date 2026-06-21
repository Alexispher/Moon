import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

const canvas = document.getElementById('space-canvas');
const flashEl = document.getElementById('flash');
const captureStatusEl = document.getElementById('capture-status');
const phonePreviewEl = document.getElementById('phone-preview');
const filmLayerEl = document.getElementById('film-layer');
const jsonPanelEl = document.getElementById('json-panel');
const configJsonEl = document.getElementById('config-json');
const jsonStatusEl = document.getElementById('json-status');
const configFileEl = document.getElementById('config-file');

const btnToggleUI = document.getElementById('btn-toggle-ui');
const btnOpenConfig = document.getElementById('btn-open-config');
const btnCloseConfig = document.getElementById('btn-close-config');
const btnJsonApply = document.getElementById('btn-json-apply');
const btnJsonExport = document.getElementById('btn-json-export');
const btnJsonCopy = document.getElementById('btn-json-copy');
const btnJsonDownload = document.getElementById('btn-json-download');
const btnExport4K = document.getElementById('btn-export-4k');
const btnExportVertical = document.getElementById('btn-export-vertical');
const btnExportSquare = document.getElementById('btn-export-square');
const btnExportIphone = document.getElementById('btn-export-iphone');
const btnExportFree = document.getElementById('btn-export-free');
const btnReset = document.getElementById('btn-reset');

const MOON_RADIUS = 5.25;
const EARTH_RADIUS = 1.45;
const ENGINE_VERSION = '2.0.0';

let scene;
let camera;
let renderer;
let controls;
let gui;
let clock;

let moonRoot;
let moonMesh;
let moonLimbGlow;
let waterOverlay;
let earthGroup;
let earthMesh;
let earthClouds;
let sunSprite;
let sunCore;
let satellitesGroup;
let starField;
let surfaceGroup;
let surfaceTerrain;
let surfaceHorizon;
let orbitLinesGroup;

let sunLight;
let ambientLight;
let guiControllers = [];
let textureStateKey = '';
let satelliteBuildKey = '';

const params = {
  sceneProfile: 'Lua Orbital Realista',
  sceneMode: 'Orbital',

  phoneOrientation: 'Vertical',
  showPhoneFrame: false,
  keepPhoneGuideInFreeMode: false,

  // Composição
  fov: 22,
  distance: 18,
  offsetX: 0,
  offsetY: 0.08,
  frameRotationZ: 0,
  subjectScale: 1.0,

  // Superfície lunar
  surfaceCameraHeight: 1.55,
  surfaceCameraZ: 11.0,
  surfaceLookY: 0.85,
  surfaceLookZ: -26.0,
  terrainRelief: 0.34,
  terrainBrightness: 0.92,

  // Fase e luz
  phaseAngle: 48,
  lightElevation: 4,
  lightIntensity: 3.25,
  ambientIntensity: 0.012,
  sunAzimuth: -36,
  sunElevation: 18,
  sunDistance: 155,
  sunScale: 15,
  sunVisible: true,
  sunFlare: 0.52,

  // Lua procedural
  seed: 73421,
  textureResolution: 2048,
  moonBrightness: 1.02,
  moonContrast: 1.10,
  regolithTint: 0.06,
  roughness: 1.0,
  bumpScale: 0.042,
  moonSpinSpeed: 0.00035,
  rotateMoonY: -18,
  rotateMoonX: 1.8,
  craterCount: 1050,
  craterStrength: 0.78,
  craterRimStrength: 0.44,
  mareStrength: 0.72,
  mareSoftness: 0.72,
  highlandNoise: 0.34,
  microRelief: 0.28,
  limbGlow: 0.0,

  // Terra, satélites e órbitas
  showEarth: true,
  earthDistance: 88,
  earthScale: 1.00,
  earthAzimuth: -27,
  earthElevation: 15,
  earthBrightness: 1.10,
  earthCloudOpacity: 0.42,
  showSatellites: true,
  satelliteCount: 4,
  satelliteScale: 0.28,
  satelliteOrbitRadius: 8.4,
  satelliteOrbitTilt: 28,
  satelliteSpeed: 0.18,
  satelliteBrightness: 1.0,
  showOrbitLines: true,
  orbitLineOpacity: 0.15,

  // Ciência/visualização
  showWaterHydrogen: false,
  waterSignalStrength: 0.26,
  showPolarIceHint: true,
  showTerminatorLine: false,

  // Pós-processamento / câmera
  cameraMono: false,
  sensorNoise: 0.012,
  vignette: 0.16,
  bloomMin: 0.012,
  filmDust: 0.0,
  showReticle: false,
  labelOverlay: false,
  labelText: 'ISOMIUM • Moon Render Engine',

  // Fundo
  exposure: 1.00,
  starCount: 650,
  starSize: 0.018,
  starBrightness: 0.62,
  showStars: true,
  backgroundGradient: 0.025,

  // Captura livre
  freeWidth: 3000,
  freeHeight: 3000
};

const PROFILE_PRESETS = {
  'Lua Orbital Realista': {
    sceneMode: 'Orbital',
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 21.5,
    distance: 16.8,
    offsetX: 0.12,
    offsetY: 0.08,
    frameRotationZ: -1.2,
    subjectScale: 1.05,
    phaseAngle: 42,
    lightElevation: 4,
    lightIntensity: 3.45,
    ambientIntensity: 0.008,
    sunAzimuth: -38,
    sunElevation: 18,
    sunDistance: 150,
    sunScale: 13,
    sunVisible: true,
    sunFlare: 0.36,
    seed: 73421,
    textureResolution: 2048,
    moonBrightness: 1.04,
    moonContrast: 1.12,
    regolithTint: 0.04,
    roughness: 1.0,
    bumpScale: 0.040,
    moonSpinSpeed: 0.0002,
    rotateMoonY: -18,
    rotateMoonX: 2,
    craterCount: 1150,
    craterStrength: 0.72,
    craterRimStrength: 0.36,
    mareStrength: 0.72,
    mareSoftness: 0.74,
    highlandNoise: 0.31,
    microRelief: 0.23,
    limbGlow: 0.0,
    showEarth: true,
    earthDistance: 86,
    earthScale: 0.88,
    earthAzimuth: -27,
    earthElevation: 14,
    earthBrightness: 1.08,
    earthCloudOpacity: 0.40,
    showSatellites: true,
    satelliteCount: 4,
    satelliteScale: 0.25,
    satelliteOrbitRadius: 8.6,
    satelliteOrbitTilt: 26,
    satelliteSpeed: 0.12,
    satelliteBrightness: 0.86,
    showOrbitLines: true,
    orbitLineOpacity: 0.10,
    showWaterHydrogen: false,
    waterSignalStrength: 0.22,
    showPolarIceHint: true,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.010,
    vignette: 0.15,
    bloomMin: 0.010,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    labelText: 'ISOMIUM • Lua orbital realista',
    exposure: 0.98,
    starCount: 500,
    starSize: 0.016,
    starBrightness: 0.50,
    showStars: true,
    backgroundGradient: 0.020
  },

  'LRO Preto e Branco': {
    sceneMode: 'Orbital',
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 19.5,
    distance: 15.5,
    offsetX: 0.05,
    offsetY: 0.08,
    frameRotationZ: -0.6,
    subjectScale: 1.12,
    phaseAngle: 64,
    lightElevation: 2,
    lightIntensity: 3.8,
    ambientIntensity: 0.003,
    sunAzimuth: -50,
    sunElevation: 8,
    sunDistance: 170,
    sunScale: 11,
    sunVisible: false,
    sunFlare: 0.12,
    seed: 91473,
    textureResolution: 2048,
    moonBrightness: 1.02,
    moonContrast: 1.26,
    regolithTint: 0.0,
    roughness: 1.0,
    bumpScale: 0.058,
    moonSpinSpeed: 0.00008,
    rotateMoonY: -24,
    rotateMoonX: 1.5,
    craterCount: 1600,
    craterStrength: 0.90,
    craterRimStrength: 0.54,
    mareStrength: 0.82,
    mareSoftness: 0.68,
    highlandNoise: 0.36,
    microRelief: 0.34,
    limbGlow: 0.0,
    showEarth: false,
    earthDistance: 94,
    earthScale: 0.78,
    earthAzimuth: -30,
    earthElevation: 16,
    earthBrightness: 1.0,
    earthCloudOpacity: 0.35,
    showSatellites: true,
    satelliteCount: 1,
    satelliteScale: 0.18,
    satelliteOrbitRadius: 7.4,
    satelliteOrbitTilt: 41,
    satelliteSpeed: 0.22,
    satelliteBrightness: 0.68,
    showOrbitLines: false,
    orbitLineOpacity: 0.06,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: true,
    sensorNoise: 0.018,
    vignette: 0.18,
    bloomMin: 0.006,
    filmDust: 0.04,
    showReticle: true,
    labelOverlay: false,
    labelText: 'LRO • Lunar Reconnaissance Orbiter',
    exposure: 0.92,
    starCount: 80,
    starSize: 0.012,
    starBrightness: 0.32,
    showStars: false,
    backgroundGradient: 0.0
  },

  'Apollo / Hasselblad': {
    sceneMode: 'Superfície Lunar',
    showPhoneFrame: false,
    phoneOrientation: 'Horizontal',
    fov: 38,
    distance: 16,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: 0.6,
    subjectScale: 1.0,
    surfaceCameraHeight: 1.50,
    surfaceCameraZ: 10.0,
    surfaceLookY: 0.78,
    surfaceLookZ: -30.0,
    terrainRelief: 0.38,
    terrainBrightness: 0.88,
    phaseAngle: 72,
    lightElevation: 7,
    lightIntensity: 3.65,
    ambientIntensity: 0.018,
    sunAzimuth: 32,
    sunElevation: 24,
    sunDistance: 160,
    sunScale: 18,
    sunVisible: true,
    sunFlare: 0.46,
    seed: 12011,
    textureResolution: 2048,
    moonBrightness: 1.04,
    moonContrast: 1.23,
    regolithTint: 0.0,
    roughness: 1.0,
    bumpScale: 0.052,
    moonSpinSpeed: 0.0,
    rotateMoonY: -32,
    rotateMoonX: 0,
    craterCount: 1300,
    craterStrength: 0.82,
    craterRimStrength: 0.50,
    mareStrength: 0.76,
    mareSoftness: 0.72,
    highlandNoise: 0.38,
    microRelief: 0.36,
    limbGlow: 0.0,
    showEarth: true,
    earthDistance: 105,
    earthScale: 1.18,
    earthAzimuth: -18,
    earthElevation: 23,
    earthBrightness: 1.18,
    earthCloudOpacity: 0.46,
    showSatellites: false,
    satelliteCount: 0,
    satelliteScale: 0.22,
    satelliteOrbitRadius: 8,
    satelliteOrbitTilt: 35,
    satelliteSpeed: 0.08,
    satelliteBrightness: 0.6,
    showOrbitLines: false,
    orbitLineOpacity: 0.0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: true,
    sensorNoise: 0.052,
    vignette: 0.32,
    bloomMin: 0.010,
    filmDust: 0.35,
    showReticle: true,
    labelOverlay: false,
    labelText: 'Apollo • Hasselblad',
    exposure: 0.88,
    starCount: 0,
    starSize: 0.012,
    starBrightness: 0.0,
    showStars: false,
    backgroundGradient: 0.0
  },

  'Terra e Sol vistos da Lua': {
    sceneMode: 'Superfície Lunar',
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 32,
    distance: 18,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: 0,
    subjectScale: 1.0,
    surfaceCameraHeight: 1.62,
    surfaceCameraZ: 12.0,
    surfaceLookY: 1.05,
    surfaceLookZ: -30.0,
    terrainRelief: 0.30,
    terrainBrightness: 0.78,
    phaseAngle: 30,
    lightElevation: 11,
    lightIntensity: 3.8,
    ambientIntensity: 0.010,
    sunAzimuth: 24,
    sunElevation: 21,
    sunDistance: 155,
    sunScale: 20,
    sunVisible: true,
    sunFlare: 0.70,
    seed: 40477,
    textureResolution: 2048,
    moonBrightness: 0.96,
    moonContrast: 1.16,
    regolithTint: 0.08,
    roughness: 1.0,
    bumpScale: 0.04,
    moonSpinSpeed: 0,
    rotateMoonY: -20,
    rotateMoonX: 0,
    craterCount: 1200,
    craterStrength: 0.70,
    craterRimStrength: 0.38,
    mareStrength: 0.62,
    mareSoftness: 0.78,
    highlandNoise: 0.30,
    microRelief: 0.24,
    limbGlow: 0.0,
    showEarth: true,
    earthDistance: 90,
    earthScale: 1.35,
    earthAzimuth: -22,
    earthElevation: 26,
    earthBrightness: 1.26,
    earthCloudOpacity: 0.50,
    showSatellites: true,
    satelliteCount: 2,
    satelliteScale: 0.20,
    satelliteOrbitRadius: 13.0,
    satelliteOrbitTilt: 18,
    satelliteSpeed: 0.06,
    satelliteBrightness: 0.76,
    showOrbitLines: false,
    orbitLineOpacity: 0.0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.010,
    vignette: 0.18,
    bloomMin: 0.026,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: true,
    labelText: 'Terra e Sol vistos da superfície lunar',
    exposure: 0.90,
    starCount: 420,
    starSize: 0.015,
    starBrightness: 0.44,
    showStars: true,
    backgroundGradient: 0.015
  },

  'Água / Hidrogênio Lunar': {
    sceneMode: 'Orbital',
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 23.5,
    distance: 17.2,
    offsetX: 0.0,
    offsetY: 0.10,
    frameRotationZ: -6.0,
    subjectScale: 1.03,
    phaseAngle: 46,
    lightElevation: 9,
    lightIntensity: 3.4,
    ambientIntensity: 0.018,
    sunAzimuth: -34,
    sunElevation: 15,
    sunDistance: 150,
    sunScale: 13,
    sunVisible: true,
    sunFlare: 0.34,
    seed: 52994,
    textureResolution: 2048,
    moonBrightness: 1.0,
    moonContrast: 1.11,
    regolithTint: 0.08,
    roughness: 1.0,
    bumpScale: 0.038,
    moonSpinSpeed: 0.00015,
    rotateMoonY: -16,
    rotateMoonX: 8,
    craterCount: 1050,
    craterStrength: 0.70,
    craterRimStrength: 0.35,
    mareStrength: 0.68,
    mareSoftness: 0.78,
    highlandNoise: 0.28,
    microRelief: 0.22,
    limbGlow: 0.04,
    showEarth: true,
    earthDistance: 82,
    earthScale: 0.72,
    earthAzimuth: -32,
    earthElevation: 18,
    earthBrightness: 1.02,
    earthCloudOpacity: 0.40,
    showSatellites: true,
    satelliteCount: 3,
    satelliteScale: 0.22,
    satelliteOrbitRadius: 8.4,
    satelliteOrbitTilt: 34,
    satelliteSpeed: 0.10,
    satelliteBrightness: 0.72,
    showOrbitLines: true,
    orbitLineOpacity: 0.10,
    showWaterHydrogen: true,
    waterSignalStrength: 0.46,
    showPolarIceHint: true,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.008,
    vignette: 0.15,
    bloomMin: 0.018,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: true,
    labelText: 'H₂O/OH • visualização científica estilizada',
    exposure: 1.0,
    starCount: 460,
    starSize: 0.016,
    starBrightness: 0.48,
    showStars: true,
    backgroundGradient: 0.025
  },

  'iPhone 17 Pro Max da Terra': {
    sceneMode: 'Orbital',
    showPhoneFrame: true,
    phoneOrientation: 'Vertical',
    fov: 8.5,
    distance: 128,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: 0,
    subjectScale: 0.58,
    phaseAngle: 0,
    lightElevation: 0,
    lightIntensity: 2.8,
    ambientIntensity: 0.0,
    sunAzimuth: -12,
    sunElevation: 8,
    sunDistance: 150,
    sunScale: 10,
    sunVisible: false,
    sunFlare: 0.0,
    seed: 73421,
    textureResolution: 2048,
    moonBrightness: 1.32,
    moonContrast: 1.02,
    regolithTint: 0.05,
    roughness: 1.0,
    bumpScale: 0.014,
    moonSpinSpeed: 0,
    rotateMoonY: -7,
    rotateMoonX: 0,
    craterCount: 850,
    craterStrength: 0.45,
    craterRimStrength: 0.18,
    mareStrength: 0.55,
    mareSoftness: 0.82,
    highlandNoise: 0.18,
    microRelief: 0.08,
    limbGlow: 0.0,
    showEarth: false,
    earthDistance: 100,
    earthScale: 0.5,
    earthAzimuth: -30,
    earthElevation: 18,
    earthBrightness: 1.0,
    earthCloudOpacity: 0.35,
    showSatellites: false,
    satelliteCount: 0,
    satelliteScale: 0.10,
    satelliteOrbitRadius: 8,
    satelliteOrbitTilt: 20,
    satelliteSpeed: 0,
    satelliteBrightness: 0.4,
    showOrbitLines: false,
    orbitLineOpacity: 0.0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.034,
    vignette: 0.34,
    bloomMin: 0.070,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    labelText: 'iPhone 17 Pro Max • Terra',
    exposure: 0.86,
    starCount: 160,
    starSize: 0.012,
    starBrightness: 0.34,
    showStars: true,
    backgroundGradient: 0.055
  },

  'Wallpaper Isomium': {
    sceneMode: 'Orbital',
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 20.5,
    distance: 15.4,
    offsetX: -4.70,
    offsetY: 0.12,
    frameRotationZ: -4,
    subjectScale: 1.64,
    phaseAngle: 102,
    lightElevation: 3,
    lightIntensity: 3.7,
    ambientIntensity: 0.0,
    sunAzimuth: -54,
    sunElevation: 14,
    sunDistance: 160,
    sunScale: 13,
    sunVisible: false,
    sunFlare: 0.10,
    seed: 88213,
    textureResolution: 2048,
    moonBrightness: 0.94,
    moonContrast: 1.28,
    regolithTint: 0.0,
    roughness: 1.0,
    bumpScale: 0.038,
    moonSpinSpeed: 0.0001,
    rotateMoonY: -31,
    rotateMoonX: 2,
    craterCount: 1250,
    craterStrength: 0.74,
    craterRimStrength: 0.34,
    mareStrength: 0.76,
    mareSoftness: 0.70,
    highlandNoise: 0.32,
    microRelief: 0.20,
    limbGlow: 0.02,
    showEarth: false,
    earthDistance: 90,
    earthScale: 0.7,
    earthAzimuth: -30,
    earthElevation: 15,
    earthBrightness: 1.0,
    earthCloudOpacity: 0.38,
    showSatellites: false,
    satelliteCount: 0,
    satelliteScale: 0.18,
    satelliteOrbitRadius: 8,
    satelliteOrbitTilt: 20,
    satelliteSpeed: 0,
    satelliteBrightness: 0.4,
    showOrbitLines: false,
    orbitLineOpacity: 0.0,
    showWaterHydrogen: false,
    waterSignalStrength: 0.0,
    showPolarIceHint: false,
    showTerminatorLine: false,
    cameraMono: true,
    sensorNoise: 0.004,
    vignette: 0.10,
    bloomMin: 0.018,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    labelText: 'ISOMIUM • Moon Wallpaper',
    exposure: 0.90,
    starCount: 0,
    starSize: 0.012,
    starBrightness: 0.0,
    showStars: false,
    backgroundGradient: 0.0,
    freeWidth: 4096,
    freeHeight: 4096
  },

  'Modo Livre': {
    sceneMode: 'Orbital',
    showPhoneFrame: false,
    phoneOrientation: 'Vertical',
    fov: 24,
    distance: 18,
    offsetX: 0,
    offsetY: 0,
    frameRotationZ: -2,
    subjectScale: 1.0,
    surfaceCameraHeight: 1.55,
    surfaceCameraZ: 11,
    surfaceLookY: 0.85,
    surfaceLookZ: -26,
    terrainRelief: 0.34,
    terrainBrightness: 0.92,
    phaseAngle: 60,
    lightElevation: 4,
    lightIntensity: 3.3,
    ambientIntensity: 0.015,
    sunAzimuth: -34,
    sunElevation: 16,
    sunDistance: 150,
    sunScale: 14,
    sunVisible: true,
    sunFlare: 0.45,
    seed: 73421,
    textureResolution: 2048,
    moonBrightness: 1.05,
    moonContrast: 1.12,
    regolithTint: 0.10,
    roughness: 1.0,
    bumpScale: 0.042,
    moonSpinSpeed: 0.0004,
    rotateMoonY: -15,
    rotateMoonX: 0,
    craterCount: 1100,
    craterStrength: 0.75,
    craterRimStrength: 0.38,
    mareStrength: 0.72,
    mareSoftness: 0.74,
    highlandNoise: 0.32,
    microRelief: 0.25,
    limbGlow: 0.0,
    showEarth: true,
    earthDistance: 88,
    earthScale: 0.9,
    earthAzimuth: -28,
    earthElevation: 16,
    earthBrightness: 1.08,
    earthCloudOpacity: 0.40,
    showSatellites: true,
    satelliteCount: 3,
    satelliteScale: 0.24,
    satelliteOrbitRadius: 8.5,
    satelliteOrbitTilt: 28,
    satelliteSpeed: 0.12,
    satelliteBrightness: 0.8,
    showOrbitLines: true,
    orbitLineOpacity: 0.10,
    showWaterHydrogen: false,
    waterSignalStrength: 0.25,
    showPolarIceHint: true,
    showTerminatorLine: false,
    cameraMono: false,
    sensorNoise: 0.012,
    vignette: 0.16,
    bloomMin: 0.020,
    filmDust: 0.0,
    showReticle: false,
    labelOverlay: false,
    labelText: 'ISOMIUM • Modo Livre',
    exposure: 1.0,
    starCount: 500,
    starSize: 0.018,
    starBrightness: 0.64,
    showStars: true,
    backgroundGradient: 0.04,
    freeWidth: 3000,
    freeHeight: 3000
  }
};

const TEXTURE_KEYS = [
  'seed', 'textureResolution', 'craterCount', 'craterStrength', 'craterRimStrength',
  'mareStrength', 'mareSoftness', 'highlandNoise', 'microRelief', 'regolithTint'
];

init();
animate();

function init() {
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(params.fov, window.innerWidth / window.innerHeight, 0.1, 3000);

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
  controls.minDistance = 3;
  controls.maxDistance = 320;

  ambientLight = new THREE.AmbientLight(0xffffff, params.ambientIntensity);
  scene.add(ambientLight);

  sunLight = new THREE.DirectionalLight(0xffffff, params.lightIntensity);
  scene.add(sunLight);

  moonRoot = new THREE.Group();
  scene.add(moonRoot);

  createMoon();
  createMoonLimbGlow();
  createWaterHydrogenOverlay();
  createEarth();
  createSun();
  createSatellites(true);
  createOrbitLines(true);
  createSurfaceScene();
  createStars();
  createGui();
  bindUI();

  applySceneProfile('Lua Orbital Realista', { forcePreset: true, skipJsonUpdate: true });
  rebuildProceduralTextures(true);
  updateConfigText();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
}

function createMoon() {
  const geometry = new THREE.SphereGeometry(MOON_RADIUS, 224, 144);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(1, 1, 1),
    roughness: params.roughness,
    metalness: 0,
    bumpScale: params.bumpScale
  });
  moonMesh = new THREE.Mesh(geometry, material);
  moonRoot.add(moonMesh);
}

function createMoonLimbGlow() {
  const geometry = new THREE.SphereGeometry(MOON_RADIUS * 1.012, 128, 96);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowColor: { value: new THREE.Color(0xdde8ff) },
      intensity: { value: 0.0 },
      power: { value: 3.4 }
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
  moonLimbGlow = new THREE.Mesh(geometry, material);
  moonRoot.add(moonLimbGlow);
}

function createWaterHydrogenOverlay() {
  waterOverlay = new THREE.Group();
  moonRoot.add(waterOverlay);

  const shellMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      strength: { value: params.waterSignalStrength },
      showPoles: { value: params.showPolarIceHint ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float strength;
      uniform float showPoles;
      varying vec3 vPos;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      void main() {
        float pole = smoothstep(0.72, 0.98, abs(vPos.y));
        float trap = smoothstep(0.18, 1.0, hash(vPos.xz * 22.0 + vPos.yy * 8.0));
        float signal = pole * mix(0.45, 1.0, trap) * showPoles;
        vec3 col = mix(vec3(0.20, 0.54, 1.0), vec3(0.93, 0.98, 1.0), pole);
        gl_FragColor = vec4(col, signal * strength * 0.42);
      }
    `
  });

  const shell = new THREE.Mesh(new THREE.SphereGeometry(MOON_RADIUS * 1.006, 128, 96), shellMaterial);
  waterOverlay.add(shell);

  const rng = mulberry32(1003);
  const particleCount = 360;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const north = i % 2 === 0 ? 1 : -1;
    const theta = rng() * Math.PI * 2;
    const y = north * (0.75 + rng() * 0.23);
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const radius = MOON_RADIUS * (1.012 + rng() * 0.006);
    positions[i * 3 + 0] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    colors[i * 3 + 0] = 0.36 + rng() * 0.22;
    colors[i * 3 + 1] = 0.64 + rng() * 0.20;
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

  waterOverlay.add(new THREE.Points(geometry, material));
}

function createEarth() {
  earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const earthTexture = new THREE.CanvasTexture(createProceduralEarthCanvas(1024, 512));
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  earthTexture.wrapS = THREE.RepeatWrapping;
  earthTexture.wrapT = THREE.ClampToEdgeWrapping;

  earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 96, 64),
    new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.88,
      metalness: 0,
      emissive: new THREE.Color(0x071020),
      emissiveIntensity: 0.08
    })
  );
  earthGroup.add(earthMesh);

  const cloudTexture = new THREE.CanvasTexture(createProceduralCloudCanvas(1024, 512));
  cloudTexture.colorSpace = THREE.SRGBColorSpace;
  earthClouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.018, 96, 64),
    new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: params.earthCloudOpacity,
      roughness: 1,
      metalness: 0,
      depthWrite: false
    })
  );
  earthGroup.add(earthClouds);

  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.04, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        glowColor: { value: new THREE.Color(0x76a9ff) },
        intensity: { value: 0.22 }
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
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          float rim = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));
          gl_FragColor = vec4(glowColor, pow(max(rim, 0.0), 2.6) * intensity);
        }
      `
    })
  );
  earthGroup.add(rim);
}

function createSun() {
  const sunTexture = new THREE.CanvasTexture(createSunCanvas(512));
  sunTexture.colorSpace = THREE.SRGBColorSpace;

  sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sunTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending
  }));
  scene.add(sunSprite);

  sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0xfff2c7 })
  );
  scene.add(sunCore);
}

function createSatellites(force = false) {
  const key = [
    Math.floor(params.satelliteCount),
    params.satelliteScale.toFixed(3),
    params.satelliteOrbitRadius.toFixed(2)
  ].join('|');

  if (!force && key === satelliteBuildKey && satellitesGroup) return;
  satelliteBuildKey = key;

  if (satellitesGroup) {
    disposeObject(satellitesGroup);
    scene.remove(satellitesGroup);
  }

  satellitesGroup = new THREE.Group();
  scene.add(satellitesGroup);

  const count = Math.max(0, Math.floor(params.satelliteCount));
  for (let i = 0; i < count; i++) {
    const satellite = buildSatellite(i);
    const angle = (i / Math.max(1, count)) * Math.PI * 2;
    satellite.userData.baseAngle = angle;
    satellitesGroup.add(satellite);
  }
}

function buildSatellite(index) {
  const group = new THREE.Group();
  const scale = params.satelliteScale;
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.75, 0.75, 0.70),
    roughness: 0.55,
    metalness: 0.35,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.015
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.08, 0.13, 0.20),
    roughness: 0.5,
    metalness: 0.15,
    emissive: new THREE.Color(0x0f2f57),
    emissiveIntensity: 0.08,
    side: THREE.DoubleSide
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.75 * scale, 0.45 * scale, 0.45 * scale), bodyMat);
  group.add(body);

  const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(1.10 * scale, 0.025 * scale, 0.45 * scale), panelMat);
  leftPanel.position.x = -0.88 * scale;
  group.add(leftPanel);

  const rightPanel = leftPanel.clone();
  rightPanel.position.x = 0.88 * scale;
  group.add(rightPanel);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.018 * scale, 0.018 * scale, 0.75 * scale, 12), bodyMat);
  antenna.rotation.z = Math.PI * 0.5;
  antenna.position.z = -0.46 * scale;
  group.add(antenna);

  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.18 * scale, 0.12 * scale, 24, 1, true), bodyMat);
  dish.rotation.x = Math.PI;
  dish.position.z = -0.86 * scale;
  group.add(dish);

  group.userData.index = index;
  return group;
}

function createOrbitLines(force = false) {
  if (!force && orbitLinesGroup) return;

  if (orbitLinesGroup) {
    disposeObject(orbitLinesGroup);
    scene.remove(orbitLinesGroup);
  }

  orbitLinesGroup = new THREE.Group();
  scene.add(orbitLinesGroup);

  const radius = params.satelliteOrbitRadius;
  const points = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: params.orbitLineOpacity,
    depthWrite: false
  });
  orbitLinesGroup.add(new THREE.Line(geometry, material));
}

function createSurfaceScene() {
  surfaceGroup = new THREE.Group();
  scene.add(surfaceGroup);

  const geometry = new THREE.PlaneGeometry(220, 120, 260, 160);
  geometry.rotateX(-Math.PI / 2);
  surfaceTerrain = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.72, 0.70, 0.64),
      roughness: 1.0,
      metalness: 0.0
    })
  );
  surfaceTerrain.position.z = -38;
  surfaceTerrain.receiveShadow = false;
  surfaceGroup.add(surfaceTerrain);

  surfaceHorizon = new THREE.Mesh(
    new THREE.PlaneGeometry(260, 22, 1, 1),
    new THREE.MeshBasicMaterial({
      color: 0x050506,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    })
  );
  surfaceHorizon.position.set(0, 5.6, -96);
  surfaceGroup.add(surfaceHorizon);

  rebuildSurfaceTerrain();
}

function createStars() {
  if (starField) {
    disposeObject(starField);
    scene.remove(starField);
  }

  const count = Math.max(0, Math.floor(params.starCount));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const rng = mulberry32(params.seed + 81011);

  for (let i = 0; i < count; i++) {
    const radius = 420 + rng() * 980;
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(rng() * 2 - 1);
    positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    const c = 0.58 + rng() * 0.42;
    colors[i * 3 + 0] = c;
    colors[i * 3 + 1] = c;
    colors[i * 3 + 2] = Math.min(1, c + rng() * 0.04);
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

function createGui() {
  gui = new GUI({ title: 'MOON MODE' });

  const actions = {
    'Aplicar perfil': () => applySceneProfile(params.sceneProfile, { forcePreset: true }),
    'Resetar modo atual': () => resetCurrentMode(),
    'Recriar Lua Procedural': () => rebuildProceduralTextures(true),
    'Abrir JSON': () => openConfigPanel(true),
    'Atualizar JSON': () => updateConfigText(),
    'Aplicar JSON': () => applyConfigFromText(),
    'Capturar 3840x2160': () => capturePreset('4k'),
    'Capturar 2160x3840': () => capturePreset('vertical4k'),
    'Capturar 4096x4096': () => capturePreset('square4096'),
    'Capturar iPhone 17 PM': () => capturePreset('iphone17pm'),
    'Capturar Livre': () => captureFree()
  };

  const folderMode = gui.addFolder('Modo');
  track(folderMode.add(params, 'sceneProfile', Object.keys(PROFILE_PRESETS)).name('Perfil').onChange((value) => applySceneProfile(value)));
  track(folderMode.add(params, 'sceneMode', ['Orbital', 'Superfície Lunar']).name('Cena').onChange(updateEverything));
  track(folderMode.add(params, 'showPhoneFrame').name('Mostrar guia celular').onChange(updatePhonePreview));
  track(folderMode.add(params, 'phoneOrientation', ['Vertical', 'Horizontal']).name('Orientação celular').onChange(updatePhonePreview));
  track(folderMode.add(params, 'keepPhoneGuideInFreeMode').name('Guia no Livre').onChange(updatePhonePreview));
  track(folderMode.add(actions, 'Aplicar perfil'));
  track(folderMode.add(actions, 'Resetar modo atual'));

  const folderComp = gui.addFolder('Composição');
  track(folderComp.add(params, 'fov', 5, 85, 0.1).name('FOV').onChange(applyCameraFromParams));
  track(folderComp.add(params, 'distance', 3, 260, 0.1).name('Distância').onChange(applyCameraFromParams));
  track(folderComp.add(params, 'offsetX', -40, 40, 0.01).name('Offset X').onChange(updateEverything));
  track(folderComp.add(params, 'offsetY', -40, 40, 0.01).name('Offset Y').onChange(updateEverything));
  track(folderComp.add(params, 'frameRotationZ', -180, 180, 0.1).name('Rotação quadro').onChange(updateEverything));
  track(folderComp.add(params, 'subjectScale', 0.01, 5.0, 0.001).name('Escala assunto').onChange(updateEverything));

  const folderSurface = gui.addFolder('Superfície lunar');
  track(folderSurface.add(params, 'surfaceCameraHeight', 0.3, 8.0, 0.01).name('Altura câmera').onChange(applyCameraFromParams));
  track(folderSurface.add(params, 'surfaceCameraZ', -20, 28, 0.1).name('Posição Z').onChange(applyCameraFromParams));
  track(folderSurface.add(params, 'surfaceLookY', -4, 12, 0.01).name('Olhar Y').onChange(applyCameraFromParams));
  track(folderSurface.add(params, 'surfaceLookZ', -90, 10, 0.1).name('Olhar Z').onChange(applyCameraFromParams));
  track(folderSurface.add(params, 'terrainRelief', 0, 1.4, 0.01).name('Relevo solo').onFinishChange(rebuildSurfaceTerrain));
  track(folderSurface.add(params, 'terrainBrightness', 0.1, 2.0, 0.01).name('Brilho solo').onChange(updateEverything));

  const folderPhase = gui.addFolder('Fase / Luz / Sol');
  track(folderPhase.add(params, 'phaseAngle', 0, 180, 0.1).name('Ângulo da fase').onChange(updateEverything));
  track(folderPhase.add(params, 'lightElevation', -45, 45, 0.1).name('Elevação fase').onChange(updateEverything));
  track(folderPhase.add(params, 'lightIntensity', 0, 12.0, 0.01).name('Luz intensidade').onChange(updateEverything));
  track(folderPhase.add(params, 'ambientIntensity', 0, 1.2, 0.001).name('Luz ambiente').onChange(updateEverything));
  track(folderPhase.add(params, 'sunVisible').name('Mostrar Sol').onChange(updateEverything));
  track(folderPhase.add(params, 'sunAzimuth', -180, 180, 0.1).name('Sol azimute').onChange(updateEverything));
  track(folderPhase.add(params, 'sunElevation', -20, 80, 0.1).name('Sol elevação').onChange(updateEverything));
  track(folderPhase.add(params, 'sunDistance', 40, 500, 1).name('Sol distância').onChange(updateEverything));
  track(folderPhase.add(params, 'sunScale', 1, 80, 0.1).name('Sol escala').onChange(updateEverything));
  track(folderPhase.add(params, 'sunFlare', 0, 2.0, 0.01).name('Sol flare').onChange(updateEverything));
  track(folderPhase.add(params, 'showTerminatorLine').name('Linha terminador'));

  const folderMoon = gui.addFolder('Lua procedural');
  track(folderMoon.add(params, 'seed', 1, 999999, 1).name('Seed').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'textureResolution', [1024, 1536, 2048, 3072, 4096]).name('Resolução textura').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'moonBrightness', 0.05, 3.0, 0.01).name('Brilho').onChange(updateEverything));
  track(folderMoon.add(params, 'moonContrast', 0.2, 2.5, 0.01).name('Contraste').onChange(updateEverything));
  track(folderMoon.add(params, 'regolithTint', 0, 1, 0.01).name('Tom regolito').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'roughness', 0.4, 1, 0.01).name('Rugosidade').onChange(updateEverything));
  track(folderMoon.add(params, 'bumpScale', 0, 0.20, 0.001).name('Relevo bump').onChange(updateEverything));
  track(folderMoon.add(params, 'moonSpinSpeed', 0, 0.04, 0.0001).name('Rotação automática'));
  track(folderMoon.add(params, 'rotateMoonY', -180, 180, 0.1).name('Longitude visível').onChange(updateEverything));
  track(folderMoon.add(params, 'rotateMoonX', -90, 90, 0.1).name('Inclinação').onChange(updateEverything));
  track(folderMoon.add(params, 'craterCount', 0, 3500, 1).name('Qtd crateras').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'craterStrength', 0, 1.6, 0.01).name('Força crateras').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'craterRimStrength', 0, 1.2, 0.01).name('Borda crateras').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'mareStrength', 0, 1.6, 0.01).name('Mares lunares').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'mareSoftness', 0.1, 1.4, 0.01).name('Suavidade mares').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'highlandNoise', 0, 1.2, 0.01).name('Ruído planaltos').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'microRelief', 0, 1.2, 0.01).name('Microrelevo').onFinishChange(() => rebuildProceduralTextures(true)));
  track(folderMoon.add(params, 'limbGlow', 0, 0.8, 0.01).name('Halo estilizado').onChange(updateEverything));
  track(folderMoon.add(actions, 'Recriar Lua Procedural'));

  const folderEarth = gui.addFolder('Terra / Satélites');
  track(folderEarth.add(params, 'showEarth').name('Mostrar Terra').onChange(updateEverything));
  track(folderEarth.add(params, 'earthDistance', 20, 240, 1).name('Terra distância').onChange(updateEverything));
  track(folderEarth.add(params, 'earthScale', 0.05, 5.0, 0.01).name('Terra escala').onChange(updateEverything));
  track(folderEarth.add(params, 'earthAzimuth', -180, 180, 0.1).name('Terra azimute').onChange(updateEverything));
  track(folderEarth.add(params, 'earthElevation', -30, 80, 0.1).name('Terra elevação').onChange(updateEverything));
  track(folderEarth.add(params, 'earthBrightness', 0.1, 3.0, 0.01).name('Terra brilho').onChange(updateEverything));
  track(folderEarth.add(params, 'earthCloudOpacity', 0, 1, 0.01).name('Nuvens Terra').onChange(updateEverything));
  track(folderEarth.add(params, 'showSatellites').name('Mostrar satélites').onChange(updateEverything));
  track(folderEarth.add(params, 'satelliteCount', 0, 12, 1).name('Qtd satélites').onFinishChange(() => { createSatellites(true); updateEverything(); }));
  track(folderEarth.add(params, 'satelliteScale', 0.03, 1.2, 0.01).name('Satélite escala').onFinishChange(() => { createSatellites(true); updateEverything(); }));
  track(folderEarth.add(params, 'satelliteOrbitRadius', 5.8, 32, 0.1).name('Raio órbita').onFinishChange(() => { createSatellites(true); createOrbitLines(true); updateEverything(); }));
  track(folderEarth.add(params, 'satelliteOrbitTilt', -90, 90, 0.1).name('Inclinação órbita').onChange(updateEverything));
  track(folderEarth.add(params, 'satelliteSpeed', -1.2, 1.2, 0.001).name('Velocidade órbita'));
  track(folderEarth.add(params, 'satelliteBrightness', 0, 2.4, 0.01).name('Brilho satélites').onChange(updateEverything));
  track(folderEarth.add(params, 'showOrbitLines').name('Mostrar órbitas').onChange(updateEverything));
  track(folderEarth.add(params, 'orbitLineOpacity', 0, 1, 0.01).name('Opacidade órbitas').onChange(updateEverything));

  const folderScience = gui.addFolder('Camada científica');
  track(folderScience.add(params, 'showWaterHydrogen').name('Água/Hidrogênio').onChange(updateEverything));
  track(folderScience.add(params, 'waterSignalStrength', 0, 1.2, 0.01).name('Força H₂O/OH').onChange(updateEverything));
  track(folderScience.add(params, 'showPolarIceHint').name('Realce polar').onChange(updateEverything));

  const folderRender = gui.addFolder('Render / Câmera');
  track(folderRender.add(params, 'cameraMono').name('Preto e branco').onChange(updateFilmLayer));
  track(folderRender.add(params, 'exposure', 0.1, 3.5, 0.01).name('Exposição').onChange(updateEverything));
  track(folderRender.add(params, 'sensorNoise', 0, 0.25, 0.001).name('Ruído sensor'));
  track(folderRender.add(params, 'vignette', 0, 1.2, 0.01).name('Vinheta'));
  track(folderRender.add(params, 'bloomMin', 0, 0.35, 0.001).name('Bloom mínimo'));
  track(folderRender.add(params, 'filmDust', 0, 1.0, 0.01).name('Poeira/filme').onChange(updateFilmLayer));
  track(folderRender.add(params, 'showReticle').name('Marcas ópticas').onChange(updateFilmLayer));
  track(folderRender.add(params, 'labelOverlay').name('Legenda técnica'));
  track(folderRender.add(params, 'labelText').name('Texto legenda'));

  const folderStars = gui.addFolder('Fundo');
  track(folderStars.add(params, 'showStars').name('Mostrar estrelas').onChange(updateEverything));
  track(folderStars.add(params, 'starCount', 0, 5000, 1).name('Qtd estrelas').onFinishChange(createStars));
  track(folderStars.add(params, 'starSize', 0.001, 0.12, 0.001).name('Tam. estrelas').onFinishChange(createStars));
  track(folderStars.add(params, 'starBrightness', 0, 1.2, 0.01).name('Brilho estrelas').onChange(updateEverything));
  track(folderStars.add(params, 'backgroundGradient', 0, 0.5, 0.01).name('Gradiente fundo').onChange(updateEverything));

  const folderJson = gui.addFolder('JSON');
  track(folderJson.add(actions, 'Abrir JSON'));
  track(folderJson.add(actions, 'Atualizar JSON'));
  track(folderJson.add(actions, 'Aplicar JSON'));

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
  folderMoon.open();
  folderEarth.open();
}

function bindUI() {
  btnToggleUI.addEventListener('click', () => toggleUI());
  btnOpenConfig.addEventListener('click', () => openConfigPanel());
  btnCloseConfig.addEventListener('click', () => openConfigPanel(false));
  btnJsonApply.addEventListener('click', () => applyConfigFromText());
  btnJsonExport.addEventListener('click', () => updateConfigText(true));
  btnJsonCopy.addEventListener('click', () => copyConfig());
  btnJsonDownload.addEventListener('click', () => downloadConfigJson());
  btnExport4K.addEventListener('click', () => capturePreset('4k'));
  btnExportVertical.addEventListener('click', () => capturePreset('vertical4k'));
  btnExportSquare.addEventListener('click', () => capturePreset('square4096'));
  btnExportIphone.addEventListener('click', () => capturePreset('iphone17pm'));
  btnExportFree.addEventListener('click', () => captureFree());
  btnReset.addEventListener('click', () => resetCurrentMode());

  configFileEl.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      configJsonEl.value = text;
      setJsonStatus(`Arquivo carregado: ${file.name}`);
    } catch (error) {
      setJsonStatus('Erro ao ler o arquivo JSON.', true);
    } finally {
      configFileEl.value = '';
    }
  });
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

  const beforeKey = getTextureKey();

  Object.entries(preset).forEach(([key, value]) => {
    if (options.forcePreset || (key !== 'freeWidth' && key !== 'freeHeight')) {
      params[key] = value;
    }
  });

  params.sceneProfile = profileName;

  if (beforeKey !== getTextureKey()) {
    rebuildProceduralTextures(true);
  }

  createSatellites(true);
  createOrbitLines(true);
  createStars();
  rebuildSurfaceTerrain();
  updateEverything();
  refreshGui();

  if (!options.skipJsonUpdate) {
    updateConfigText();
  }
}

function resetCurrentMode() {
  applySceneProfile(params.sceneProfile, { forcePreset: true });
}

function updateEverything() {
  updateScene();
  applyCameraFromParams();
  updatePhonePreview();
  updateFilmLayer();
}

function applyCameraFromParams() {
  camera.fov = params.fov;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  if (params.sceneMode === 'Superfície Lunar') {
    camera.position.set(0, params.surfaceCameraHeight, params.surfaceCameraZ);
    controls.target.set(0, params.surfaceLookY, params.surfaceLookZ);
    controls.minDistance = 0.8;
    controls.maxDistance = 120;
    controls.enablePan = true;
  } else {
    camera.position.set(0, 0, params.distance);
    controls.target.set(params.offsetX, params.offsetY, 0);
    controls.minDistance = 3;
    controls.maxDistance = 320;
    controls.enablePan = true;
  }

  controls.update();
}

function updateScene() {
  renderer.toneMappingExposure = params.exposure;

  const backgroundLift = THREE.MathUtils.clamp(params.backgroundGradient, 0, 0.5);
  scene.background = new THREE.Color(backgroundLift * 0.12, backgroundLift * 0.13, backgroundLift * 0.16);

  moonRoot.visible = params.sceneMode === 'Orbital';
  surfaceGroup.visible = params.sceneMode === 'Superfície Lunar';

  moonRoot.position.set(params.offsetX, params.offsetY, 0);
  moonRoot.rotation.z = THREE.MathUtils.degToRad(params.frameRotationZ);
  moonRoot.scale.setScalar(params.subjectScale);

  moonMesh.rotation.x = THREE.MathUtils.degToRad(params.rotateMoonX);
  moonMesh.rotation.y = THREE.MathUtils.degToRad(params.rotateMoonY);
  moonMesh.material.bumpScale = params.bumpScale;
  moonMesh.material.roughness = params.roughness;
  applyMoonMaterialTone();

  if (moonLimbGlow) {
    moonLimbGlow.visible = params.limbGlow > 0.001 && params.sceneMode === 'Orbital';
    moonLimbGlow.material.uniforms.intensity.value = params.limbGlow;
  }

  ambientLight.intensity = params.ambientIntensity;
  sunLight.intensity = params.lightIntensity;

  const phase = THREE.MathUtils.degToRad(params.phaseAngle);
  const elev = THREE.MathUtils.degToRad(params.lightElevation);
  const phaseLightDirection = new THREE.Vector3(
    Math.sin(phase) * Math.cos(elev),
    Math.sin(elev),
    Math.cos(phase) * Math.cos(elev)
  ).normalize();
  sunLight.position.copy(phaseLightDirection.multiplyScalar(80));

  updateSun();
  updateEarth();
  updateSatellites(0);
  updateOrbitLines();
  updateWaterOverlay();
  updateSurface();

  if (starField) {
    starField.visible = params.showStars;
    starField.material.opacity = params.starBrightness;
    starField.material.size = params.starSize;
  }
}

function applyMoonMaterialTone() {
  const gray = params.moonBrightness;
  const warm = params.regolithTint;
  moonMesh.material.color.setRGB(
    gray * (1.0 + warm * 0.10),
    gray * (1.0 + warm * 0.04),
    gray * (1.0 - warm * 0.08)
  );
}

function updateSun() {
  const pos = skyPosition(params.sunDistance, params.sunAzimuth, params.sunElevation);

  sunSprite.visible = params.sunVisible;
  sunCore.visible = params.sunVisible;
  sunSprite.position.copy(pos);
  sunCore.position.copy(pos.clone().multiplyScalar(0.985));

  const baseScale = params.sunScale * (1.0 + params.sunFlare * 0.8);
  sunSprite.scale.setScalar(baseScale);
  sunCore.scale.setScalar(Math.max(0.35, params.sunScale * 0.055));
  sunSprite.material.opacity = Math.min(1, 0.36 + params.sunFlare * 0.42);
}

function updateEarth() {
  earthGroup.visible = params.showEarth;
  const pos = skyPosition(params.earthDistance, params.earthAzimuth, params.earthElevation);
  earthGroup.position.copy(pos);
  earthGroup.scale.setScalar(params.earthScale);
  earthMesh.material.color.setScalar(params.earthBrightness);
  earthClouds.material.opacity = params.earthCloudOpacity;
  earthMesh.rotation.y += 0.00008;
}

function updateSatellites(delta) {
  createSatellites(false);

  satellitesGroup.visible = params.showSatellites && params.satelliteCount > 0;

  const count = satellitesGroup.children.length;
  const radius = params.satelliteOrbitRadius;

  if (params.sceneMode === 'Superfície Lunar') {
    satellitesGroup.position.set(0, 0, 0);
    satellitesGroup.rotation.set(0, 0, 0);

    satellitesGroup.children.forEach((satellite, index) => {
      const drift = performance.now() * 0.00003 * params.satelliteSpeed;
      const az = params.earthAzimuth + 18 + index * 13 + drift * 60;
      const el = 18 + (index % 3) * 5 + Math.sin(drift + index) * 3;
      const pos = skyPosition(54 + index * 4, az, el);
      satellite.position.copy(pos);
      satellite.lookAt(camera.position);
      satellite.traverse((child) => {
        if (child.material?.emissive) {
          child.material.emissiveIntensity = 0.02 + params.satelliteBrightness * 0.10;
        }
      });
    });
    return;
  }

  satellitesGroup.position.copy(moonRoot.position);
  satellitesGroup.rotation.x = THREE.MathUtils.degToRad(params.satelliteOrbitTilt);
  satellitesGroup.rotation.y += delta * params.satelliteSpeed;

  satellitesGroup.children.forEach((satellite, index) => {
    const a = satellite.userData.baseAngle || (index / Math.max(1, count)) * Math.PI * 2;
    satellite.position.set(Math.cos(a) * radius, Math.sin(a * 0.4) * radius * 0.05, Math.sin(a) * radius);
    satellite.lookAt(moonRoot.position);
    satellite.traverse((child) => {
      if (child.material?.emissive) {
        child.material.emissiveIntensity = 0.02 + params.satelliteBrightness * 0.08;
      }
    });
  });
}

function updateOrbitLines() {
  if (!orbitLinesGroup) return;
  orbitLinesGroup.visible = params.showOrbitLines && params.showSatellites && params.sceneMode === 'Orbital';
  orbitLinesGroup.position.copy(moonRoot.position);
  orbitLinesGroup.rotation.x = THREE.MathUtils.degToRad(params.satelliteOrbitTilt);
  orbitLinesGroup.children.forEach((line) => {
    line.material.opacity = params.orbitLineOpacity;
  });
}

function updateWaterOverlay() {
  if (!waterOverlay) return;
  waterOverlay.visible = params.showWaterHydrogen && params.sceneMode === 'Orbital';
  waterOverlay.traverse((child) => {
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

function updateSurface() {
  if (!surfaceTerrain) return;
  const gray = params.terrainBrightness;
  const warm = params.regolithTint;
  surfaceTerrain.material.color.setRGB(
    gray * (0.72 + warm * 0.06),
    gray * (0.70 + warm * 0.03),
    gray * (0.64 - warm * 0.05)
  );
  surfaceTerrain.material.roughness = params.roughness;
}

function updatePhonePreview() {
  const shouldShow = params.showPhoneFrame || (params.sceneProfile === 'Modo Livre' && params.keepPhoneGuideInFreeMode);
  phonePreviewEl.classList.toggle('active', shouldShow);
  phonePreviewEl.classList.toggle('landscape', params.phoneOrientation === 'Horizontal');
  phonePreviewEl.dataset.label = params.phoneOrientation === 'Horizontal'
    ? 'iPhone 17 Pro Max • 2868 × 1320'
    : 'iPhone 17 Pro Max • 1320 × 2868';
}

function updateFilmLayer() {
  document.body.classList.toggle('reticle-on', params.showReticle);
  filmLayerEl.style.opacity = params.showReticle || params.filmDust > 0.001 ? '1' : '0';

  const previewFilters = [];
  if (params.cameraMono) previewFilters.push('grayscale(1)');
  if (Math.abs(params.moonContrast - 1) > 0.01) {
    previewFilters.push(`contrast(${Math.max(0.2, Math.min(2.2, 1 + (params.moonContrast - 1) * 0.55))})`);
  }
  canvas.style.filter = previewFilters.join(' ');
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (moonMesh && params.moonSpinSpeed !== 0 && params.sceneMode === 'Orbital') {
    moonMesh.rotation.y += delta * params.moonSpinSpeed;
  }

  if (waterOverlay) {
    waterOverlay.rotation.y += delta * 0.010;
  }

  if (earthClouds) {
    earthClouds.rotation.y += delta * 0.016;
  }

  if (starField) {
    starField.rotation.y += delta * 0.0008;
  }

  updateSatellites(delta);
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
  if (key === 'h') toggleUI();
  if (key === 'j') openConfigPanel();
  if (key === 'p') capturePreset('4k');
}

function toggleUI() {
  document.body.classList.toggle('ui-hidden');
}

function openConfigPanel(force) {
  const next = typeof force === 'boolean' ? force : !jsonPanelEl.classList.contains('active');
  jsonPanelEl.classList.toggle('active', next);
  if (next && !configJsonEl.value.trim()) updateConfigText();
}

function updateConfigText(showMessage = false) {
  const exportObject = {
    engine: 'ISOMIUM Moon Render Engine',
    version: ENGINE_VERSION,
    instructions: 'Edite params e clique em Aplicar JSON. O objeto também pode ser apenas um JSON parcial, por exemplo: { "phaseAngle": 90, "showEarth": true }.',
    params: { ...params }
  };
  configJsonEl.value = JSON.stringify(exportObject, null, 2);
  if (showMessage) setJsonStatus('Configuração atual enviada para o editor JSON.');
}

function applyConfigFromText() {
  let parsed;
  try {
    parsed = JSON.parse(configJsonEl.value);
  } catch (error) {
    setJsonStatus(`JSON inválido: ${error.message}`, true);
    return;
  }

  const incoming = parsed.params && typeof parsed.params === 'object' ? parsed.params : parsed;
  const beforeTextureKey = getTextureKey();
  const beforeStars = `${params.starCount}|${params.starSize}|${params.seed}`;
  const beforeSatellites = `${params.satelliteCount}|${params.satelliteScale}|${params.satelliteOrbitRadius}`;

  let applied = 0;
  let ignored = 0;

  if (incoming.sceneProfile && PROFILE_PRESETS[incoming.sceneProfile]) {
    applySceneProfile(incoming.sceneProfile, { forcePreset: true, skipJsonUpdate: true });
  }

  Object.entries(incoming).forEach(([key, value]) => {
    if (!(key in params)) {
      ignored += 1;
      return;
    }

    const current = params[key];
    if (typeof current === 'number') {
      const numberValue = Number(value);
      if (Number.isFinite(numberValue)) {
        params[key] = numberValue;
        applied += 1;
      } else {
        ignored += 1;
      }
      return;
    }

    if (typeof current === 'boolean') {
      if (typeof value === 'boolean') {
        params[key] = value;
        applied += 1;
      } else if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
        applied += 1;
      } else {
        ignored += 1;
      }
      return;
    }

    if (typeof current === 'string') {
      params[key] = String(value);
      applied += 1;
      return;
    }

    ignored += 1;
  });

  clampConfigValues();

  if (beforeTextureKey !== getTextureKey()) {
    rebuildProceduralTextures(true);
  }

  const afterStars = `${params.starCount}|${params.starSize}|${params.seed}`;
  if (beforeStars !== afterStars) createStars();

  const afterSatellites = `${params.satelliteCount}|${params.satelliteScale}|${params.satelliteOrbitRadius}`;
  if (beforeSatellites !== afterSatellites) {
    createSatellites(true);
    createOrbitLines(true);
  }

  rebuildSurfaceTerrain();
  updateEverything();
  refreshGui();
  updateConfigText();
  setJsonStatus(`JSON aplicado. Campos aplicados: ${applied}. Ignorados: ${ignored}.`);
}

async function copyConfig() {
  try {
    await navigator.clipboard.writeText(configJsonEl.value);
    setJsonStatus('Configuração copiada.');
  } catch (error) {
    configJsonEl.select();
    document.execCommand('copy');
    setJsonStatus('Configuração copiada pelo método alternativo.');
  }
}

function downloadConfigJson() {
  const blob = new Blob([configJsonEl.value], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `isomium-moon-config-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setJsonStatus('Arquivo JSON baixado.');
}

function setJsonStatus(message, isError = false) {
  jsonStatusEl.textContent = message;
  jsonStatusEl.style.color = isError ? '#ff8a8a' : 'rgba(244, 244, 247, 0.68)';
}

function clampConfigValues() {
  params.textureResolution = nearestAllowedTextureResolution(params.textureResolution);
  params.craterCount = Math.max(0, Math.min(3500, Math.floor(params.craterCount)));
  params.satelliteCount = Math.max(0, Math.min(12, Math.floor(params.satelliteCount)));
  params.freeWidth = Math.max(320, Math.min(12000, Math.floor(params.freeWidth)));
  params.freeHeight = Math.max(320, Math.min(12000, Math.floor(params.freeHeight)));
  params.seed = Math.max(1, Math.min(999999, Math.floor(params.seed)));
  params.bumpScale = Math.max(0, Math.min(0.20, params.bumpScale));
  params.earthDistance = Math.max(20, Math.min(240, params.earthDistance));
  params.sunDistance = Math.max(40, Math.min(500, params.sunDistance));
  if (!PROFILE_PRESETS[params.sceneProfile]) params.sceneProfile = 'Modo Livre';
  if (!['Orbital', 'Superfície Lunar'].includes(params.sceneMode)) params.sceneMode = 'Orbital';
  if (!['Vertical', 'Horizontal'].includes(params.phoneOrientation)) params.phoneOrientation = 'Vertical';
}

function nearestAllowedTextureResolution(value) {
  const allowed = [1024, 1536, 2048, 3072, 4096];
  const number = Number(value) || 2048;
  return allowed.reduce((best, current) => Math.abs(current - number) < Math.abs(best - number) ? current : best, allowed[0]);
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
    alert('Não foi possível exportar a imagem. Tente reduzir a resolução livre ou usar 4K padrão.');
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
    ctx.globalAlpha = Math.min(0.30, params.bloomMin * 2.6);
    ctx.filter = `blur(${Math.max(2, Math.round(Math.min(width, height) * 0.005))}px) brightness(1.40)`;
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
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
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
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
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

function rebuildProceduralTextures(force = false) {
  const key = getTextureKey();
  if (!force && key === textureStateKey) return;
  textureStateKey = key;

  const size = nearestAllowedTextureResolution(params.textureResolution);
  params.textureResolution = size;

  const maps = createProceduralMoonMaps(size, Math.floor(size / 2));
  const albedoTexture = new THREE.CanvasTexture(maps.albedo);
  albedoTexture.colorSpace = THREE.SRGBColorSpace;
  albedoTexture.wrapS = THREE.RepeatWrapping;
  albedoTexture.wrapT = THREE.ClampToEdgeWrapping;
  albedoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const heightTexture = new THREE.CanvasTexture(maps.height);
  heightTexture.colorSpace = THREE.NoColorSpace;
  heightTexture.wrapS = THREE.RepeatWrapping;
  heightTexture.wrapT = THREE.ClampToEdgeWrapping;
  heightTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  if (moonMesh.material.map) moonMesh.material.map.dispose();
  if (moonMesh.material.bumpMap) moonMesh.material.bumpMap.dispose();

  moonMesh.material.map = albedoTexture;
  moonMesh.material.bumpMap = heightTexture;
  moonMesh.material.needsUpdate = true;

  if (surfaceTerrain) {
    surfaceTerrain.material.map = albedoTexture.clone();
    surfaceTerrain.material.map.wrapS = THREE.RepeatWrapping;
    surfaceTerrain.material.map.wrapT = THREE.RepeatWrapping;
    surfaceTerrain.material.map.repeat.set(8, 8);
    surfaceTerrain.material.needsUpdate = true;
  }

  rebuildSurfaceTerrain();
}

function getTextureKey() {
  return TEXTURE_KEYS.map((key) => `${key}:${params[key]}`).join('|');
}

function createProceduralMoonMaps(width, height) {
  const albedo = document.createElement('canvas');
  albedo.width = width;
  albedo.height = height;
  const heightMap = document.createElement('canvas');
  heightMap.width = width;
  heightMap.height = height;

  const aCtx = albedo.getContext('2d', { willReadFrequently: true });
  const hCtx = heightMap.getContext('2d', { willReadFrequently: true });

  const aImage = aCtx.createImageData(width, height);
  const hImage = hCtx.createImageData(width, height);
  const aData = aImage.data;
  const hData = hImage.data;

  const seed = Math.floor(params.seed);
  const baseWarm = params.regolithTint;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const n1 = fbm(u * 7.5 + seed * 0.001, v * 4.0 + seed * 0.002, 4, seed);
      const n2 = fbm(u * 32.0 + 9.0, v * 18.0 + 4.0, 3, seed + 71);
      const n3 = fbm(u * 140.0 + 2.0, v * 74.0 + 8.0, 2, seed + 197);
      const mare = moonMareMask(u, v, params.mareSoftness);
      const highland = (n1 - 0.5) * 42 * params.highlandNoise + (n2 - 0.5) * 14 + (n3 - 0.5) * 8 * params.microRelief;
      const polarDust = lat * 8;
      let shade = 136 + highland + polarDust - mare * 52 * params.mareStrength;
      let heightShade = 128 + (n1 - 0.5) * 32 * params.highlandNoise + (n2 - 0.5) * 18 + (n3 - 0.5) * 20 * params.microRelief - mare * 18;
      const index = (y * width + x) * 4;
      aData[index] = clamp255(shade * (1.0 + baseWarm * 0.10));
      aData[index + 1] = clamp255(shade * (1.0 + baseWarm * 0.04));
      aData[index + 2] = clamp255(shade * (0.96 - baseWarm * 0.08));
      aData[index + 3] = 255;
      hData[index] = clamp255(heightShade);
      hData[index + 1] = clamp255(heightShade);
      hData[index + 2] = clamp255(heightShade);
      hData[index + 3] = 255;
    }
  }

  aCtx.putImageData(aImage, 0, 0);
  hCtx.putImageData(hImage, 0, 0);

  drawMarePatches(aCtx, width, height, params.mareStrength, params.mareSoftness);
  drawCraterField(aCtx, hCtx, width, height, params.craterCount, params.craterStrength, params.craterRimStrength, seed);
  drawRaySystems(aCtx, width, height, seed);
  drawFineRegolith(aCtx, hCtx, width, height, seed);

  return { albedo, height: heightMap };
}

function drawMarePatches(ctx, w, h, strength, softness) {
  const mare = [
    [0.585, 0.420, 0.105, 0.066, -0.20],
    [0.640, 0.497, 0.145, 0.092, 0.24],
    [0.535, 0.545, 0.102, 0.064, -0.08],
    [0.705, 0.388, 0.088, 0.054, 0.12],
    [0.447, 0.452, 0.072, 0.046, 0.18],
    [0.348, 0.536, 0.066, 0.038, -0.24],
    [0.754, 0.578, 0.060, 0.038, 0.05],
    [0.602, 0.605, 0.072, 0.040, 0.16]
  ];

  ctx.save();
  mare.forEach(([u, v, rx, ry, rot]) => {
    ctx.translate(u * w, v * h);
    ctx.rotate(rot);
    const r = Math.max(rx * w, ry * h);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gradient.addColorStop(0, `rgba(20,20,20,${0.24 * strength})`);
    gradient.addColorStop(Math.min(0.86, 0.58 + softness * 0.20), `rgba(24,24,24,${0.17 * strength})`);
    gradient.addColorStop(1, 'rgba(24,24,24,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * w, ry * h, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });
  ctx.restore();
}

function drawCraterField(aCtx, hCtx, w, h, count, strength, rimStrength, seed) {
  const rng = mulberry32(seed + 4417);

  const named = [
    [0.480, 0.600, 23],
    [0.620, 0.363, 18],
    [0.675, 0.530, 15],
    [0.406, 0.425, 16],
    [0.745, 0.615, 12],
    [0.302, 0.555, 13]
  ];

  named.forEach(([u, v, r]) => drawSingleCrater(aCtx, hCtx, u * w, v * h, r * (w / 1024), strength * 0.9, rimStrength * 0.9, rng));

  for (let i = 0; i < count; i++) {
    const u = rng();
    const v = rng();
    const latFactor = 0.70 + Math.abs(v - 0.5) * 0.55;
    const sideBias = 0.8 + Math.abs(u - 0.5) * 0.9;
    const base = Math.pow(rng(), 2.45);
    const r = (1.1 + base * 22.0) * latFactor * sideBias * (w / 2048);
    drawSingleCrater(aCtx, hCtx, u * w, v * h, r, strength, rimStrength, rng);
  }
}

function drawSingleCrater(aCtx, hCtx, x, y, r, strength, rimStrength, rng) {
  if (r <= 0.25) return;
  const squash = 0.78 + rng() * 0.36;
  const rotation = rng() * Math.PI;

  aCtx.save();
  hCtx.save();
  aCtx.translate(x, y);
  hCtx.translate(x, y);
  aCtx.rotate(rotation);
  hCtx.rotate(rotation);

  const inner = aCtx.createRadialGradient(0, 0, 0, 0, 0, r * 1.05);
  inner.addColorStop(0, `rgba(0,0,0,${0.08 * strength})`);
  inner.addColorStop(0.58, `rgba(0,0,0,${0.15 * strength})`);
  inner.addColorStop(0.80, `rgba(245,245,235,${0.10 * rimStrength})`);
  inner.addColorStop(1, 'rgba(255,255,255,0)');
  aCtx.fillStyle = inner;
  aCtx.beginPath();
  aCtx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
  aCtx.fill();

  aCtx.strokeStyle = `rgba(240,240,230,${0.10 * rimStrength})`;
  aCtx.lineWidth = Math.max(0.55, r * 0.12);
  aCtx.beginPath();
  aCtx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
  aCtx.stroke();

  const hInner = hCtx.createRadialGradient(0, 0, 0, 0, 0, r * 1.08);
  hInner.addColorStop(0, `rgba(0,0,0,${0.16 * strength})`);
  hInner.addColorStop(0.55, `rgba(0,0,0,${0.20 * strength})`);
  hInner.addColorStop(0.76, `rgba(255,255,255,${0.24 * rimStrength})`);
  hInner.addColorStop(1, 'rgba(128,128,128,0)');
  hCtx.fillStyle = hInner;
  hCtx.beginPath();
  hCtx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
  hCtx.fill();

  aCtx.restore();
  hCtx.restore();
}

function drawRaySystems(ctx, w, h, seed) {
  const rng = mulberry32(seed + 909);
  const systems = [
    [0.476, 0.610, 0.55],
    [0.703, 0.540, 0.38]
  ];
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  systems.forEach(([u, v, intensity]) => {
    const cx = u * w;
    const cy = v * h;
    const rays = 28;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + rng() * 0.12;
      const len = (0.045 + rng() * 0.085) * w * intensity;
      const width = (0.0015 + rng() * 0.003) * w;
      const gradient = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      gradient.addColorStop(0, `rgba(255,255,240,${0.05 * intensity})`);
      gradient.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
  });
  ctx.restore();
}

function drawFineRegolith(aCtx, hCtx, w, h, seed) {
  const rng = mulberry32(seed + 6023);
  const specks = Math.floor((w * h) / 1600);
  aCtx.save();
  hCtx.save();
  for (let i = 0; i < specks; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const alpha = 0.018 + rng() * 0.030;
    const light = rng() > 0.55;
    const size = 0.45 + rng() * 1.1;
    aCtx.fillStyle = light ? `rgba(255,255,245,${alpha})` : `rgba(0,0,0,${alpha})`;
    aCtx.fillRect(x, y, size, size);
    hCtx.fillStyle = light ? `rgba(255,255,255,${alpha * 1.8})` : `rgba(0,0,0,${alpha * 1.8})`;
    hCtx.fillRect(x, y, size, size);
  }
  aCtx.restore();
  hCtx.restore();
}

function rebuildSurfaceTerrain() {
  if (!surfaceTerrain) return;
  const pos = surfaceTerrain.geometry.attributes.position;
  const seed = Math.floor(params.seed) + 1207;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const n = fbm(x * 0.055 + seed * 0.001, z * 0.055 + seed * 0.002, 5, seed);
    const n2 = fbm(x * 0.22 + 3.5, z * 0.22 + 1.7, 3, seed + 44);
    const bowl = Math.sin(x * 0.08 + seed) * Math.cos(z * 0.06) * 0.04;
    const y = ((n - 0.5) * 2.2 + (n2 - 0.5) * 0.65 + bowl) * params.terrainRelief;
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  surfaceTerrain.geometry.computeVertexNormals();
}

function createProceduralEarthCanvas(width, height) {
  const canvasEl = document.createElement('canvas');
  canvasEl.width = width;
  canvasEl.height = height;
  const ctx = canvasEl.getContext('2d');
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const seed = 4217;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = Math.abs(v - 0.5) * 2;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const continents = fbm(u * 5.0, v * 3.0, 5, seed) + fbm(u * 13.0 + 2, v * 7.0 + 1, 3, seed + 10) * 0.35;
      const ice = smoothstep(0.72, 0.95, lat);
      const land = continents > 0.61 ? 1 : 0;
      let r = land ? 54 : 12;
      let g = land ? 92 : 48;
      let b = land ? 44 : 110;
      if (ice > 0.01) {
        r = mix(r, 230, ice);
        g = mix(g, 236, ice);
        b = mix(b, 240, ice);
      }
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvasEl;
}

function createProceduralCloudCanvas(width, height) {
  const canvasEl = document.createElement('canvas');
  canvasEl.width = width;
  canvasEl.height = height;
  const ctx = canvasEl.getContext('2d');
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const seed = 888;

  for (let y = 0; y < height; y++) {
    const v = y / height;
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const n = fbm(u * 10.0 + 1.2, v * 6.0 + 7.0, 5, seed);
      const bands = Math.abs(Math.sin((v * 10 + n * 1.5) * Math.PI));
      const alpha = smoothstep(0.54, 0.83, n * 0.75 + bands * 0.25) * 210;
      const idx = (y * width + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvasEl;
}

function createSunCanvas(size) {
  const canvasEl = document.createElement('canvas');
  canvasEl.width = size;
  canvasEl.height = size;
  const ctx = canvasEl.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  g.addColorStop(0, 'rgba(255,255,245,1)');
  g.addColorStop(0.14, 'rgba(255,232,168,0.95)');
  g.addColorStop(0.26, 'rgba(255,170,72,0.70)');
  g.addColorStop(0.48, 'rgba(255,95,20,0.26)');
  g.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvasEl;
}

function skyPosition(distance, azimuthDeg, elevationDeg) {
  const az = THREE.MathUtils.degToRad(azimuthDeg);
  const el = THREE.MathUtils.degToRad(elevationDeg);
  return new THREE.Vector3(
    Math.sin(az) * Math.cos(el) * distance,
    Math.sin(el) * distance,
    -Math.cos(az) * Math.cos(el) * distance
  );
}

function moonMareMask(u, v, softness = 0.7) {
  const patches = [
    [0.585, 0.420, 0.120, 0.078],
    [0.640, 0.497, 0.170, 0.115],
    [0.535, 0.545, 0.112, 0.075],
    [0.705, 0.388, 0.100, 0.067],
    [0.447, 0.452, 0.084, 0.056],
    [0.348, 0.536, 0.078, 0.048],
    [0.754, 0.578, 0.068, 0.048],
    [0.602, 0.605, 0.082, 0.050]
  ];
  let m = 0;
  for (const [cx, cy, rx, ry] of patches) {
    const dx = wrapDistance(u, cx) / (rx * softness);
    const dy = (v - cy) / (ry * softness);
    const d = dx * dx + dy * dy;
    m += smoothstep(1.0, 0.0, d);
  }
  return Math.min(1, m);
}

function fbm(x, y, octaves, seed) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 101) * amplitude;
    norm += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value / norm;
}

function valueNoise(x, y, seed) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return mix(mix(a, b, u), mix(c, d, u), v);
}

function hash2(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 17.17) * 43758.5453123;
  return s - Math.floor(s);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}

function wrapDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

function clamp255(value) {
  return Math.max(0, Math.min(255, value));
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(child.material);
      }
    }
  });
}

function disposeMaterial(material) {
  Object.keys(material).forEach((key) => {
    const value = material[key];
    if (value && typeof value === 'object' && typeof value.dispose === 'function') {
      value.dispose();
    }
  });
  material.dispose();
}
