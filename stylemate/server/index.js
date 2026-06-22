require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const wardrobeRoutes = require("./routes/wardrobe");
const outfitRoutes = require("./routes/outfit");
const chatRoutes = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/wardrobe", wardrobeRoutes);
app.use("/api/outfit", outfitRoutes);
app.use("/api/chat", chatRoutes);

// ── Health check ────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StyleMate API is running", timestamp: new Date().toISOString() });
});

// ── Model info ───────────────────────────────────────────────────
app.get("/api/model", (req, res) => {
  res.json({
    name:        "StyleMate Content-Based Recommender",
    version:     "1.0.0",
    description: "In-house recommendation model using weighted cosine similarity on 5-dimensional clothing feature vectors. No external AI API.",
    features:    ["formality", "warmth", "coverage", "color_neutrality", "versatility"],
    events:      ["casual","office","business","formal","date night","party","wedding","gym","sport","beach","hiking","interview","brunch","travel"],
    weather:     ["hot","warm","mild","cool","cold","rainy"],
    personas:    ["classic","minimalist","streetwear","bohemian","preppy","edgy","sporty","chic"],
    algorithm:   "Greedy category-covering selection with weighted cosine similarity + color harmony multiplier",
  });
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✦  StyleMate API running on http://localhost:${PORT}`);
});

module.exports = app;
