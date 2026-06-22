/**
 * StyleMate Recommendation Model
 *
 * Architecture: Content-Based Filtering with Weighted Cosine Similarity
 *
 * Pipeline:
 *  1. Feature Encoding  – clothing type + color  →  5-dim feature vector
 *  2. Event Profiling   – occasion + weather + persona  →  target vector
 *  3. Item Scoring      – weighted cosine similarity(item_vec, target_vec)
 *  4. Outfit Assembly   – greedy category-covering selection + color harmony
 *  5. Explanation       – human-readable output derived from scores
 *
 * Feature Vector Dimensions:
 *  [0] formality    – 0.0 (loungewear) → 1.0 (black-tie)
 *  [1] warmth       – 0.0 (light/cool) → 1.0 (heavy/warm)
 *  [2] coverage     – 0.0 (minimal)    → 1.0 (full coverage)
 *  [3] neutrality   – 0.0 (bold/vivid) → 1.0 (black/white/grey)
 *  [4] versatility  – 0.0 (niche)      → 1.0 (pairs with anything)
 */

// ── 1. Clothing Type → Feature Map ──────────────────────────────────────────
const TYPE_MAP = {
  "t-shirt":   { formality: 0.10, warmth: 0.20, coverage: 0.30, cat: "top" },
  "tshirt":    { formality: 0.10, warmth: 0.20, coverage: 0.30, cat: "top" },
  "shirt":     { formality: 0.65, warmth: 0.25, coverage: 0.50, cat: "top" },
  "blouse":    { formality: 0.60, warmth: 0.20, coverage: 0.50, cat: "top" },
  "polo":      { formality: 0.40, warmth: 0.25, coverage: 0.40, cat: "top" },
  "sweater":   { formality: 0.35, warmth: 0.75, coverage: 0.60, cat: "top" },
  "hoodie":    { formality: 0.10, warmth: 0.65, coverage: 0.60, cat: "top" },
  "tank":      { formality: 0.05, warmth: 0.05, coverage: 0.15, cat: "top" },
  "top":       { formality: 0.30, warmth: 0.20, coverage: 0.35, cat: "top" },
  "jeans":     { formality: 0.20, warmth: 0.45, coverage: 0.70, cat: "bottom" },
  "trousers":  { formality: 0.75, warmth: 0.40, coverage: 0.75, cat: "bottom" },
  "pants":     { formality: 0.50, warmth: 0.40, coverage: 0.70, cat: "bottom" },
  "chinos":    { formality: 0.55, warmth: 0.40, coverage: 0.72, cat: "bottom" },
  "shorts":    { formality: 0.10, warmth: 0.05, coverage: 0.25, cat: "bottom" },
  "skirt":     { formality: 0.50, warmth: 0.20, coverage: 0.45, cat: "bottom" },
  "leggings":  { formality: 0.05, warmth: 0.40, coverage: 0.65, cat: "bottom" },
  "dress":     { formality: 0.65, warmth: 0.25, coverage: 0.65, cat: "full" },
  "gown":      { formality: 0.95, warmth: 0.30, coverage: 0.80, cat: "full" },
  "suit":      { formality: 0.95, warmth: 0.60, coverage: 0.90, cat: "full" },
  "blazer":    { formality: 0.85, warmth: 0.50, coverage: 0.70, cat: "layer" },
  "jacket":    { formality: 0.45, warmth: 0.65, coverage: 0.75, cat: "layer" },
  "coat":      { formality: 0.60, warmth: 0.90, coverage: 0.90, cat: "layer" },
  "cardigan":  { formality: 0.35, warmth: 0.65, coverage: 0.65, cat: "layer" },
  "vest":      { formality: 0.70, warmth: 0.40, coverage: 0.50, cat: "layer" },
  "sneakers":  { formality: 0.10, warmth: 0.30, coverage: 0.40, cat: "footwear" },
  "shoes":     { formality: 0.80, warmth: 0.30, coverage: 0.50, cat: "footwear" },
  "boots":     { formality: 0.50, warmth: 0.75, coverage: 0.65, cat: "footwear" },
  "loafers":   { formality: 0.65, warmth: 0.25, coverage: 0.45, cat: "footwear" },
  "sandals":   { formality: 0.20, warmth: 0.05, coverage: 0.15, cat: "footwear" },
  "heels":     { formality: 0.85, warmth: 0.10, coverage: 0.25, cat: "footwear" },
  "oxfords":   { formality: 0.90, warmth: 0.30, coverage: 0.50, cat: "footwear" },
};

// Fallback when no type key matches
const TYPE_FALLBACK = { formality: 0.40, warmth: 0.35, coverage: 0.50, cat: "top" };

// ── 2. Color → Feature Map ──────────────────────────────────────────────────
const COLOR_MAP = {
  "black":    { neutrality: 1.00, versatility: 1.00 },
  "white":    { neutrality: 0.95, versatility: 0.95 },
  "grey":     { neutrality: 0.90, versatility: 0.90 },
  "gray":     { neutrality: 0.90, versatility: 0.90 },
  "navy":     { neutrality: 0.80, versatility: 0.85 },
  "beige":    { neutrality: 0.75, versatility: 0.80 },
  "cream":    { neutrality: 0.70, versatility: 0.78 },
  "brown":    { neutrality: 0.60, versatility: 0.72 },
  "olive":    { neutrality: 0.50, versatility: 0.65 },
  "blue":     { neutrality: 0.35, versatility: 0.60 },
  "green":    { neutrality: 0.25, versatility: 0.55 },
  "burgundy": { neutrality: 0.30, versatility: 0.58 },
  "maroon":   { neutrality: 0.25, versatility: 0.55 },
  "red":      { neutrality: 0.10, versatility: 0.45 },
  "yellow":   { neutrality: 0.00, versatility: 0.35 },
  "orange":   { neutrality: 0.05, versatility: 0.38 },
  "pink":     { neutrality: 0.15, versatility: 0.50 },
  "purple":   { neutrality: 0.15, versatility: 0.48 },
};

const COLOR_FALLBACK = { neutrality: 0.50, versatility: 0.60 };

// ── 3. Event Profiles ────────────────────────────────────────────────────────
// target vector: [formality, warmth, coverage, neutrality, versatility]
// required: categories that MUST be covered
// optional: categories added if available
const EVENT_PROFILES = {
  "casual":     { vec: [0.15, 0.40, 0.45, 0.50, 0.65], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Casual Day" },
  "office":     { vec: [0.80, 0.40, 0.72, 0.80, 0.85], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Office / Business" },
  "business":   { vec: [0.80, 0.40, 0.72, 0.80, 0.85], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Business" },
  "formal":     { vec: [0.95, 0.45, 0.85, 0.85, 0.90], required: ["top", "bottom", "layer"], optional: ["footwear"], label: "Formal Event" },
  "date night": { vec: [0.70, 0.35, 0.65, 0.55, 0.75], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Date Night" },
  "date":       { vec: [0.70, 0.35, 0.65, 0.55, 0.75], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Date" },
  "party":      { vec: [0.60, 0.30, 0.60, 0.40, 0.65], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Party" },
  "wedding":    { vec: [0.92, 0.40, 0.82, 0.80, 0.88], required: ["top", "bottom", "layer"], optional: ["footwear"], label: "Wedding" },
  "gym":        { vec: [0.05, 0.20, 0.55, 0.35, 0.50], required: ["top", "bottom"], optional: ["footwear"], label: "Gym / Sport" },
  "sport":      { vec: [0.05, 0.20, 0.55, 0.35, 0.50], required: ["top", "bottom"], optional: ["footwear"], label: "Sport" },
  "beach":      { vec: [0.05, 0.05, 0.20, 0.30, 0.45], required: ["top", "bottom"], optional: ["footwear"], label: "Beach" },
  "hiking":     { vec: [0.10, 0.55, 0.70, 0.40, 0.55], required: ["top", "bottom", "layer"], optional: ["footwear"], label: "Hiking / Outdoors" },
  "interview":  { vec: [0.90, 0.40, 0.80, 0.88, 0.92], required: ["top", "bottom", "layer"], optional: ["footwear"], label: "Job Interview" },
  "brunch":     { vec: [0.40, 0.35, 0.55, 0.55, 0.68], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Brunch" },
  "travel":     { vec: [0.25, 0.45, 0.60, 0.55, 0.70], required: ["top", "bottom"], optional: ["layer", "footwear"], label: "Travel" },
};

// ── 4. Modifier Maps ─────────────────────────────────────────────────────────
// Override warmth dimension based on weather
const WEATHER_WARMTH = {
  "hot":   0.10,
  "warm":  0.30,
  "mild":  0.50,
  "cool":  0.70,
  "cold":  0.90,
  "rainy": 0.65,
};

// Delta applied to formality dimension based on style persona
const PERSONA_DELTA = {
  "classic":     0.00,
  "minimalist":  0.05,
  "streetwear": -0.20,
  "bohemian":   -0.15,
  "preppy":      0.10,
  "edgy":       -0.10,
  "sporty":     -0.25,
  "chic":        0.10,
};

// ── 5. Dimension Weights for Cosine Similarity ───────────────────────────────
// [formality, warmth, coverage, neutrality, versatility]
const DIM_WEIGHTS = [0.35, 0.25, 0.15, 0.15, 0.10];

// ── 6. Feature Encoding ──────────────────────────────────────────────────────
function encodeItem(item) {
  const typeLower = item.type.toLowerCase();
  const typeKey = Object.keys(TYPE_MAP).find(
    k => typeLower.includes(k) || k.includes(typeLower)
  );
  const tf = typeKey ? TYPE_MAP[typeKey] : TYPE_FALLBACK;

  const colorLower = item.color.toLowerCase();
  const colorKey = Object.keys(COLOR_MAP).find(
    k => colorLower.includes(k) || k.includes(colorLower)
  );
  const cf = colorKey ? COLOR_MAP[colorKey] : COLOR_FALLBACK;

  return {
    vec: [tf.formality, tf.warmth, tf.coverage, cf.neutrality, cf.versatility],
    cat: tf.cat,
  };
}

function buildEventVector(occasion, weather, stylePersona) {
  const occLower = occasion.toLowerCase();
  const occKey = Object.keys(EVENT_PROFILES).find(
    k => occLower.includes(k) || k.includes(occLower)
  ) || "casual";

  const profile = EVENT_PROFILES[occKey];
  const targetVec = [...profile.vec];

  // Apply weather → warmth dimension (index 1)
  const weatherKey = Object.keys(WEATHER_WARMTH).find(
    k => weather.toLowerCase().includes(k)
  ) || "mild";
  targetVec[1] = WEATHER_WARMTH[weatherKey];

  // Apply persona → formality dimension (index 0)
  const personaKey = Object.keys(PERSONA_DELTA).find(
    k => stylePersona.toLowerCase().includes(k)
  ) || "classic";
  targetVec[0] = Math.max(0, Math.min(1, targetVec[0] + PERSONA_DELTA[personaKey]));

  return { targetVec, profile };
}

// ── 7. Weighted Cosine Similarity ────────────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    const wa = a[i] * DIM_WEIGHTS[i];
    const wb = b[i] * DIM_WEIGHTS[i];
    dot  += wa * wb;
    magA += wa * wa;
    magB += wb * wb;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// ── 8. Color Harmony ─────────────────────────────────────────────────────────
function colorHarmonyMultiplier(items) {
  const boldCount = items.filter(item => {
    const ck = Object.keys(COLOR_MAP).find(k => item.color.toLowerCase().includes(k));
    return ck ? COLOR_MAP[ck].neutrality < 0.40 : false;
  }).length;
  if (boldCount > 2) return 0.50;
  if (boldCount > 1) return 0.80;
  return 1.00;
}

// ── 9. Outfit Assembly ───────────────────────────────────────────────────────
function assembleOutfit(wardrobe, targetVec, profile) {
  // Score every item in wardrobe
  const scored = wardrobe.map(item => {
    const encoded = encodeItem(item);
    return { item, encoded, score: cosineSimilarity(encoded.vec, targetVec) };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected = [];
  const coveredCats = new Set();

  // Pass 1 — required categories (pick highest-scoring item per cat)
  for (const cat of profile.required) {
    const best = scored.find(s => s.encoded.cat === cat && !selected.includes(s));
    if (best) { selected.push(best); coveredCats.add(cat); }
  }

  // If a "full" item (dress/suit) was picked, drop any forced top/bottom
  const hasFullItem = selected.some(s => s.encoded.cat === "full");
  if (hasFullItem) {
    const cleaned = selected.filter(s => s.encoded.cat !== "top" && s.encoded.cat !== "bottom");
    selected.length = 0;
    selected.push(...cleaned);
  }

  // Pass 2 — optional categories
  for (const cat of profile.optional) {
    if (coveredCats.has(cat)) continue;
    const best = scored.find(s => s.encoded.cat === cat && !selected.includes(s));
    if (best) { selected.push(best); coveredCats.add(cat); }
  }

  const avgScore = selected.reduce((s, x) => s + x.score, 0) / (selected.length || 1);
  const harmony  = colorHarmonyMultiplier(selected.map(s => s.item));
  const confidence = Math.round(avgScore * harmony * 100);

  return { selected, confidence };
}

// ── 10. Explanation Generator ────────────────────────────────────────────────
function generateExplanation(selected, profile, weather, stylePersona) {
  if (selected.length === 0) {
    return {
      why:  "No matching items found in the wardrobe.",
      tip:  "Try adding more items with varied types and colours.",
      vibe: "—",
    };
  }

  const avgFormality = selected.reduce((s, x) => s + x.encoded.vec[0], 0) / selected.length;
  const avgWarmth    = selected.reduce((s, x) => s + x.encoded.vec[1], 0) / selected.length;
  const topItem      = `${selected[0].item.color} ${selected[0].item.type}`;

  const formalityLabel =
    avgFormality > 0.75 ? "polished and refined" :
    avgFormality > 0.45 ? "smart-casual and elevated" :
                          "relaxed and effortless";

  const warmthLabel =
    avgWarmth > 0.65 ? "layered warmly" :
    avgWarmth > 0.35 ? "comfortably balanced" :
                       "kept light and breathable";

  const why =
    `This ${formalityLabel} outfit is ${warmthLabel} for ${profile.label}. ` +
    `The ${topItem} anchors the look and complements a ${stylePersona} aesthetic.`;

  const tip =
    avgFormality > 0.75 ? "Roll your sleeves slightly — instant polished-relaxed contrast." :
    avgFormality > 0.45 ? "A minimal accessory elevates this from casual to intentional." :
                          "Keep accessories clean and minimal — let the fit do the talking.";

  const vibeWords =
    avgFormality > 0.75 ? ["Refined", "Sharp", "Confident"] :
    avgFormality > 0.45 ? ["Elevated", "Intentional", "Clean"] :
                          ["Relaxed", "Effortless", "Fresh"];

  return { why, tip, vibe: vibeWords.join(" · ") };
}

// ── 11. Public API ───────────────────────────────────────────────────────────
/**
 * @param {Object} opts
 * @param {Array}  opts.wardrobe    – array of wardrobe items from store
 * @param {string} opts.occasion    – e.g. "Office", "Casual", "Date Night"
 * @param {string} opts.weather     – e.g. "Hot", "Cold", "Mild"
 * @param {string} opts.stylePersona – e.g. "classic", "streetwear"
 * @returns {{ outfit, why, tip, vibe, confidence, scores, model }}
 */
function recommend({ wardrobe, occasion = "Casual", weather = "Mild", stylePersona = "classic" }) {
  const { targetVec, profile } = buildEventVector(occasion, weather, stylePersona);
  const { selected, confidence } = assembleOutfit(wardrobe, targetVec, profile);
  const { why, tip, vibe } = generateExplanation(selected, profile, weather, stylePersona);

  return {
    outfit:     selected.map(s => `${s.item.color} ${s.item.type} (${s.item.brand})`),
    why,
    tip,
    vibe,
    confidence, // 0-100
    scores: selected.map(s => ({
      item:     `${s.item.color} ${s.item.type}`,
      score:    Math.round(s.score * 100),
      category: s.encoded.cat,
    })),
    model: "StyleMate Content-Based Recommender v1 (cosine similarity, no external API)",
  };
}

module.exports = { recommend };
