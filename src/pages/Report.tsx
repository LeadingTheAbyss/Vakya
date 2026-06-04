import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, ShieldAlert, CheckCircle2, AlertTriangle,
  FileWarning, Scale, MapPin, Gavel, FileText
} from 'lucide-react';
import './Report.css';

const clauseCategories = [
  { label: 'Payment', pct: 22, color: '#ef4444' },
  { label: 'Termination', pct: 15, color: '#f59e0b' },
  { label: 'Confidentiality', pct: 12, color: '#10b981' },
  { label: 'Liability', pct: 18, color: '#ef4444' },
  { label: 'Jurisdiction', pct: 8, color: '#64748b' },
  { label: 'Other', pct: 25, color: '#6366f1' },
];

const actionItems = [
  {
    severity: 'critical',
    icon: <FileWarning size={18} />,
    title: 'Renegotiate Payment Terms',
    desc: 'Demand Net-30 payment and objective written-dispute criteria. Reference MSME Delayed Payments Act, 2006.',
  },
  {
    severity: 'warning',
    icon: <Scale size={18} />,
    title: 'Extend Termination Notice',
    desc: 'Counter-propose 30-day notice with pro-rata payment for completed work up to termination date.',
  },
  {
    severity: 'missing',
    icon: <MapPin size={18} />,
    title: 'Insert Jurisdiction Clause',
    desc: 'Add the AI-generated clause specifying Indian law and your home city as seat of jurisdiction.',
  },
  {
    severity: 'missing',
    icon: <Gavel size={18} />,
    title: 'Add GST Compliance Clause',
    desc: 'Interstate SaaS supply without a GST clause creates tax liability ambiguity. Add explicit GST responsibility.',
  },
];

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="report-page">
      {/* ── Header ── */}
      <div className="report-header">
        <button className="btn-back" onClick={() => navigate(`/app/analysis/${id}`)}>
          <ArrowLeft size={15} /> Back to Analysis
        </button>
        <button className="btn btn-primary btn-sm">
          <Download size={14} /> Export PDF
        </button>
      </div>

      <div className="report-body">
        {/* ── Title Block ── */}
        <div className="report-title-block">
          <div className="report-brand">
            <ShieldAlert size={20} className="text-ai" />
            <span>Contract Sentinel</span>
          </div>
          <h2 className="report-doc-name">Vendor_Agreement_TechCorp.pdf</h2>
          <div className="report-meta">
            <span className="text-tertiary text-sm">Analyzed Jun 3, 2026 · Counterparty: TechCorp Solutions Pvt. Ltd.</span>
            <span className="badge badge-critical report-risk-badge">
              <ShieldAlert size={12} /> Risk Score: 72 / 100
            </span>
          </div>
        </div>

        {/* ── Executive Summary ── */}
        <section className="report-section">
          <h4 className="report-section-title">Executive Summary</h4>
          <div className="report-summary-card">
            <p>
              This contract poses a <strong className="text-critical">High Risk (72/100)</strong> to your business.
              Two clauses create direct financial exposure: the payment terms allow the Client to withhold payments indefinitely,
              and the termination notice of 7 days is insufficient to protect your pipeline. The contract also lacks two legally critical
              protections — a jurisdiction clause and a GST compliance clause — both essential for Indian MSME contexts.
            </p>
            <p style={{ marginTop: 12 }}>
              We recommend negotiating clauses 1 and 2 before signing, and inserting the AI-generated jurisdiction and GST clauses as conditions for agreement.
            </p>
          </div>
        </section>

        {/* ── Stat Grid ── */}
        <div className="report-stat-grid">
          <div className="report-stat report-stat--critical">
            <AlertTriangle size={20} />
            <div className="report-stat-val">2</div>
            <div className="report-stat-label">Critical Risks</div>
          </div>
          <div className="report-stat report-stat--warning">
            <AlertTriangle size={20} />
            <div className="report-stat-val">1</div>
            <div className="report-stat-label">Moderate Risks</div>
          </div>
          <div className="report-stat report-stat--missing">
            <FileText size={20} />
            <div className="report-stat-val">4</div>
            <div className="report-stat-label">Missing Clauses</div>
          </div>
          <div className="report-stat report-stat--safe">
            <CheckCircle2 size={20} />
            <div className="report-stat-val">1</div>
            <div className="report-stat-label">Safe</div>
          </div>
        </div>

        {/* ── Clause Distribution ── */}
        <section className="report-section">
          <h4 className="report-section-title">Clause Distribution</h4>
          <div className="clause-dist-grid">
            {clauseCategories.map(cat => (
              <div key={cat.label} className="clause-dist-row">
                <span className="clause-dist-label text-secondary text-sm">{cat.label}</span>
                <div className="clause-dist-bar-track">
                  <div
                    className="clause-dist-bar-fill"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                </div>
                <span className="clause-dist-pct text-tertiary text-sm">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Action Items ── */}
        <section className="report-section">
          <h4 className="report-section-title">Required Actions Before Signing</h4>
          <div className="action-list">
            {actionItems.map((item, i) => (
              <div key={i} className={`action-item action-item--${item.severity}`}>
                <div className={`action-icon action-icon--${item.severity}`}>
                  {item.icon}
                </div>
                <div>
                  <div className="action-title">{item.title}</div>
                  <p className="text-sm text-secondary" style={{ marginTop: 4, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
                <span className={`badge badge-${item.severity === 'critical' ? 'critical' : item.severity === 'warning' ? 'warning' : 'missing'}`} style={{ flexShrink: 0 }}>
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <div className="report-footer">
          <p className="text-tertiary text-sm">
            Generated by Contract Sentinel on Jun 3, 2026. This report provides legal information, not legal advice. Consult a qualified legal professional for binding decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
