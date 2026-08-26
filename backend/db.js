/**
 * db.js
 * ------
 * Ye file Postgres database se connection banati hai.
 * Baaki files (jaise routes/companies.js) isi file ke through database se baat karti hain.
 */

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon ko secure (SSL) connection chahiye hoti hai
});

module.exports = pool;
