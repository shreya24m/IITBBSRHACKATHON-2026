const axios = require('axios');

async function check() {
  try {
    console.log("Fetching...");
    const res = await axios.get('http://127.0.0.1:3000/api/asteroids');
    const data = res.data;
    // The structure from server.js implies the cache IS the response from NASA.
    // endpoint /api/asteroids returns `cache` which is `nasaResponse.data`.
    // nasaResponse.data has .near_earth_objects

    const neo = data.near_earth_objects;
    let names = [];
    if (neo) {
      Object.values(neo).forEach(day => {
        day.forEach(a => {
          names.push(a.name);
        });
      });
    }

    console.log("Found asteroids:", names.slice(0, 5));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

check();
