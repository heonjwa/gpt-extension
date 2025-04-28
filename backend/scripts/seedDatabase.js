const mongoose = require('mongoose');
const Phrase = require('../models/Phrase');
require('dotenv').config();

// Initial seed data
const phraseData = [
  // Courtesy phrases
  { original: 'Please be advised that', simplified: 'Please note', category: 'courtesy' },
  { original: 'I would like to bring to your attention', simplified: 'Note that', category: 'courtesy' },
  { original: 'Thank you for your consideration', simplified: 'Thanks', category: 'courtesy' },
  
  // Contractions
  { original: 'cannot', simplified: "can't", category: 'contraction' },
  { original: 'do not', simplified: "don't", category: 'contraction' },
  { original: 'will not', simplified: "won't", category: 'contraction' },
  { original: 'I am', simplified: "I'm", category: 'contraction' },
  { original: 'they are', simplified: "they're", category: 'contraction' },
  
  // Verbose phrases
  { original: 'in order to', simplified: 'to', category: 'verbose' },
  { original: 'due to the fact that', simplified: 'because', category: 'verbose' },
  { original: 'in the event that', simplified: 'if', category: 'verbose' },
  { original: 'a large number of', simplified: 'many', category: 'verbose' },
  { original: 'the majority of', simplified: 'most', category: 'verbose' },
  { original: 'for the purpose of', simplified: 'for', category: 'verbose' },
  { original: 'in spite of the fact that', simplified: 'although', category: 'verbose' },
  { original: 'in the near future', simplified: 'soon', category: 'verbose' },
  { original: 'at this point in time', simplified: 'now', category: 'verbose' },
  
  // Complex words
  { original: 'utilize', simplified: 'use', category: 'verbose' },
  { original: 'implement', simplified: 'use', category: 'verbose' },
  { original: 'sufficient', simplified: 'enough', category: 'verbose' },
  { original: 'numerous', simplified: 'many', category: 'verbose' },
  { original: 'commence', simplified: 'start', category: 'verbose' },
  { original: 'approximately', simplified: 'about', category: 'verbose' },
  { original: 'subsequently', simplified: 'then', category: 'verbose' },
  { original: 'nevertheless', simplified: 'still', category: 'verbose' },
  { original: 'consequently', simplified: 'so', category: 'verbose' },
  { original: 'acquire', simplified: 'get', category: 'verbose' },
  { original: 'demonstrate', simplified: 'show', category: 'verbose' },
  { original: 'endeavor', simplified: 'try', category: 'verbose' },
  { original: 'regarding', simplified: 'about', category: 'verbose' },
  { original: 'facilitate', simplified: 'help', category: 'verbose' },
  
  // Filler words - using empty strings to remove them completely
  { original: 'basically', simplified: '', category: 'filler' },
  { original: 'actually', simplified: '', category: 'filler' },
  { original: 'literally', simplified: '', category: 'filler' },
  { original: 'essentially', simplified: '', category: 'filler' },
  { original: 'simply put', simplified: '', category: 'filler' }
];

// Connect to MongoDB
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected...');
    
    // Delete existing phrases
    await Phrase.deleteMany();
    console.log('Existing phrases deleted...');
    
    // Insert new phrases
    await Phrase.insertMany(phraseData);
    console.log('Phrases successfully added to database!');
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();