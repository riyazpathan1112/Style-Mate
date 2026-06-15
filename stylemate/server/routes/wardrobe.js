const express = require("express");
const router = express.Router();
const { getWardrobe, addItem, updateItem, deleteItem } = require("../controllers/wardrobeController");

router.get("/",        getWardrobe);   // GET    /api/wardrobe
router.post("/",       addItem);       // POST   /api/wardrobe
router.put("/:id",     updateItem);    // PUT    /api/wardrobe/:id
router.delete("/:id",  deleteItem);    // DELETE /api/wardrobe/:id

module.exports = router;
