const Binder = require('../models/binder');

// GET /api/binders — fetch the current user's top-level binders
async function getBinders(req, res) {
  try {
    const binders = await Binder.find({
      userId: req.user._id,
      parentBinderId: null,
    }).sort({ createdAt: -1 });

    res.json(binders);
  } catch (error) {
    console.error('Error fetching binders:', error);
    res.status(500).json({ error: 'Failed to fetch binders.' });
  }
}

// POST /api/binders — creates a new binder (or sub-binder, if parentBinderId is passed)
async function createBinder(req, res) {
  try {
    const { name, color, parentBinderId } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required.' });
    }

    const trimmedName = String(name).trim();

    // Prevent duplicate binder names per user, case-insensitive exact match.
    const existingBinder = await Binder.findOne({
      userId: req.user._id,
      name: trimmedName,
    }).collation({ locale: 'en', strength: 2 });

    if (existingBinder) {
      return res.status(409).json({
        message: 'You already have a binder with this name.',
      });
    }

    const binder = await Binder.create({
      userId: req.user._id,
      name: trimmedName,
      color,
      parentBinderId: parentBinderId || null,
    });

    res.status(201).json(binder);
  } catch (error) {
    console.error('Error creating binder:', error);
    res.status(500).json({ error: 'Failed to create binder.' });
  }
}

// DELETE /api/binders/:binderId — deletes a binder
async function deleteBinder(req, res) {
  try {
    const { binderId } = req.params;

    const binder = await Binder.findOneAndDelete({
      _id: binderId,
      userId: req.user._id,
    });

    if (!binder) {
      return res.status(404).json({ error: 'Binder not found.' });
    }

    res.json({ message: 'Binder deleted successfully.' });
  } catch (error) {
    console.error('Error deleting binder:', error);
    res.status(500).json({ error: 'Failed to delete binder.' });
  }
}

// PUT /api/binders/:binderId — edits a binder
async function editBinder(req, res) {
  try {
    const { binderId } = req.params;
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required.' });
    }

    const trimmedName = String(name).trim();

    // Prevent duplicate binder names per user, case-insensitive exact match.
    const existingBinder = await Binder.findOne({
      userId: req.user._id,
      _id: { $ne: binderId },
      name: trimmedName,
    }).collation({ locale: 'en', strength: 2 });

    if (existingBinder) {
      return res.status(409).json({
        message: 'You already have a binder with this name.',
      });
    }

    const binder = await Binder.findOneAndUpdate(
      { _id: binderId, userId: req.user._id },
      { name: trimmedName, color },
      { new: true }
    );

    if (!binder) {
      return res.status(404).json({ error: 'Binder not found.' });
    }

    res.json(binder);
  } catch (error) {
    console.error('Error editing binder:', error);
    res.status(500).json({ error: 'Failed to edit binder.' });
  }
}

module.exports = { getBinders, createBinder, editBinder, deleteBinder };