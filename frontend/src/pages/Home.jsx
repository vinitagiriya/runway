import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

// Jab backend local pe chal raha ho, ye URL use hogi.
// Jab backend deploy (Render pe live) ho jaye, isse us live URL se replace karna hoga.
const API_URL = "http://localhost:5000/api/companies";

function Home() {
  // ---- STATE ----
  // "State" wo data hai jo change hota rehta hai aur jiske change hone par
  // screen apne aap update ho jaati hai. React isi wajah se "reactive" kehlata hai.
  const [companies, setCompanies] = useState([]);   // saari companies
  const [stats, setStats] = useState({ total: 0, hiring: 0, cities: 0 });
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [hiringFilter, setHiringFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- DATA FETCHING ----
  // useEffect ka matlab: "jab component pehli baar screen pe aaye, ye code chalao"
  useEffect(() => {
    fetchCompanies();
    fetchStats();
  }, []); // khaali array [] ka matlab — sirf ek baar chalao, baar baar nahi

  // Jab bhi filters change hon, dobara data fetch karo
  useEffect(() => {
    fetchCompanies();
  }, [search, cityFilter, hiringFilter]);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (cityFilter) params.append("city", cityFilter);
      if (hiringFilter) params.append("hiring_status", hiringFilter);

      const res = await fetch(`${API_URL}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load data from server");
      const data = await res.json();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats fetch fail hui:", err);
    }
  }

  // Dropdown ke liye unique cities nikaalna
  const uniqueCities = [...new Set(companies.map((c) => c.location).filter(Boolean))].sort();

  // Saari companies me se sabse recent "scraped_at" dhoondo — isse footer me
  // "Data last refreshed on <date>" dikhega, jo prove karta hai data live/real hai.
  const lastUpdated = companies.length
    ? new Date(
        Math.max(...companies.map((c) => new Date(c.scraped_at).getTime()))
      ).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="app">
      {/* ---- TICKER ---- */}
      <div className="ticker-wrap">
        <div className="ticker">
          {companies.slice(0, 15).map((c, i) => (
            <span key={i}>
              <b>{c.company_name}</b> — <em>{c.status || "Active"}</em> · {c.batch || "YC"}
            </span>
          ))}
        </div>
      </div>

      {/* ---- HEADER ---- */}
      <header>
        <div className="eyebrow">RUNWAY · LIVE FUNDING RADAR</div>
        <h1>
          Track who's <em>just funded</em> — and hiring before anyone else notices.
        </h1>
        <p>
          Real, live data pulled directly from Y Combinator's India directory —
          not a static list. Built out of my own year-long job hunt.
        </p>

        <div className="stats-row">
          <div className="stat"><b>{stats.total}</b><span>Companies Tracked</span></div>
          <div className="stat"><b>{stats.hiring}</b><span>Actively Hiring</span></div>
          <div className="stat"><b>{stats.cities}</b><span>Cities Covered</span></div>
        </div>
      </header>

      {/* ---- CONTROLS ---- */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search company or sector..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
          <option value="">All Cities</option>
          {uniqueCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <select value={hiringFilter} onChange={(e) => setHiringFilter(e.target.value)}>
          <option value="">All Hiring Status</option>
          <option value="Hiring">Hiring</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <main>
        {loading && <p className="status-text">Loading live data...</p>}
        {error && <p className="status-text error">Error: {error} — is the backend running?</p>}

        {!loading && !error && companies.length === 0 && (
          <p className="status-text">No companies found — try adjusting your filters.</p>
        )}

        <div className="grid">
          {companies.map((c) => (
            // Poora card ab ek Link hai — click karne par /company/<id> pe le jaayega,
            // jahan CompanyDetail page uski poori detail dikhayega.
            <Link to={`/company/${c.id}`} className={`card ${c.hiring_status === "Hiring" ? "hiring" : ""}`} key={c.id}>
              <div className="card-top">
                <h3>{c.company_name}</h3>
                <span className={`tag ${c.hiring_status === "Hiring" ? "" : "unknown"}`}>
                  {c.hiring_status}
                </span>
              </div>
              <p className="sector">{c.sector}</p>
              <div className="card-meta">
                <span className="amount">{c.batch || "—"}</span>
                <span className="stage">{c.status || "—"}</span>
              </div>
              <div className="card-city">📍 {c.location || "Unknown"} · {c.employees || "?"} employees</div>
            </Link>
          ))}
        </div>
      </main>

      <Footer lastUpdated={lastUpdated} />
    </div>
  );
}

export default Home;
