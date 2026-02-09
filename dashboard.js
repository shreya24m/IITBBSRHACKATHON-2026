import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ================= ENGINE ================= */

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 10000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);

document.getElementById('canvas-container')
  .appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.set(0, 500, 1000);

/* ================= STARS ================= */

const starGeo = new THREE.BufferGeometry();
const verts = [];

for (let i = 0; i < 25000; i++) {
  verts.push(
    (Math.random() - .5) * 8000,
    (Math.random() - .5) * 8000,
    (Math.random() - .5) * 8000
  );
}

starGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(verts, 3)
);

scene.add(
  new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ size: 1.5, color: 0xffffff })
  )
);

/* ================= GRID ================= */

const gridHelper =
  new THREE.GridHelper(2000, 50, 0x00f2ff, 0x002222);

gridHelper.visible = false;
scene.add(gridHelper);

/* ================= SUN + EARTH ================= */

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(45, 64, 64),
  new THREE.MeshStandardMaterial({
    emissive: 0xffaa00,
    color: 0xff8800
  })
);

scene.add(sun);

const earthGroup = new THREE.Group();

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(18, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x2233ff })
);

earth.position.x = 320;
earthGroup.add(earth);
scene.add(earthGroup);

/* ================= ASTEROID BELT ================= */

const beltGroup = new THREE.Group();
scene.add(beltGroup);

for (let i = 0; i < 4000; i++) {

  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(Math.random() * 2 + .5),
    new THREE.MeshStandardMaterial({ color: 0x777777 })
  );

  const angle = Math.random() * Math.PI * 2;
  const dist = 500 + Math.random() * 150;

  rock.position.set(
    Math.cos(angle) * dist,
    (Math.random() - .5) * 20,
    Math.sin(angle) * dist
  );

  rock.userData.alertLevel = Math.random();

  beltGroup.add(rock);
}

/* ================= LIGHT ================= */

scene.add(new THREE.PointLight(0xffffff, 25000, 4000));
scene.add(new THREE.AmbientLight(0xffffff, .3));

/* ================= TOGGLES ================= */

let isMetric = true;
let alertActive = false;

window.toggleUnits = () => {
  isMetric = !isMetric;
  document.getElementById('unit-toggle')
    .innerText = isMetric ? "UNIT: METRIC" : "UNIT: IMPERIAL";
};

window.toggleGrid = () => {
  gridHelper.visible = !gridHelper.visible;
};

window.toggleAlertMode = () => {

  alertActive = !alertActive;

  for (let i = 0; i < beltGroup.children.length; i++) {

    const r = beltGroup.children[i];

    if (alertActive && r.userData.alertLevel > .85)
      r.material.color.setHex(0xff0000);
    else
      r.material.color.setHex(0x777777);

  }

  const btn = document.getElementById('alert-toggle');

  btn.innerText = alertActive ? "ALERT: ON" : "ALERT: OFF";
  btn.classList.toggle("active-alert");
};

window.toggleLearnPanel = () => {
  document.getElementById('learn-panel')
    .classList.toggle('active');
};

/* ================= CAMERA SEARCH ================= */

window.handleSearch = (e) => {

  if (e.key === "Enter") {

    const q = e.target.value.toLowerCase();

    document.getElementById('chat-feedback')
      .innerText = `Searching: ${q}`;

    if (q.includes("earth")) {
      camera.position.set(320, 50, 350);
      controls.target.copy(earth.position);
    }

    e.target.value = "";
  }
};

/* ===================================================
🚀 ASTEROID DATABASE FETCH — NO forEach VERSION
=================================================== */

const asteroidBtn =
  document.getElementById("asteroid-btn");

if (asteroidBtn) {

  asteroidBtn.onclick = async () => {

    const name = document
      .getElementById("asteroid-input")
      .value.toLowerCase();

    const display =
      document.getElementById("asteroid-display");

    if (!name) {
      display.innerText = "⚠ Enter asteroid name";
      return;
    }

    display.innerText = "🚀 Fetching asteroid data...";

    try {

      const res =
        await fetch("http://127.0.0.1:3000/api/asteroids");

      const data = await res.json();

      let found = null;

      const neo = data.near_earth_objects;

      // SAFE LOOP — ZERO forEach
      for (const date in neo) {

        const day = neo[date];

        if (!Array.isArray(day)) continue;

        for (let i = 0; i < day.length; i++) {

          const ast = day[i];

          if (ast.name.toLowerCase().includes(name)) {
            found = ast;
            break;
          }

        }

        if (found) break;
      }

      if (!found) {
        display.innerText = "❌ Asteroid not found";
        return;
      }

      const close = found.close_approach_data[0];

      display.innerHTML = `
🚀 ${found.name}

Hazardous:
${found.is_potentially_hazardous_asteroid ? "YES ⚠️" : "No"}

Distance:
${parseInt(close.miss_distance.kilometers)} km

Velocity:
${parseInt(close.relative_velocity.kilometers_per_hour)} km/h
`;

    } catch (err) {

      display.innerText = "⚠ Backend fetch failed";
      console.error(err);

    }

  };

}

/* ================= ANIMATION ================= */

function animate() {

  requestAnimationFrame(animate);

  earthGroup.rotation.y += .002;
  beltGroup.rotation.y += .0004;

  controls.update();
  renderer.render(scene, camera);

}

animate();

/* ================= RESIZE ================= */

addEventListener('resize', () => {

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);

});

