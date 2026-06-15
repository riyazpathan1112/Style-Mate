const express = require("express");
const router = express.Router();
const { getRecommendation } = require("../controllers/outfitController");

router.post("/recommend", getRecommendation);  // POST /api/outfit/recommend

module.exports = router;
