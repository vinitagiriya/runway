import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Footer";

const API_URL = "https://runway-backend-gn6u.onrender.com/api/companies";

function CompanyDetail() {
  // useParams() se hume URL ka wo hissa milta hai jo humne route me
  // ":id" likha tha — jaise agar URL "/company/42" hai, to id = "42"
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, [id]); // jab bhi id change ho (naye company pe click karo), dobara fetch karo

  async function fetchCompany() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("Company not found");
      const data = await res.json();
      setCompany(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <Link to="/" className="back-link">← Back to all companies</Link>
      </header>

      <main>
        {loading && <p className="status-text">Loading company details...</p>}
        {error && <p className="status-text error">Error: {error}</p>}

        {!loading && !error && company && (
          <div className="detail-card">
            <div className="card-top">
              <h1>{company.company_name}</h1>
              <span className={`tag ${company.hiring_status === "Hiring" ? "" : "unknown"}`}>
                {company.hiring_status}
              </span>
            </div>

            <p className="sector">{company.sector}</p>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Batch</span>
                <span className="detail-value">{company.batch || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{company.status || "—"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{company.location || "Unknown"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employees</span>
                <span className="detail-value">{company.employees || "?"}</span>
              </div>
            </div>

            <div className="detail-links">
              {company.source_url && (
                <a
                  href={company.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="external-link"
                >
                  View on Y Combinator →
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="external-link"
                >
                  View on LinkedIn →
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer
        lastUpdated={
          company &&
          new Date(company.scraped_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        }
      />
    </div>
  );
}

export default CompanyDetail;
