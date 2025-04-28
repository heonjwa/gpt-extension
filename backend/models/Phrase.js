const mongoose = require('mongoose');

const PhraseSchema = new mongoose.Schema({
  original: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  simplified: {
    type: String,
    default: '',  // Set default to empty string
    trim: true    // Remove required constraint
  },
  category: {
    type: String,
    enum: ['courtesy', 'contraction', 'verbose', 'filler'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create an index for efficient text searching
PhraseSchema.index({ original: 'text' });

module.exports = mongoose.model('Phrase', PhraseSchema);