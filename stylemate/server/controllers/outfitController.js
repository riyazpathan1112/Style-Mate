const { recommend } = require("../model/styleRecommender");
const store = require("../data/wardrobeStore");

const getRecommendation = (req, res) => {
  const { occasion = "Casual", stylePersona = "classic", weather = "Mild" } = req.body;

  const wardrobe = store.getAll();
  if (wardrobe.length === 0) {
    return res.status(400).json({ success: false, error: "Wardrobe is empty. Add some items first." });
  }

  try {
    const result = recommend({ wardrobe, occasion, weather, stylePersona });

    if (result.outfit.length === 0) {
      return res.status(422).json({ success: false, error: "Could not assemble an outfit from current wardrobe items." });
    }

    res.json({
      success: true,
      data: {
        outfit:     result.outfit,
        why:        result.why,
        tip:        result.tip,
        vibe:       result.vibe,
        confidence: result.confidence,
        scores:     result.scores,
      },
      meta: { occasion, stylePersona, weather, wardrobeSize: wardrobe.length, model: result.model },
    });
  } catch (err) {
    console.error("[Outfit] Model error:", err.message);
    res.status(500).json({ success: false, error: "Recommendation model failed." });
  }
};

module.exports = { getRecommendation };
