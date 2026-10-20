const Binder = require('../models/binder');

// POST /api/binders — creates a new binder (or sub-binder, if parentBinderId is passed)
async function createBinder(req, res) {
  try {
    const { name, color, parentBinderId } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required.' });
    }

    const binder = await Binder.create({
      userId: req.user._id,
      name,
      color,
      parentBinderId: parentBinderId || null,
    });

    res.status(201).json(binder);
  } catch (error) {
    console.error('Error creating binder:', error);
    res.status(500).json({ error: 'Failed to create binder.' });
  }
}

module.exports = { createBinder };