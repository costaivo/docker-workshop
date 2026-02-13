const express = require('express');
const app = express();
const PORT = 3000;

// Hardcoded quotes data
const quotes = [
  {
    id: '1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs'
  },
  {
    id: '2',
    text: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs'
  },
  {
    id: '3',
    text: 'Life is what happens when you are busy making other plans.',
    author: 'John Lennon'
  },
  {
    id: '4',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt'
  },
  {
    id: '5',
    text: 'It is during our darkest moments that we must focus to see the light.',
    author: 'Aristotle'
  },
  {
    id: '6',
    text: 'The only impossible journey is the one you never begin.',
    author: 'Tony Robbins'
  },
  {
    id: '7',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill'
  },
  {
    id: '8',
    text: 'Believe you can and you are halfway there.',
    author: 'Theodore Roosevelt'
  }
];

// Route to get all quotes
app.get('/quotes', (req, res) => {
  res.json({
    success: true,
    data: quotes,
    message: 'Quotes retrieved successfully'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Quotes API',
    endpoints: {
      '/quotes': 'Get all quotes',
      '/health': 'Health check'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Get quotes at http://localhost:${PORT}/quotes`);
});
