router.post("/ask", async(req,res)=>{
  const {question} = req.body;

  const data = await getAsteroids();

  const result = analyze(question,data);

  res.json(result);
});
