const store = require("../data/wardrobeStore");

const getWardrobe = (req, res) => {
  res.json({ success: true, data: store.getAll(), count: store.getAll().length });
};

const addItem = (req, res) => {
  const { type, color, brand, tags } = req.body;
  if (!type || !color || !brand) {
    return res.status(400).json({ success: false, error: "type, color and brand are required" });
  }
  const item = store.add({ type, color, brand, tags });
  res.status(201).json({ success: true, data: item });
};

const updateItem = (req, res) => {
  const id = parseInt(req.params.id);
  const updated = store.update(id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: "Item not found" });
  res.json({ success: true, data: updated });
};

const deleteItem = (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = store.remove(id);
  if (!deleted) return res.status(404).json({ success: false, error: "Item not found" });
  res.json({ success: true, message: `Item ${id} removed from wardrobe` });
};

module.exports = { getWardrobe, addItem, updateItem, deleteItem };
