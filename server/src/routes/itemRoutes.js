const express = require("express");
const { getItems, createItem, updateItem, deleteItem } = require("../controllers/itemController");
const isAuthenticated = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", isAuthenticated, getItems);
router.post("/", isAuthenticated, createItem);
router.put("/:id", isAuthenticated, updateItem);
router.delete("/:id", isAuthenticated, deleteItem);

module.exports = router;