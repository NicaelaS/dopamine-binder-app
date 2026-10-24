const Item = require("../models/item");
const { fetchBookCover } = require("../services/bookLookup");

async function getItems(req, res) {
  try {
    const items = await Item.find({ userId: req.user?._id }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    console.error('getItems error:', error);
    return res.status(500).json({ message: 'Failed to fetch items.' });
  }
}

function normalizeItemPayload(payload = {}, userIdFromRequest) {
  const userId = userIdFromRequest || payload.userId;
  const type = payload.type;
  const binderId = payload.binderId ?? payload.folderId;

  if (!userId) throw new Error("Authentication required.");
  if (!binderId) throw new Error("binderId is required.");
  if (!payload.title || !String(payload.title).trim()) {
    throw new Error("title is required.");
  }
  if (!["TCG", "BOOK"].includes(type)) {
    throw new Error("type must be either TCG or BOOK.");
  }

  const base = {
    userId,
    binderId,
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

    // Auto-fill a book cover when the item is a BOOK and one is missing.
    if (payload.type === "BOOK") {
      payload.bookDetails = payload.bookDetails || {};
      if (!payload.bookDetails.referenceCoverUrl) {
        payload.bookDetails.referenceCoverUrl = await fetchBookCover(
          payload.title,
          payload.bookDetails?.authors
        );
      }
    }

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

async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const payload = normalizeItemPayload(req.body, req.user?._id);

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      payload,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.json({
      message: 'Item updated successfully',
      item: updatedItem,
    });
  } catch (error) {
    console.error('updateItem error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    return res.status(400).json({
      message: error.message || 'Failed to update item.',
    });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    const deletedItem = await Item.findOneAndDelete({
      _id: id,
      userId: req.user?._id,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('deleteItem error:', error);

    return res.status(500).json({
      message: error.message || 'Failed to delete item.',
    });
  }
}

module.exports = { getItems, createItem, updateItem, deleteItem };