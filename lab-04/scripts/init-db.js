#!/usr/bin/env node
/**
 * Database initialization script.
 * Creates the quotes table and inserts default quotes.
 * Can be run via: npm run db:init | db:schema | db:seed
 * Or via Docker: docker-compose run app npm run db:init
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'quotes_db',
  user: process.env.DB_USER || 'quotes_user',
  password: process.env.DB_PASSWORD || 'quotes_password',
});

const DEFAULT_QUOTES = [
  { id: '1', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { id: '2', text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { id: '3', text: 'Life is what happens when you are busy making other plans.', author: 'John Lennon' },
  { id: '4', text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { id: '5', text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { id: '6', text: 'The only impossible journey is the one you never begin.', author: 'Tony Robbins' },
  { id: '7', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { id: '8', text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
];

async function runSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quotes (
      id VARCHAR(20) PRIMARY KEY,
      text TEXT NOT NULL,
      author VARCHAR(255) NOT NULL
    )
  `);
  console.log('Schema: quotes table ready');
}

async function runSeed() {
  for (const q of DEFAULT_QUOTES) {
    await pool.query(
      `INSERT INTO quotes (id, text, author) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [q.id, q.text, q.author]
    );
  }
  console.log('Seed: Default quotes inserted');
}

async function main() {
  const schemaOnly = process.argv.includes('--schema-only');
  const seedOnly = process.argv.includes('--seed-only');

  const maxRetries = 30;
  const retryDelay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      if (i === maxRetries - 1) {
        console.error('Could not connect to database');
        process.exit(1);
      }
      console.log(`Waiting for database... (${i + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, retryDelay));
    }
  }

  try {
    if (schemaOnly) {
      await runSchema();
    } else if (seedOnly) {
      await runSeed();
    } else {
      await runSchema();
      await runSeed();
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
