# Runway — Live YC India Funding & Hiring Tracker

**Live site:** https://runway-frontend-wxzq.onrender.com
**Backend API:** https://runway-backend-gn6u.onrender.com

Runway tracks Y Combinator–backed startups in India — funding batch, hiring status, sector, and location — pulled directly from YC's live directory rather than a static, manually-updated list.

> Built out of my own year-long job hunt, to make it easier to find which YC-backed companies in India are actively hiring.

---

## Screenshots

<!-- Add screenshots below. Drag & drop images here in the GitHub editor, or place them in a /screenshots folder and reference them like this: -->
<!-- ![Home page](screenshots/home.png) -->
<!-- ![Company detail page](screenshots/detail.png) -->

---

## Features

- 🔴 **Live data** — scraped directly from YC's India directory, not a hardcoded list
- 🔍 **Search & filter** — by company name, sector, city, and hiring status
- 🏢 **Company detail pages** — batch, status, employee count, location, YC page, LinkedIn
- 📊 **Dashboard stats** — total companies tracked, currently hiring, cities covered
- 🕒 **Freshness indicator** — shows when data was last refreshed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon, serverless) |
| Scraper | Python, Playwright, BeautifulSoup |
| Hosting | Render (frontend + backend) |

---

## How it works

1. **`scraper/scraper.py`** launches a headless browser (Playwright) and scrolls through YC's India company pages — hiring, location, and industry categories — since the listings load via infinite scroll.
2. Company data (name, batch, status, sector, location, employee count) is parsed from each listing, then each company's YC page is visited to grab its LinkedIn link.
3. Everything is upserted into a PostgreSQL database (Neon). Companies no longer on YC's live list are removed automatically.
4. The **Express backend** (`backend/`) exposes a simple REST API (`/api/companies`) with search and filter query params.
5. The **React frontend** (`frontend/`) fetches from that API and renders the dashboard, ticker, and detail pages.

---

## Project Structure

```
runway/
├── backend/       # Express API + Postgres connection
├── frontend/      # React + Vite dashboard
├── scraper/       # Python/Playwright scraper
└── schema.sql     # Database schema
```

---

## Running locally

**Backend**
```bash
cd backend
npm install
# create a .env file with DATABASE_URL (see .env.example)
npm start
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Scraper**
```bash
cd scraper
pip install -r requirements.txt
playwright install chromium
# create a .env file with DATABASE_URL (see .env.example)
python scraper.py
```

---

## Author

**Vinita Giriya**
[GitHub](https://github.com/vinitagiriya) · [LinkedIn](https://www.linkedin.com/in/vinita-giriya-533933278)
