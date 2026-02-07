// routes/auth.js
router.post("/login", async (req,res)=>{
  const {email,password} = req.body;

  // verify user
  const token = jwt.sign({email}, process.env.SECRET);

  res.json({token});
});
