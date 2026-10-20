import mongoose from 'mongoose';

// only populated when type === 'TCG'
const cardDetailsSchema = new mongoose.Schema({
  // which trading card game this card belongs to
  
  game: {
    type: String,
    enum: ['pokemon', 'onepiece', 'magic'],
    default: 'pokemon',
  },

  // --- autofilled from the TCG API search ---
  set: String,
  cardNumber: String,
  rarity: String,
  referenceImageUrl: String, // the card's official/catalog image, not the user's own photo
  marketPrice: Number,        // optional bonus field if the API returns pricing

  // --- manual, collector-entered fields (the user's specific copy) ---
  condition: {
    type: String,
    enum: ['Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
  },
  graded: {
    type: Boolean,
    default: false,
  },
  gradingCompany: {
    type: String,
    enum: ['PSA', 'BGS', 'CGC', null],
    default: null,
  },
  grade: Number, // e.g., 9, 9.5, 10 — only meaningful when graded is true
  variant: {
    type: String,
    enum: ['none', 'holo', 'reverse holo', 'foil', 'parallel'],
    default: 'none',
  },
  language: {
    type: String,
    default: 'English',
  },
  edition: {
    type: String,
    enum: ['1st Edition', 'Unlimited', null],
    default: null, // mostly relevant for Pokemon; stays null for other games
  },
}, { _id: false }); // _id: false since this is a sub-object, not its own collection

// ---- bookDetails subdocument ----
// only populated when type === 'BOOK'
const bookDetailsSchema = new mongoose.Schema({
  // --- autofilled from Google Books search ---
  authors: [String],
  isbn: String,
  publisher: String,
  publishedDate: String,
  referenceCoverUrl: String,

  // --- manual, collector-entered fields ---
  condition: {
    type: String,
    enum: ['Like New', 'Very Good', 'Good', 'Acceptable', 'Poor'],
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'Mass Market', 'Other'],
  },
  signed: {
    type: Boolean,
    default: false,
  },
  printing: String, // e.g., "First printing"
}, { _id: false });

// ---- main Item schema ----
const itemSchema = new mongoose.Schema({
  // which user owns this item
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // which binder/folder this item lives in
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
  },

  // root fields — persistent across both item types
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TCG', 'BOOK'],
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  notes: {
    type: String, // stores rich text as HTML from your notes editor
    default: '',
  },
  photos: {
    type: [String], // array of Cloudinary URLs
    validate: {
      validator: (arr) => arr.length <= 4,
      message: 'A maximum of 4 photos is allowed per item.',
    },
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  favorite: {
    type: Boolean,
    default: false,
  },

  // only one of these two will actually be set, based on `type`
  // the controller strips the unused one before saving
  cardDetails: cardDetailsSchema,
  bookDetails: bookDetailsSchema,
}, {
  timestamps: true, // adds createdAt / updatedAt automatically
  // createdAt doubles as the data source for your "Last uploaded" dashboard stat
});

const Item = mongoose.model('Item', itemSchema);

export default Item;