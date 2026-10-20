const mongoose = require('mongoose');

const binderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  color: {
    type: String,
    enum: ['white', 'pink', 'purple', 'yellow', 'blue', 'red', 'black', 'green', 'orange'],
    required: true,
  },

  // null = top-level binder, set = this is a subfolder inside another binder
  parentBinderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Binder',
    default: null,
  },
}, {
  timestamps: true,
});

const Binder = mongoose.model('Binder', binderSchema);

module.exports = Binder;