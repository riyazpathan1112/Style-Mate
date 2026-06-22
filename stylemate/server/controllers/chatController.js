const OpenAI = require("openai").default;
const store = require("../data/wardrobeStore");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ success: true, data: { role: "assistant", content: reply } });
  } catch (err) {
    console.error("[Chat] OpenAI error:", err.message);
    res.status(500).json({ success: false, error: "Failed to get style advice. Check your API key." });
  }
};

module.exports = { chat };
