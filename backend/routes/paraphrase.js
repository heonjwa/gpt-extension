const express = require('express');
const paraphraseService = require('../services/paraphrase');

const router = express.Router();

/**
 * @route   POST /api/paraphrase
 * @desc    Paraphrase a text string and return token metrics
 * @access  Public
 */
router.post('/paraphrase', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid text string' 
      });
    }
    
    // Get paraphrased text with token metrics
    const result = await paraphraseService.simplifyText(text);
    
    res.status(200).json({
      success: true,
      original: text,
      paraphrased: result.simplifiedText,
      tokenMetrics: result.tokenMetrics
    });
  } catch (error) {
    console.error('Error paraphrasing text:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while paraphrasing text'
    });
  }
});

/**
 * @route   POST /api/phrases
 * @desc    Add a new phrase to the database
 * @access  Public
 */
router.post('/phrases', async (req, res) => {
  try {
    const { original, simplified, category } = req.body;
    
    // Validate input
    if (!original || category === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide original phrase and category'
      });
    }
    
    // Create new phrase
    const phrase = await paraphraseService.createPhrase({
      original,
      simplified: simplified || '', // Allow empty string
      category
    });
    
    res.status(201).json({
      success: true,
      data: phrase
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This phrase already exists in the database'
      });
    }
    
    console.error('Error creating phrase:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating phrase'
    });
  }
});

/**
 * @route   GET /api/phrases
 * @desc    Get all phrases
 * @access  Public
 */
router.get('/phrases', async (req, res) => {
  try {
    const phrases = await paraphraseService.getAllPhrases();
    
    res.status(200).json({
      success: true,
      count: phrases.length,
      data: phrases
    });
  } catch (error) {
    console.error('Error getting phrases:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while getting phrases'
    });
  }
});

/**
 * @route   DELETE /api/phrases/:id
 * @desc    Delete a phrase
 * @access  Public
 */
router.delete('/phrases/:id', async (req, res) => {
  try {
    const phrase = await paraphraseService.deletePhrase(req.params.id);
    
    if (!phrase) {
      return res.status(404).json({
        success: false,
        error: 'Phrase not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting phrase:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting phrase'
    });
  }
});

module.exports = router;