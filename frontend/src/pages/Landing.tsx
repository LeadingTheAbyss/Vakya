import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import logoImg from '../images/logo.png';
import './Landing.css';
import HowItWorks from '../components/HowItWorks';
import Y2KHero from '../components/Y2KHero';

const features = [
  {
    title: 'Multi-Agent Architecture',
    desc: 'Six specialized AI agents collaborate in sequence — ingestion, classification, compliance, risk assessment, negotiation, and summary.',
  },
  {
    title: 'Indian Legal Compliance',
    desc: 'Purpose-built for Indian MSMEs. Checks GST clause validity, arbitration terms, jurisdiction clauses, and MSME Act protections.',
  },
  {
    title: 'Surgical Redlining',
    desc: 'The Negotiator Agent does not rewrite your contract. It makes precise, word-level edits to neutralize risk while preserving intent.',
  },
  {
    title: 'Hindi & English',
    desc: 'Fully bilingual interface. Upload contracts in Devanagari or English, get explanations in the language you prefer.',
  },
  {
    title: 'Explainable AI',
    desc: 'Every risk flag links back to the exact clause in the original document. You see the reasoning, not just the verdict.',
  },
  {
    title: 'Scanned Document OCR',
    desc: 'Handles low-quality scans, skewed pages, and printed contracts. Human-in-the-loop correction for critical extractions.',
  },
];

const stats = [
  { value: '12,000+', label: 'MSMEs protected' },
  { value: '94%', label: 'Risk detection accuracy' },
  { value: '< 45s', label: 'Average review time' },
  { value: '₹2.4Cr', label: 'Disputes prevented' },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <img src={logoImg} alt="Vakya" className="nav-logo-img" />
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </div>
        <div className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log in</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/app')}>
            Get started <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Y2K Hero Section ── */}
      <Y2KHero />

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Stats ── */}
      <section className="stats-section">
        {stats.map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <div className="section-tag">Capabilities</div>
          <h2>Everything a legal team would catch,<br />in under a minute.</h2>
          <p>No legal vocabulary needed. Upload your document and Vakya handles the rest.</p>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="cta-banner-glow" />
        <h2>Stop signing contracts blind.</h2>
        <p>Start analyzing your contracts instantly.</p>
        <button
          className="btn btn-primary"
          style={{ padding: '11px 28px', fontSize: '14px', marginTop: '8px' }}
          onClick={() => navigate('/login')}
        >
          Analyze your first contract <ArrowRight size={16} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <img src={logoImg} alt="Vakya" className="footer-logo-img" />
        </div>
        <p className="text-tertiary text-sm">
          © 2026 Vakya. Not a substitute for legal advice.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
