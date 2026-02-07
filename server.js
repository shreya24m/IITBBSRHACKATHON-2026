const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===== NASA NeoWS endpoint =====
app.get("/api/asteroids", async (req, res) => {
    try {

        const nasaResponse = await axios.get(
            "https://api.nasa.gov/neo/rest/v1/feed?api_key=DEMO_KEY"
        );

        res.json(nasaResponse.data);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch asteroid data" });
    }
});

// simple fake login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.listen(3000, () => {
    console.log("Server running → http://localhost:3000");
});
