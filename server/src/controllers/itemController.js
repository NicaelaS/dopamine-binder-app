const Item = require("../models/item");

function normalizeItemPayload(payload = {}, userIdFromRequest) {
  const userId = userIdFromRequest || payload.userId;
  const type = payload.type;

  if (!userId) throw new Error("Authentication required.");
  if (!payload.folderId) throw new Error("folderId is required.");
  if (!payload.title || !String(payload.title).trim()) {
    throw new Error("title is required.");
  }
  if (!["TCG", "BOOK"].includes(type)) {
    throw new Error("type must be either TCG or BOOK.");
  }

  const base = {
    userId,
    folderId: payload.folderId,
    title: String(payload.title).trim(),
    type,
    quantity: Number(payload.quantity || 1),
    notes: payload.notes || "",
    photos: Array.isArray(payload.photos) ? payload.photos : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    favorite: Boolean(payload.favorite),
  };

  if (type === "TCG") {
    const cardDetails = payload.cardDetails || {};
    base.cardDetails = {
      game: cardDetails.game || "pokemon",
      set: cardDetails.set || "",
      cardNumber: cardDetails.cardNumber || "",
      rarity: cardDetails.rarity || "",
      referenceImageUrl: cardDetails.referenceImageUrl || "",
      marketPrice: Number(cardDetails.marketPrice || 0) || 0,
      condition: cardDetails.condition || undefined,
      graded: Boolean(cardDetails.graded),
      gradingCompany: cardDetails.gradingCompany || null,
      grade: cardDetails.grade ?? null,
      variant: cardDetails.variant || "none",
      language: cardDetails.language || "English",
      edition: cardDetails.edition || null,
    };
    delete base.bookDetails;
    return base;
  }

  const bookDetails = payload.bookDetails || {};
  base.bookDetails = {
    authors: Array.isArray(bookDetails.authors) ? bookDetails.authors : [],
    isbn: bookDetails.isbn || "",
    publisher: bookDetails.publisher || "",
    publishedDate: bookDetails.publishedDate || "",
    referenceCoverUrl: bookDetails.referenceCoverUrl || "",
    condition: bookDetails.condition || undefined,
    format: bookDetails.format || undefined,
    signed: Boolean(bookDetails.signed),
    printing: bookDetails.printing || "",
  };
  delete base.cardDetails;
  return base;
}

async function createItem(req, res) {
  try {
    const payload = normalizeItemPayload(req.body, req.user?._id);

    const item = new Item(payload);
    const savedItem = await item.save();

    return res.status(201).json({
      message: "Item created successfully",
      item: savedItem,
    });
  } catch (error) {
    console.error("createItem error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    return res.status(400).json({
      message: error.message || "Failed to create item.",
    });
  }
}

module.exports = { createItem };