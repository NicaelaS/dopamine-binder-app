const express = require("express");
const { searchTcg, searchBooks } = require("../controllers/searchController");

const router = express.Router();

router.get("/tcg", searchTcg);
router.get("/books", searchBooks);

module.exports = router;