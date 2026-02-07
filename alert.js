router.get("/alerts", async(req,res)=>{
  const data = await getAsteroids();

  const alerts = data.filter(a =>
    a.close_approach_data[0].miss_distance.kilometers < 500000
  );

  res.json(alerts);
});
