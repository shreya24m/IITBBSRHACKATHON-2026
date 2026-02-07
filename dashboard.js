import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * --- 1. ENGINE SETUP ---
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container')?.appendChild(renderer.domElement) || document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.set(0, 500, 1000);

/**
 * --- 2. STAR CLUSTER & GRID OVERLAY ---
 */
function createStarCluster(count) {
    const geo = new THREE.BufferGeometry();
    const positions = [], colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
        positions.push((Math.random() - 0.5) * 8000, (Math.random() - 0.5) * 8000, (Math.random() - 0.5) * 8000);
        color.setHSL(0.6, 0.2, Math.random());
        colors.push(color.r, color.g, color.b);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.8 }));
}
const starCluster = createStarCluster(25000);
scene.add(starCluster);

const gridHelper = new THREE.GridHelper(2000, 50, 0x00f2ff, 0x002222);
gridHelper.visible = false;
scene.add(gridHelper);

/**
 * --- 3. 3D BODIES & ORBITAL LINES ---
 */
const sun = new THREE.Mesh(new THREE.SphereGeometry(45, 64, 64), new THREE.MeshStandardMaterial({ emissive: 0xffaa00, emissiveIntensity: 1.5, color: 0xff8800 }));
scene.add(sun);

const earthGroup = new THREE.Group();
const earth = new THREE.Mesh(new THREE.SphereGeometry(18, 32, 32), new THREE.MeshStandardMaterial({ color: 0x2233ff }));
earth.position.x = 320;
earthGroup.add(earth);
scene.add(earthGroup);

function createOrbitLine(radius, color, opacity = 0.3) {
    const pts = [];
    for (let i = 0; i <= 128; i++) pts.push(new THREE.Vector3(Math.cos((i / 128) * Math.PI * 2) * radius, 0, Math.sin((i / 128) * Math.PI * 2) * radius));
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    scene.add(line);
}
createOrbitLine(320, 0x00f2ff, 0.5);

/**
 * --- 4. DEFINITE ASTEROID BELT & PULSE RINGS ---
 */
const beltGroup = new THREE.Group();
const alertRings = [];
scene.add(beltGroup);

class PulseRing {
    constructor(parent, color) {
        this.mesh = new THREE.Mesh(new THREE.RingGeometry(1, 1.2, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
        this.mesh.position.copy(parent.position);
        this.scale = 1;
        scene.add(this.mesh);
    }
    update() {
        this.scale += 0.05;
        this.mesh.scale.set(this.scale, this.scale, this.scale);
        this.mesh.material.opacity -= 0.02;
        this.mesh.lookAt(camera.position);
        if (this.mesh.material.opacity <= 0) { this.scale = 1; this.mesh.material.opacity = 0.8; }
    }
}

function buildBelt(inner, outer, count) {
    for (let i = 0; i < count; i++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random() * 2 + 0.5, 0), new THREE.MeshStandardMaterial({ color: 0x777777 }));
        const angle = Math.random() * Math.PI * 2;
        const dist = inner + Math.random() * (outer - inner);
        rock.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 20, Math.sin(angle) * dist);
        rock.userData = { alertLevel: Math.random() }; // Hidden data for alert mode
        beltGroup.add(rock);
    }
}
buildBelt(500, 650, 4000);

/**
 * --- 5. HACKATHON TOGGLE LOGIC ---
 */
let isMetric = true, alertActive = false;

window.toggleUnits = () => {
    isMetric = !isMetric;
    document.getElementById('unit-toggle').innerText = isMetric ? "UNIT: METRIC" : "UNIT: IMPERIAL";
};

window.toggleGrid = () => {
    gridHelper.visible = !gridHelper.visible;
    document.getElementById('grid-toggle').classList.toggle('active-btn');
};

window.toggleAlertMode = () => {
    alertActive = !alertActive;
    const btn = document.getElementById('alert-toggle');
    if (alertActive) {
        btn.innerText = "ALERT: ON";
        beltGroup.children.forEach(rock => {
            const level = rock.userData.alertLevel;
            if (level > 0.95) { // HIGH (Red)
                rock.material.color.setHex(0xff0000);
                alertRings.push(new PulseRing(rock, 0xff0000));
            } else if (level > 0.85) { // MEDIUM (Orange)
                rock.material.color.setHex(0xffa500);
                alertRings.push(new PulseRing(rock, 0xffa500));
            } else if (level > 0.70) { // LOW (Yellow)
                rock.material.color.setHex(0xffff00);
            }
        });
    } else {
        btn.innerText = "ALERT: OFF";
        beltGroup.children.forEach(rock => rock.material.color.setHex(0x777777));
        alertRings.forEach(r => scene.remove(r.mesh));
        alertRings.length = 0;
    }
};

window.toggleLearnPanel = () => document.getElementById('learn-panel').classList.toggle('active');

/**
 * --- 6. CHATBOT / SEARCH LOGIC ---
 */
window.handleSearch = (event) => {
    if (event.key === 'Enter') {
        const query = event.target.value.toLowerCase();
        const feedback = document.getElementById('chat-feedback');
        feedback.innerText = `Searching for ${query} in NASA Database...`;
        // Simulate zoom to Earth if query is "earth"
        if (query.includes("earth")) {
            camera.position.set(320, 50, 350);
            controls.target.copy(earth.position);
        }
        event.target.value = "";
    }
};

/**
 * --- 7. ANIMATION & LIGHTING ---
 */
scene.add(new THREE.PointLight(0xffffff, 25000, 4000), new THREE.AmbientLight(0xffffff, 0.3));

function animate() {
    requestAnimationFrame(animate);
    earthGroup.rotation.y += 0.002;
    beltGroup.rotation.y += 0.0004;
    starCluster.rotation.y += 0.00003;
    if (alertActive) alertRings.forEach(r => r.update());
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
