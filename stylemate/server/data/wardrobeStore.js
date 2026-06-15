// In-memory wardrobe store (replace with MongoDB/PostgreSQL in production)
let wardrobe = [
  { id: 1, type: "Shirt",    color: "White",  brand: "Uniqlo", tags: ["formal", "casual"] },
  { id: 2, type: "Trousers", color: "Navy",   brand: "Zara",   tags: ["formal"] },
  { id: 3, type: "Blazer",   color: "Grey",   brand: "H&M",    tags: ["formal", "smart"] },
  { id: 4, type: "Jeans",    color: "Black",  brand: "Levis",  tags: ["casual"] },
  { id: 5, type: "T-Shirt",  color: "White",  brand: "H&M",    tags: ["casual"] },
  { id: 6, type: "Sneakers", color: "White",  brand: "Nike",   tags: ["casual", "sport"] },
];
let nextId = 7;

const getAll    = ()      => [...wardrobe];
const getById   = (id)    => wardrobe.find(i => i.id === id);
const add       = (item)  => { const n = { ...item, id: nextId++, tags: item.tags || [] }; wardrobe.push(n); return n; };
const remove    = (id)    => { const idx = wardrobe.findIndex(i => i.id === id); if (idx === -1) return false; wardrobe.splice(idx, 1); return true; };
const update    = (id, d) => { const idx = wardrobe.findIndex(i => i.id === id); if (idx === -1) return null; wardrobe[idx] = { ...wardrobe[idx], ...d, id }; return wardrobe[idx]; };

module.exports = { getAll, getById, add, remove, update };
