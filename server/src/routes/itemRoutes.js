const express = require("express");
const { createItem } = require("../controllers/itemController");
const isAuthenticated = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", isAuthenticated, createItem);

module.exports = router;