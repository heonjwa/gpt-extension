const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const paraphraseRouter = require('./routes/paraphrase');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', paraphraseRouter);

app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    error: 'Server error: ' + (err.message || 'Unknown error')
  });
});

// Home route
app.get('/', (req, res) => {
  res.send('Paraphrase API is running! Send POST requests to /api/paraphrase');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});