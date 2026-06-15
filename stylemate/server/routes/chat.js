const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatController");

router.post("/", chat);  // POST /api/chat

module.exports = router;
