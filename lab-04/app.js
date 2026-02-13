const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'quotes_db',
  user: process.env.DB_USER || 'quotes_user',
  password: process.env.DB_PASSWORD || 'quotes_password',
});

// Route to get all quotes from database
app.get('/quotes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, text, author FROM quotes ORDER BY id');
    res.json({
      success: true,
      data: result.rows,
      message: 'Quotes retrieved successfully',
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quotes',
      error: err.message,
    });
  }
});

// Health check route (includes database connectivity)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server is running',
      database: 'connected',
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Server is running',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Quotes API (PostgreSQL)',
    endpoints: {
      '/quotes': 'Get all quotes from database',
      '/health': 'Health check (includes DB status)',
    },
  });
});

// Wait for database to be ready, then start server
async function startServer() {
  const maxRetries = 30;
  const retryDelay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connection established');
      break;
    } catch (err) {
      if (i === maxRetries - 1) {
        console.error('Could not connect to database after', maxRetries, 'attempts');
        process.exit(1);
      }
      console.log(`Waiting for database... (attempt ${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Get quotes at http://localhost:${PORT}/quotes`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
