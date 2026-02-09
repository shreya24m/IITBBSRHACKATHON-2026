// =============================
// LOAD ENV VARIABLES
// =============================
require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();


// =============================
// MIDDLEWARE
// =============================
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`➡ ${req.method} ${req.url}`);
    next();
});


// =============================
// NASA API KEY
// =============================
const NASA_KEY = process.env.NASA_KEY || "DEMO_KEY";

console.log("🔑 NASA key loaded:", NASA_KEY ? "YES" : "NO");


// =============================
// ROOT ROUTE
// =============================
app.get("/", (req, res) => {
    res.send("🚀 Asteroid backend running");
});


// =============================
// NASA FETCH HELPER
// =============================
async function getAsteroids() {

    const response = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/feed?api_key=${NASA_KEY}`
    );

    return response.data.near_earth_objects;
}


// =============================
// RAW ASTEROID DATA ROUTE
// =============================
let cache = null;
let cacheTime = 0;

app.get("/api/asteroids", async (req, res) => {

    const now = Date.now();

    if (cache && now - cacheTime < 60000) {
        console.log("Serving cached NASA data");
        return res.json(cache);
    }

    try {

        console.log("Fetching NASA data from NASA API...");

        const nasaResponse = await axios.get(
            `https://api.nasa.gov/neo/rest/v1/feed?api_key=${NASA_KEY}`
        );

        cache = nasaResponse.data;
        cacheTime = now;

        res.json(cache);

    } catch (err) {

        console.error("NASA ERROR:", err.message);

        res.status(500).json({
            error: "NASA fetch failed",
            details: err.message
        });

    }

});



// =============================
// MAP / DISTANCE GRID ROUTE
// =============================
app.get("/api/map-data", async (req, res) => {

    try {

        const data = await getAsteroids();

        let grid = [];

        Object.values(data).forEach(day => {

            day.forEach(a => {

                grid.push({
                    name: a.name,
                    hazardous: a.is_potentially_hazardous_asteroid,
                    distance_km:
                        a.close_approach_data[0]
                            .miss_distance.kilometers
                });

            });

        });

        res.json(grid);

    } catch (err) {

        console.error("❌ Map data error:", err.message);

        res.status(500).json({
            error: "Map data failed"
        });

    }

});


const getSafeResponse = (text) => {
    // Simple sanitization
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

app.post("/api/chat", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.json({ response: "Please ask a question." });

    const q = query.toLowerCase();

    // Ensure we have data
    if (!cache) {
        try {
            const neo = await getAsteroids();
            cache = { near_earth_objects: neo };
        } catch (e) {
            return res.json({ response: "System initializing... please try again in a moment." });
        }
    }

    const data = cache.near_earth_objects;
    let allAsteroids = [];
    Object.values(data).forEach(day => allAsteroids.push(...day));

    // LOGIC
    if (q.includes("limit") || q.includes("secret") || q.includes("password")) {
        return res.json({ response: "ACCESS DENIED. Classified information." });
    }

    if (q.includes("hello") || q.includes("hi ")) {
        return res.json({ response: "Greetings. I am AstroScan AI. Ask me about asteroid data." });
    }

    if (q.includes("how many") || q.includes("count")) {
        return res.json({ response: `Current scan detects ${allAsteroids.length} near-earth objects in this sector.` });
    }

    if (q.includes("hazardous") || q.includes("danger")) {
        const hazardous = allAsteroids.filter(a => a.is_potentially_hazardous_asteroid);
        const names = hazardous.map(a => a.name).slice(0, 3).join(", ");
        return res.json({ response: `WARNING: ${hazardous.length} hazardous objects detected. Notable: ${names || "None"}...` });
    }

    if (q.includes("closest") || q.includes("nearest")) {
        const sorted = allAsteroids.sort((a, b) =>
            parseFloat(a.close_approach_data[0].miss_distance.kilometers) -
            parseFloat(b.close_approach_data[0].miss_distance.kilometers)
        );
        const closest = sorted[0];
        const dist = parseInt(closest.close_approach_data[0].miss_distance.kilometers);
        return res.json({ response: `Closest object is ${closest.name} at ${dist} km.` });
    }

    if (q.includes("fastest")) {
        const sorted = allAsteroids.sort((a, b) =>
            parseFloat(b.close_approach_data[0].relative_velocity.kilometers_per_hour) -
            parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour)
        );
        const fastest = sorted[0];
        const speed = parseInt(fastest.close_approach_data[0].relative_velocity.kilometers_per_hour);
        return res.json({ response: `Fastest object is ${fastest.name} traveling at ${speed} km/h.` });
    }

    // Specific asteroid lookup
    const found = allAsteroids.find(a => q.includes(a.name.toLowerCase().replace(/[()]/g, "")));
    if (found) {
        const dist = parseInt(found.close_approach_data[0].miss_distance.kilometers);
        const isHaz = found.is_potentially_hazardous_asteroid ? "HAZARDOUS" : "safe";
        return res.json({ response: `Object ${found.name}: Status ${isHaz}. Distance: ${dist} km.` });
    }

    return res.json({ response: "Query unclear. I can analyze: 'count', 'hazardous', 'closest', 'fastest', or specific asteroid names." });
});

// =============================
// ALERT MODE ROUTE
// =============================
app.get("/api/alerts", async (req, res) => {

    try {

        const data = await getAsteroids();

        let alerts = [];

        Object.values(data).forEach(day => {

            day.forEach(a => {

                const dist = parseFloat(
                    a.close_approach_data[0]
                        .miss_distance.kilometers
                );

                if (dist < 500000) {

                    alerts.push({
                        name: a.name,
                        distance_km: dist,
                        hazardous:
                            a.is_potentially_hazardous_asteroid
                    });

                }

            });

        });

        res.json(alerts);

    } catch (err) {

        console.error("❌ Alert check failed:", err.message);

        res.status(500).json({
            error: "Alert check failed"
        });

    }

});


// =============================
// SIMPLE LOGIN ROUTE
// =============================
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (username && password) {

        console.log("🔐 Login attempt:", username);

        res.json({ success: true });

    } else {

        res.status(401).json({ success: false });

    }

});


// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `🚀 Server running → http://localhost:${PORT}`
    );

});
