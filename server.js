const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`➡ ${req.method} ${req.url}`);
    next();
});
app.get("/", (req, res) => {
    res.send("🚀 Backend running");
});


const NASA_KEY = process.env.NASA_KEY || "DEMO_KEY";


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
// RAW ASTEROID DATA
// =============================
app.get("/api/asteroids", async (req, res) => {
    try {

        console.log("📡 Request received → /api/asteroids");

        const nasaResponse = await axios.get(
            "https://api.nasa.gov/neo/rest/v1/feed?api_key=DEMO_KEY"
        );

        console.log("✅ NASA data fetched successfully");

        res.json(nasaResponse.data);

    } catch (error) {

        console.error("❌ Fetch failed:", error.message);

        res.status(500).json({ error: "Failed to fetch asteroid data" });
    }
});



// =============================
// MAP / DISTANCE GRID DATA
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
                        a.close_approach_data[0].miss_distance.kilometers
                });
            });
        });

        res.json(grid);

    } catch (err) {
        res.status(500).json({ error: "Map data failed" });
    }
});


// =============================
// ALERT MODE — CLOSE ASTEROIDS
// =============================
app.get("/api/alerts", async (req, res) => {
    try {
        const data = await getAsteroids();

        let alerts = [];

        Object.values(data).forEach(day => {
            day.forEach(a => {
                const dist =
                    parseFloat(
                        a.close_approach_data[0].miss_distance.kilometers
                    );

                if (dist < 500000) {
                    alerts.push({
                        name: a.name,
                        distance_km: dist,
                        hazardous: a.is_potentially_hazardous_asteroid
                    });
                }
            });
        });

        res.json(alerts);

    } catch (err) {
        res.status(500).json({ error: "Alert check failed" });
    }
});


// =============================
// SIMPLE LOGIN ROUTE
// =============================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});


// =============================
// SERVER START
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running → http://localhost:${PORT}`);
});
