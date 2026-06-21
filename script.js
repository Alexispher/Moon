import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

// ==========================================
// 1. CONFIGURAÇÃO BASE (Cena, Câmera, Renderer)
// ==========================================
const canvas = document.querySelector('#space-canvas');
const flashEl = document.querySelector('#flash');
const phonePreview = document.querySelector('#phone-preview');
const statusEl = document.querySelector('#capture-status');

const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    preserveDrawingBuffer: true, // Necessário para capturar a tela
    alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000'); // Espaço profundo

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 10;

// ==========================================
// 2. CRIAÇÃO DA LUA
// ==========================================
const textureLoader = new THREE.TextureLoader();

// Textura de cor e textura de relevo (bump) para as crateras
const moonColorMap = textureLoader.load('https://www.solarsystemscope.com/textures/download/2k_moon.jpg');
const moonBumpMap = textureLoader.load('https://www.solarsystemscope.com/textures/download/2k_moon.jpg');

const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshStandardMaterial({
    map: moonColorMap,
    bumpMap: moonBumpMap,
    bumpScale: 0.015,
    roughness: 0.8, // A lua reflete luz, mas não é "lisa"
    metalness: 0.0,
});

const moon = new THREE.Mesh(geometry, material);
// Rotaciona para uma posição inicial interessante
moon.rotation.y = Math.PI / 4;
scene.add(moon);

// ==========================================
// 3. ILUMINAÇÃO
// ==========================================
// Luz direcional forte para simular o Sol e criar sombras nas crateras
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(5, 1, 3);
scene.add(sunLight);

// Luz ambiente muito fraca apenas para o lado escuro não ser 100% preto
const ambientLight = new THREE.AmbientLight(0xffffff, 0.02);
scene.add(ambientLight);

// ==========================================
// 4. INTERFACE DE CONTROLE (lil-gui)
// ==========================================
const guiSettings = {
    rotationSpeed: 0.001,
    lightIntensity: 2.5,
    bumpScale: 0.015,
    resetCamera: () => {
        camera.position.set(0, 0, 4);
        controls.target.set(0, 0, 0);
    }
};

const gui = new GUI({ title: 'Parâmetros Lunares' });
gui.add(guiSettings, 'rotationSpeed', 0, 0.01).name('Rotação Automática');
gui.add(guiSettings, 'lightIntensity', 0, 5).name('Luz do Sol').onChange(v => sunLight.intensity = v);
gui.add(guiSettings, 'bumpScale', 0, 0.05).name('Profundidade Cratera').onChange(v => material.bumpScale = v);
gui.add(guiSettings, 'resetCamera').name('Resetar Câmera');

// ==========================================
// 5. SISTEMA DE EXPORTAÇÃO E HUD
// ==========================================
function triggerFlash() {
    flashEl.style.opacity = '1';
    setTimeout(() => { flashEl.style.opacity = '0'; }, 150);
}

function exportRender(width, height, filename) {
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        const originalWidth = canvas.clientWidth;
        const originalHeight = canvas.clientHeight;
        const originalAspect = camera.aspect;

        // Ajusta temporariamente para a resolução de exportação
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        // Captura a imagem
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `isomium_lunar_${filename}.png`;
        link.href = dataURL;
        link.click();

        // Restaura para a visualização da tela
        renderer.setSize(originalWidth, originalHeight);
        camera.aspect = originalAspect;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        triggerFlash();
        statusEl.style.display = 'none';
    }, 100); // Pequeno delay para a UI atualizar o status
}

// Eventos dos botões do HUD
document.getElementById('btn-export-4k').addEventListener('click', () => exportRender(3840, 2160, '4K'));
document.getElementById('btn-export-vertical').addEventListener('click', () => exportRender(2160, 3840, 'Vertical'));
document.getElementById('btn-export-square').addEventListener('click', () => exportRender(4096, 4096, 'Square'));

// Preview interativo para iPhone
const btnIphone = document.getElementById('btn-export-iphone');
btnIphone.addEventListener('mouseenter', () => phonePreview.classList.add('active'));
btnIphone.addEventListener('mouseleave', () => phonePreview.classList.remove('active'));
btnIphone.addEventListener('click', () => exportRender(1320, 2868, 'iPhone17PM'));

// Captura livre (resolução atual da tela)
document.getElementById('btn-export-free').addEventListener('click', () => {
    exportRender(canvas.clientWidth * window.devicePixelRatio, canvas.clientHeight * window.devicePixelRatio, 'Free');
});

document.getElementById('btn-reset').addEventListener('click', guiSettings.resetCamera);

// Ocultar/Mostrar UI
let uiVisible = true;
function toggleUI() {
    uiVisible = !uiVisible;
    document.body.classList.toggle('ui-hidden', !uiVisible);
}
document.getElementById('btn-toggle-ui').addEventListener('click', toggleUI);

// Atalhos de teclado
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') toggleUI();
    if (e.key.toLowerCase() === 'p') exportRender(canvas.clientWidth, canvas.clientHeight, 'Screenshot');
});

// Resizing da janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 6. LOOP DE ANIMAÇÃO
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    // Rotação suave da lua
    moon.rotation.y += guiSettings.rotationSpeed;
    
    controls.update();
    renderer.render(scene, camera);
}

animate();
