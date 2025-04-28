const Phrase = require('../models/Phrase');

/**
 * Paraphrase service that simplifies text based on MongoDB phrases
 */

const simplifyText = async (text) => {
  try {
    // Get all phrases from the database
    const phrases = await Phrase.find();
    
    let simplifiedText = text;
    
    // For each phrase in the database, replace it in the text
    for (const phrase of phrases) {
      // Create a case-insensitive regular expression for the original phrase
      // Use word boundaries to match whole words/phrases only
      const regex = new RegExp(`\\b${phrase.original}\\b`, 'gi');
      
      // Replace all occurrences with the simplified version
      // Special handling for empty simplified values (filler words to be removed)
      if (phrase.simplified === '') {
        // For filler words, we want to remove them completely while preserving spacing
        simplifiedText = simplifiedText.replace(regex, ' ').replace(/\s+/g, ' ');
      } else {
        simplifiedText = simplifiedText.replace(regex, phrase.simplified);
      }
    }
    
    // Handle additional basic simplifications
    simplifiedText = simplifiedText
      // Split long sentences (basic implementation)
      .replace(/(\w[.!?])\s+(\w)/g, '$1\n$2')
      // Reduce multiple spaces to single space
      .replace(/\s+/g, ' ')
      .trim();
    
    return simplifiedText;
  } catch (error) {
    console.error('Error in simplifyText service:', error);
    throw error;
  }
};

// Create a new phrase in the database
const createPhrase = async (phraseData) => {
  try {
    return await Phrase.create(phraseData);
  } catch (error) {
    console.error('Error creating phrase:', error);
    throw error;
  }
};

// Get all phrases from the database
const getAllPhrases = async () => {
  try {
    return await Phrase.find().sort({ category: 1, original: 1 });
  } catch (error) {
    console.error('Error getting phrases:', error);
    throw error;
  }
};

// Delete a phrase by ID
const deletePhrase = async (id) => {
  try {
    return await Phrase.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting phrase:', error);
    throw error;
  }
};

module.exports = {
  simplifyText,
  createPhrase,
  getAllPhrases,
  deletePhrase
};