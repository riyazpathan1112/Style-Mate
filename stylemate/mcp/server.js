require("dotenv").config({ path: require("path").resolve(__dirname, "../server/.env") });

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const OpenAI = require("openai").default;
const fetch = require("node-fetch");

// ── Config ──────────────────────────────────────────────────────
const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Helpers ─────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`);
  return json;
}

// ── MCP Server ──────────────────────────────────────────────────
const server = new McpServer({
  name: "stylemate",
  version: "1.0.0",
  description: "StyleMate – AI wardrobe & outfit assistant powered by ChatGPT",
});

// ── Tool: list_wardrobe ─────────────────────────────────────────
server.tool(
  "list_wardrobe",
  "List all clothing items currently in the wardrobe",
  {},
  async () => {
    const { data } = await apiFetch("/wardrobe");
    const text = data.length === 0
      ? "The wardrobe is empty."
      : data.map(i => `[${i.id}] ${i.color} ${i.type} – ${i.brand} (tags: ${(i.tags || []).join(", ") || "none"})`).join("\n");
    return { content: [{ type: "text", text }] };
  }
);

// ── Tool: add_wardrobe_item ─────────────────────────────────────
server.tool(
  "add_wardrobe_item",
  "Add a new clothing item to the wardrobe",
  {
    type:  z.string().describe("Clothing type, e.g. Shirt, Jeans, Blazer"),
    color: z.string().describe("Color of the item, e.g. White, Navy"),
    brand: z.string().describe("Brand name, e.g. Zara, H&M, Nike"),
    tags:  z.array(z.string()).optional().describe("Style tags, e.g. ['casual', 'formal']"),
  },
  async ({ type, color, brand, tags }) => {
    const { data } = await apiFetch("/wardrobe", {
      method: "POST",
      body: JSON.stringify({ type, color, brand, tags: tags || [] }),
    });
    return { content: [{ type: "text", text: `Added: [${data.id}] ${data.color} ${data.type} – ${data.brand}` }] };
  }
);

// ── Tool: update_wardrobe_item ──────────────────────────────────
server.tool(
  "update_wardrobe_item",
  "Update an existing wardrobe item by its ID",
  {
    id:    z.number().describe("The numeric ID of the item to update"),
    type:  z.string().optional(),
    color: z.string().optional(),
    brand: z.string().optional(),
    tags:  z.array(z.string()).optional(),
  },
  async ({ id, ...fields }) => {
    const { data } = await apiFetch(`/wardrobe/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    });
    return { content: [{ type: "text", text: `Updated: [${data.id}] ${data.color} ${data.type} – ${data.brand}` }] };
  }
);

// ── Tool: remove_wardrobe_item ──────────────────────────────────
server.tool(
  "remove_wardrobe_item",
  "Remove a clothing item from the wardrobe by its ID",
  {
    id: z.number().describe("The numeric ID of the item to remove"),
  },
  async ({ id }) => {
    const result = await apiFetch(`/wardrobe/${id}`, { method: "DELETE" });
    return { content: [{ type: "text", text: result.message || `Item ${id} removed.` }] };
  }
);

// ── Tool: get_outfit_recommendation ────────────────────────────
server.tool(
  "get_outfit_recommendation",
  "Generate a curated outfit recommendation from the wardrobe using StyleMate's built-in recommendation model (no external AI)",
  {
    occasion:     z.string().optional().default("Casual").describe("Event or occasion, e.g. Casual, Office, Date Night, Wedding, Interview"),
    stylePersona: z.string().optional().default("classic").describe("Style persona, e.g. classic, streetwear, minimalist, chic"),
    weather:      z.string().optional().default("Mild").describe("Weather conditions, e.g. Hot, Cold, Mild, Rainy"),
  },
  async ({ occasion, stylePersona, weather }) => {
    const result = await apiFetch("/outfit", {
      method: "POST",
      body: JSON.stringify({ occasion, stylePersona, weather }),
    });

    const d = result.data;
    const lines = [
      `Outfit: ${d.outfit.join(", ")}`,
      `Why: ${d.why}`,
      `Tip: ${d.tip}`,
      `Vibe: ${d.vibe}`,
      `Confidence: ${d.confidence}%`,
    ];
    if (d.scores && d.scores.length > 0) {
      lines.push(`Scores: ${d.scores.map(s => `${s.item} (${s.score}%)`).join(", ")}`);
    }
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Tool: chat_with_stylist ─────────────────────────────────────
server.tool(
  "chat_with_stylist",
  "Chat with the StyleMate AI fashion stylist (ChatGPT) for personalised style advice",
  {
    message: z.string().describe("Your style question or message to the stylist"),
  },
  async ({ message }) => {
    const { data: wardrobe } = await apiFetch("/wardrobe");
    const wardrobeDesc = wardrobe.length > 0
      ? wardrobe.map(i => `${i.color} ${i.type} (${i.brand})`).join(", ")
      : "empty wardrobe";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 256,
      messages: [
        {
          role: "system",
          content: `You are StyleMate, a witty and opinionated AI fashion stylist. The user's current wardrobe: ${wardrobeDesc}. Give short, punchy, confident style advice. Maximum 3 sentences per reply. Be specific — reference actual wardrobe items when relevant. No bullet lists.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    return { content: [{ type: "text", text: reply }] };
  }
);

// ── Start ───────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("StyleMate MCP server running (stdio)");
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
