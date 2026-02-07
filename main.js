import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.set(0, 100, 250);
camera.lookAt(0, 0, 0);

const starCoords = [];
for (let i = 0; i < 15000; i++) {
    starCoords.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000);
}
const starGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 }));
scene.add(stars);

// --- 2. Sun & Belts ---
const sun = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffdd44 }));
scene.add(sun);

// Create the Asteroid Belts from your previous visual
function createBelt(radius, count, color) {
    const group = new THREE.Group();
    for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshBasicMaterial({ color: color }));
        const angle = (i / count) * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * 10;
        mesh.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 5, Math.sin(angle) * r);
        group.add(mesh);
    }
    return group;
}
const innerBelt = createBelt(100, 1000, 0x888888);
const outerBelt = createBelt(160, 2000, 0xaaaaaa);
scene.add(innerBelt, outerBelt);

// --- 3. Interaction Logic ---
let isLoggingIn = false;
document.getElementById('loginBtn').addEventListener('click', () => {
    isLoggingIn = true;
    document.querySelector('.login-card').style.opacity = '0';
    document.querySelector('.login-card').style.transition = '2s';
});

// --- 4. Animation ---
function animate() {
    requestAnimationFrame(animate);
    
    innerBelt.rotation.y += 0.001;
    outerBelt.rotation.y += 0.0005;
    stars.rotation.y += 0.0001;

    if (isLoggingIn) {
        // Warp Effect: Fly camera toward the sun
        camera.position.z -= 5;
        if (camera.position.z < 50) {
            window.location.href = "dashboard.html"; // Change this to your main app page
        }
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// --- 5. Mouse Parallax Effect ---
// This makes the camera shift slightly when you move your mouse
window.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // We use "lerp" (linear interpolation) for smooth movement
    const targetX = mouseX * 20;
    const targetY = (mouseY * 20) + 100; // Keep the height at 100

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
});

// --- 6. Scanning Animation for Login ---
const loginBtn = document.getElementById('loginBtn');
const statusText = document.getElementById('status');

loginBtn.addEventListener('click', () => {
    // Change UI to "Scanning" mode
    loginBtn.innerText = "VERIFYING BIOMETRICS...";
    loginBtn.style.background = "#ffcc00"; // Change color to warning yellow
    statusText.innerText = "SCANNING ASTEROID SECTOR...";
    statusText.style.color = "#ffcc00";

    // Wait 2 seconds then trigger the "Warp" effect
    setTimeout(() => {
        isLoggingIn = true; // This triggers the movement in your animate loop
        loginBtn.innerText = "ACCESS GRANTED";
        loginBtn.style.background = "#00ff88";
        statusText.innerText = "LAUNCHING...";
        statusText.style.color = "#00ff88";
    }, 2000);
    fetch("dashboard.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("content").innerHTML = data;
  });
});