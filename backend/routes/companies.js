/**
 * routes/companies.js
 * ---------------------
 * Ye file batati hai ki "/api/companies" pe request aane par kya karna hai.
 *
 * Ismein hum:
 * 1. Saari companies bhejte hain (GET /api/companies)
 * 2. Filters ke saath bhejte hain (GET /api/companies?city=Bengaluru)
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/companies?city=...&hiring_status=...
router.get("/", async (req, res) => {
  try {
    const { city, hiring_status, search } = req.query;

    // Query dynamically banate hain, jaise-jaise filters aate hain
    let query = "SELECT * FROM companies WHERE 1=1";
    const values = [];

    if (city) {
      values.push(`%${city}%`);
      query += ` AND location ILIKE $${values.length}`;
    }

    if (hiring_status) {
      values.push(hiring_status);
      query += ` AND hiring_status = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND (company_name ILIKE $${values.length} OR sector ILIKE $${values.length})`;
    }

    query += " ORDER BY scraped_at DESC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companies from database." });
  }
});

// GET /api/companies/stats — dashboard ke stats ke liye
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM companies");
    const hiring = await pool.query(
      "SELECT COUNT(*) FROM companies WHERE hiring_status = 'Hiring'"
    );
    const cities = await pool.query(
      "SELECT COUNT(DISTINCT location) FROM companies"
    );

    res.json({
      total: parseInt(total.rows[0].count),
      hiring: parseInt(hiring.rows[0].count),
      cities: parseInt(cities.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// GET /api/companies/:id — ek single company ki poori detail ke liye
// (Company Detail page isi ko call karta hai)
//
// IMPORTANT: yeh route "/stats" ke NEECHE hona chahiye. Express upar se
// neeche routes match karta hai — agar ":id" wala route upar hota,
// to "/stats" request bhi ":id" = "stats" samajh ke yahin match ho jaati
// aur stats wala route kabhi chalta hi nahi.
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM companies WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch company." });
  }
});

module.exports = router;
