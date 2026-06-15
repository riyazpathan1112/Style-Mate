import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Wardrobe ────────────────────────────────────────────────────
export const wardrobeAPI = {
  getAll:  ()        => api.get("/wardrobe"),
  add:     (item)    => api.post("/wardrobe", item),
  update:  (id, d)   => api.put(`/wardrobe/${id}`, d),
  remove:  (id)      => api.delete(`/wardrobe/${id}`),
};

// ── Outfit ──────────────────────────────────────────────────────
export const outfitAPI = {
  recommend: (params) => api.post("/outfit/recommend", params),
};

// ── Chat ────────────────────────────────────────────────────────
export const chatAPI = {
  send: (messages) => api.post("/chat", { messages }),
};

export default api;
