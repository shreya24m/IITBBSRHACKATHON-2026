function toggleFeature(feature) {
    // This finds the button and highlights it
    const btn = event.target;
    btn.classList.toggle('active');
    
    // Logic for 3D changes
    if (feature === 'belt') {
        // Example: Hide/Show your asteroid group
        innerBelt.visible = !innerBelt.visible;
        outerBelt.visible = !outerBelt.visible;
    }
    console.log(`Toggling ${feature} visibility...`);
}

// --- 10. Chatbot Logic ---
function handleChat(event) {
    if (event.key === "Enter") {
        const input = document.getElementById('chat-input');
        const chatBox = document.getElementById('chat-box');
        const userMsg = input.value;

        if (userMsg.trim() === "") return;

        // Display User Message
        chatBox.innerHTML += `<p><strong>You:</strong> ${userMsg}</p>`;
        
        // Simple AI Logic (Replace with Django API call later)
        let botResponse = "Scanning data... No records found for that query.";
        if (userMsg.toLowerCase().includes("hazardous")) {
            botResponse = "Currently tracking 5 potentially hazardous objects in this sector.";
        } else if (userMsg.toLowerCase().includes("sun")) {
            botResponse = "The Sun is at the center of this coordinate system (0,0,0).";
        }

        setTimeout(() => {
            chatBox.innerHTML += `<p style="color:#00f2ff"><strong>AI:</strong> ${botResponse}</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);

        input.value = ""; // Clear input
    }
}
// --- 1. Realistic Starfield ---
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8
    });

    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    return stars;
}

const stars = createStarfield();

// Inside your animate() function, make the stars slowly rotate
function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.0002; // Very slow space movement
    // ... rest of your orbital logic
    renderer.render(scene, camera);
  <script src="dashboard.js"></script>
  ;
}