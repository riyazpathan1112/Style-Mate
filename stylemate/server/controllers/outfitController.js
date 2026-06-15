const Anthropic = require("@anthropic-ai/sdk");
const store = require("../data/wardrobeStore");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const getRecommendation = async (req, res) => {
  const { occasion = "Casual", stylePersona = "classic", weather = "Mild" } = req.body;

  const wardrobe = store.getAll();
  if (wardrobe.length === 0) {
    return res.status(400).json({ success: false, error: "Wardrobe is empty. Add some items first." });
  }

  const wardrobeDesc = wardrobe.map(i => `${i.color} ${i.type} (${i.brand})`).join(", ");

  const prompt = `You are StyleMate, an expert AI outfit stylist. The user's wardrobe contains: ${wardrobeDesc}.

Occasion: ${occasion}
Style persona: ${stylePersona}
Weather: ${weather}

Create a curated outfit from ONLY the items listed above. Respond ONLY with valid JSON, no markdown, no extra text:
{
  "outfit": ["<item 1 exactly as listed>", "<item 2>", "<item 3>"],
  "why": "<2 sentences, specific and stylish reasoning>",
  "tip": "<1 punchy styling tip>",
  "vibe": "<3 descriptive words separated by ·>"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text.replace(/```json|```/g, "").trim();
    const recommendation = JSON.parse(raw);

    res.json({
      success: true,
      data: recommendation,
      meta: { occasion, stylePersona, weather, wardrobeSize: wardrobe.length },
    });
  } catch (err) {
    console.error("[Outfit] Claude error:", err.message);
    res.status(500).json({ success: false, error: "Failed to generate recommendation. Check your API key." });
  }
};

module.exports = { getRecommendation };
