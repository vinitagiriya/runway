-- schema.sql
-- Ye file batati hai database mein "companies" table kaisi dikhegi.
-- Neon.tech ke SQL Editor mein isse copy-paste karke run karna hai (Step 2 mein bataya hai).

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,              -- har company ka unique number, apne aap badhta hai
    company_name TEXT NOT NULL UNIQUE,  -- company ka naam, duplicate nahi ho sakta
    sector TEXT,                        -- kis field mein kaam karti hai
    batch TEXT,                         -- YC batch, jaise W2021, S2022
    status TEXT,                        -- Active, Public, Acquired etc.
    employees TEXT,                     -- kitne log kaam karte hain
    location TEXT,                      -- city/state
    hiring_status TEXT DEFAULT 'Unknown', -- Hiring ya Unknown
    source_url TEXT,                    -- company ka YC page link
    scraped_at TIMESTAMP DEFAULT NOW()  -- ye row kab scrape hui
);

-- Isse dekh sakti ho ki table bani ya nahi:
-- SELECT * FROM companies LIMIT 5;
