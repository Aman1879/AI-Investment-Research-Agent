import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Search,
  TrendingUp,
  XCircle,
  Activity,
  Award,
  Briefcase,
  HelpCircle,
  Info
} from 'lucide-react';

// Import local assets from your src/assets directory path
import logoImg from './assets/logo.jpeg';

function App() {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!companyName.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${backendUrl}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.error || 'Something went wrong fetching data'
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err?.message || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      {/* Clean Full-Screen Brand Header with no navigation options */}
      <nav className="navbar-minimal">
        <div className="nav-brand">
          <img src={logoImg} alt="ApexQ Logo" className="brand-logo" />
          <span className="brand-name">ApexQ</span>
        </div>
      </nav>

      <main className="main-content-fullscreen">
        <div className="hero-container">
          <header className="hero-block">
            <span className="eyebrow">AI INVESTMENT RESEARCH AGENT</span>
            <h1>
              Instant company analysis <br />
              <span className="gradient-text">with structured output.</span>
            </h1>
            <p>
              Enter a public company name and get a clear INVEST or PASS decision,
              supported by strengths, risks, and a concise executive summary.
            </p>
          </header>

          {/* Premium Capsule Form Search Block */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                id="companyName"
                type="text"
                placeholder="e.g., Apple, InsideIIM, MicroSoft....."
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="analyze-button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spin" size={18} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span className="sparkle">✦</span>
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>

          {error && <div className="status-error-msg">{error}</div>}

          {/* Static Quick Navigation Widgets shown under form when empty */}
          {!result && !loading && (
            <div className="bottom-widgets">
              <div className="widget-item">
                <Activity size={18} className="widget-icon" />
                <div>
                  <h4>Market Update</h4>
                  <p>Live market insights</p>
                </div>
              </div>
              <div className="widget-item">
                <TrendingUp size={18} className="widget-icon" />
                <div>
                  <h4>Top Gainers</h4>
                  <p>Today's top performers</p>
                </div>
              </div>
              <div className="widget-item">
                <Briefcase size={18} className="widget-icon" />
                <div>
                  <h4>My Portfolio</h4>
                  <p>Track your holdings</p>
                </div>
              </div>
              <div className="widget-item">
                <HelpCircle size={18} className="widget-icon" />
                <div>
                  <h4>Trending Tokens</h4>
                  <p>Explore trending tokens</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Multi-Column Analytical Results Display */}
        {result && (
          <section className="result-card fading-in">
            <div className="result-header">
              <div className="company-metadata">
                <span className="meta-badge">COMPANY</span>
                <h2>{result.company}</h2>
                <div className="meta-sub-row">
                  <span>✨ Quantitative Index</span>
                  <span className="bullet-sep">•</span>
                  <span>Live Web Contextualized</span>
                </div>
              </div>

              <div className={`decision-pill ${result.decision === 'INVEST' ? 'invest-mode' : 'pass-mode'}`}>
                {result.decision === 'INVEST' ? <CheckCircle size={22} /> : <XCircle size={22} />}
                <div className="pill-text-wrapper">
                  <span className="pill-title">{result.decision}</span>
                  <span className="pill-subtitle">Overall Decision</span>
                </div>
              </div>
            </div>

            <div className="summary-block">
              <h3>
                <Award size={18} /> Executive Summary
              </h3>
              <p>{result.summary}</p>
            </div>

            <div className="insights-grid">
              <article className="card-pane pane-positive">
                <h3>
                  <CheckCircle size={18} /> Strengths
                </h3>
                <ul>
                  {result.strengths.map((item, index) => (
                    <li key={`str-${index}`}>
                      <span className="bullet-check">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="card-pane pane-negative">
                <h3>
                  <AlertTriangle size={18} /> Risks
                </h3>
                <ul>
                  {result.risks.map((item, index) => (
                    <li key={`risk-${index}`}>
                      <span className="bullet-dot">⊙</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <article className="card-pane pane-metrics">
                <h3>
                  <TrendingUp size={18} /> Key Parameters
                </h3>
                <div className="metric-table">
                  <div className="metric-row">
                    <span>Data Sourcing</span>
                    <strong className="text-glow">Tavily Engine</strong>
                  </div>
                  <div className="metric-row">
                    <span>Inference Client</span>
                    <strong>Gemini </strong>
                  </div>
                  <div className="metric-row">
                    <span>Processing Drift</span>
                    <strong>Deterministic (0.0)</strong>
                  </div>
                  <div className="metric-row">
                    <span>Structural Schema</span>
                    <strong>Zod Compliant</strong>
                  </div>
                </div>
              </article>
            </div>

            <footer className="disclaimer-row">
              <Info size={14} />
              <span>AI-generated analysis for informational purposes only. Not financial advice.</span>
            </footer>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;