# Runway — Startup Funding & Hiring Tracker (Full-Stack)

A full-stack application that tracks real, live startup data from Y Combinator's India directory — built to help job seekers find actively-hiring, well-funded companies.

## Architecture

```
Python Scraper  →  PostgreSQL (Neon)  →  Node.js/Express API  →  React Dashboard
(real YC data)      (data storage)         (serves data)           (what you see)
```
## Folder structure

```
funding-tracker-v2/
├── backend/          → Node.js + Express API
│   ├── server.js
│   ├── db.js
│   ├── routes/companies.js
│   ├── schema.sql
│   └── .env.example
├── scraper/           → Python scraper
│   ├── scraper.py
│   ├── inspect_page.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/           → React app
│   ├── src/App.jsx
│   ├── src/App.css
│   └── ...
└── README.md
```
## Features
🔴 Live data — scraped directly from YC's India directory, not a hardcoded list
🔍 Search & filter — by company name, sector, city, and hiring status
🏢 Company detail pages — batch, status, employee count, location, YC page, LinkedIn
📊 Dashboard stats — total companies tracked, currently hiring, cities covered
🕒 Freshness indicator — shows when data was last refreshed

## Setup — step by step

### 1. Create the database (Neon)
- Sign up at neon.tech, create a project
- Copy your connection string
- Open the SQL Editor in Neon and run everything in `backend/schema.sql`

### 2. Set up the scraper
```bash
cd scraper
pip install -r requirements.txt
cp .env.example .env
# paste your Neon connection string into .env
python scraper.py
```
If it doesn't find companies correctly, run `python inspect_page.py` first to see the page's actual text structure, then adjust the pattern in `scraper.py`.

### 3. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
# paste the same Neon connection string into .env
npm start
```
Visit `http://localhost:5000` — you should see "Funding Tracker API is running."

### 4. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```
Visit the URL it gives you (usually `http://localhost:5173`).

## Tech Stack
Layer	Technology
Frontend →	React + Vite, React Router
Backend	 → Node.js, Express
Database → PostgreSQL (Neon, serverless)
Scraper	 → Python, Playwright, BeautifulSoup
Hosting	 → Render (frontend + backend)

## Deployment (when ready)

- Frontend → Vercel or Netlify
- Backend → Render or Railway
- Database → already on Neon (no change needed)

## Author

Vinita Giriya
