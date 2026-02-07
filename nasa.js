router.get("/asteroids", async(req,res)=>{
  const response = await axios.get(
    `https://api.nasa.gov/neo/rest/v1/feed?api_key=${process.env.NASA}`
  );

  res.json(response.data);
});
router.get("/map-data", async(req,res)=>{
  const asteroids = await getAsteroids();

  const grid = asteroids.map(a=>({
    name: a.name,
    distance: a.close_approach_data[0].miss_distance.kilometers
  }));

  res.json(grid);
});
