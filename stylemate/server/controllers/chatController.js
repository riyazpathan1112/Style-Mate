const Anthropic = require("@anthropic-ai/sdk");
const store = require("../data/wardrobeStore");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const chat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: "messages array is required" });
  }

  const wardrobe = store.getAll();
  const wardrobeDesc = wardrobe.map(i => `${i.color} ${i.type} (${i.brand})`).join(", ");

  const systemPrompt = `You are StyleMate, a witty and opinionated AI fashion stylist. 
The user's current wardrobe: ${wardrobeDesc}.
Give short, punchy, confident style advice. Maximum 3 sentences per reply. 
Be specific — reference actual wardrobe items when relevant. No bullet lists.`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const reply = response.content[0].text;
    res.json({ success: true, data: { role: "assistant", content: reply } });
  } catch (err) {
    console.error("[Chat] Claude error:", err.message);
    res.status(500).json({ success: false, error: "Failed to get style advice. Check your API key." });
  }
};

module.exports = { chat };
