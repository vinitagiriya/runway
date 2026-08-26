// Footer.jsx
// Ek chhota, reusable component — Home aur CompanyDetail dono isi ko use
// karte hain, taaki footer har page pe same rahe aur sirf ek jagah edit karni pade.

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.57.1.78-.25.78-.55
        0-.27-.01-1-.02-1.96-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68
        -1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96
        .1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09
        -.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49
        3.17-1.18 3.17-1.18.64 1.58.24 2.75.12 3.04.74.81 1.18 1.83 1.18 3.09
        0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2
        0 .31.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14
        2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27
        2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12
        20.45H3.56V9h3.56v11.45Z"/>
    </svg>
  );
}

function Footer({ lastUpdated }) {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-mark">RUNWAY</span>
          <p>
            Built by <strong>Vinita Giriya</strong>
          </p>
        </div>

        <div className="footer-meta">
          {lastUpdated && <span>Data last refreshed {lastUpdated}</span>}

          <a
            href="https://github.com/vinitagiriya"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="footer-icon-link"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/vinita-giriya-533933278"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="footer-icon-link"
          >
            <LinkedInIcon />
          </a>

          <span className="footer-copyright">© {year} RUNWAY</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
