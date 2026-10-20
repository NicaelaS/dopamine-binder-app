const { lookupCardByQuery } = require("../services/cardLookup");
const { lookupBookByQuery } = require("../services/bookLookup");

async function searchTcg(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required." });
    }

    const results = await lookupCardByQuery(query);

    return res.json({ results, count: results.length });
  } catch (error) {
    console.error("searchTcg error:", error);
    return res.status(500).json({ message: error.message || "Card search failed." });
  }
}

async function searchBooks(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query is required." });
    }

    const results = await lookupBookByQuery(query);

    return res.json({ results, count: results.length });
  } catch (error) {
    console.error("searchBooks error:", error);
    return res.status(500).json({ message: error.message || "Book search failed." });
  }
}

module.exports = { searchTcg, searchBooks };