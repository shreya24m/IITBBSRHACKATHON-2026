router.post("/scan", upload.single("image"), (req,res)=>{
  // send image to ML model
  res.json({ result:"Possible asteroid detected"});
});
