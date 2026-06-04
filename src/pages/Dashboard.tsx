import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, AlertTriangle, CheckCircle2, Clock, MoreHorizontal,
  TrendingUp, FileWarning, ShieldCheck, FilePlus,
  ArrowUpRight
} from 'lucide-react';
import './Dashboard.css';

const contracts = [
  {
    id: '1', name: 'Vendor_Agreement_TechCorp.pdf',
    counterparty: 'TechCorp Solutions Pvt. Ltd.',
    type: 'Vendor Agreement',
    riskScore: 72, riskLevel: 'critical',
    gstStatus: 'missing', jurisdiction: 'Mumbai, MH',
    missingClauses: 4,
    date: 'Jun 03, 2026', status: 'review',
  },
  {
    id: '2', name: 'Freelance_Dev_Contract_Hindi.pdf',
    counterparty: 'Sharma & Associates',
    type: 'Freelance Contract',
    riskScore: 45, riskLevel: 'warning',
    gstStatus: 'present', jurisdiction: 'Delhi, DL',
    missingClauses: 2,
    date: 'May 28, 2026', status: 'negotiating',
  },
  {
    id: '3', name: 'Office_Lease_Agreement.pdf',
    counterparty: 'Oberoi Properties',
    type: 'Lease Agreement',
    riskScore: 18, riskLevel: 'safe',
    gstStatus: 'present', jurisdiction: 'Pune, MH',
    missingClauses: 0,
    date: 'May 15, 2026', status: 'signed',
  },
  {
    id: '4', name: 'Software_SaaS_License.pdf',
    counterparty: 'GlobalSoft Inc.',
    type: 'SaaS License',
    riskScore: 58, riskLevel: 'warning',
    gstStatus: 'unclear', jurisdiction: 'Bangalore, KA',
    missingClauses: 3,
    date: 'May 10, 2026', status: 'review',
  },
  {
    id: '5', name: 'Distribution_Agreement_Rajasthan.pdf',
    counterparty: 'Jaipur Distributors Co.',
    type: 'Distribution Agreement',
    riskScore: 82, riskLevel: 'critical',
    gstStatus: 'missing', jurisdiction: 'Jaipur, RJ',
    missingClauses: 6,
    date: 'Apr 30, 2026', status: 'escalated',
  },
];

const riskColors: Record<string, string> = {
  critical: 'var(--risk-critical)',
  warning: 'var(--risk-warning)',
  safe: 'var(--risk-safe)',
};

const gstBadge: Record<string, { label: string; cls: string }> = {
  present: { label: 'Present', cls: 'badge-safe' },
  missing:  { label: 'Missing', cls: 'badge-critical' },
  unclear:  { label: 'Unclear', cls: 'badge-warning' },
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  review:      { label: 'In Review', cls: 'badge-warning' },
  negotiating: { label: 'Negotiating', cls: 'badge-ai' },
  signed:      { label: 'Signed', cls: 'badge-safe' },
  escalated:   { label: 'Escalated', cls: 'badge-critical' },
};

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Contract Repository</h2>
          <p className="text-sm text-secondary" style={{ marginTop: 4 }}>
            5 contracts · 2 pending review · 2 critical risks
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn btn-ghost btn-sm">
            <TrendingUp size={14} /> Risk Report
          </button>
          <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
            <UploadCloud size={14} /> Upload Contract
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,image/*"
              onChange={() => navigate('/app/analysis/123')}
            />
          </label>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)', border: '1px solid var(--risk-critical-border)' }}>
            <FileWarning size={16} />
          </div>
          <div>
            <div className="stat-card-value">2</div>
            <div className="stat-card-label">Critical Risks</div>
          </div>
          <ArrowUpRight size={14} className="stat-card-trend" />
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--risk-warning-bg)', color: 'var(--risk-warning)', border: '1px solid var(--risk-warning-border)' }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="stat-card-value">2</div>
            <div className="stat-card-label">Moderate Risk</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--risk-safe-bg)', color: 'var(--risk-safe)', border: '1px solid var(--risk-safe-border)' }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="stat-card-value">1</div>
            <div className="stat-card-label">Cleared</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'var(--ai-glow)', color: 'var(--ai-secondary)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <FilePlus size={16} />
          </div>
          <div>
            <div className="stat-card-value">15</div>
            <div className="stat-card-label">Missing Clauses</div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="contracts-table-wrapper">
        <table className="contracts-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Counterparty</th>
              <th>Risk Score</th>
              <th>GST Clause</th>
              <th>Jurisdiction</th>
              <th>Missing</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(c => (
              <tr
                key={c.id}
                className="contracts-table-row"
                onClick={() => navigate(`/app/analysis/${c.id}`)}
              >
                <td>
                  <div className="doc-cell">
                    <div className="doc-icon">
                      <FileWarning size={14} />
                    </div>
                    <div>
                      <div className="doc-name">{c.name}</div>
                      <div className="doc-type text-xs text-tertiary">{c.type}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="text-secondary" style={{ fontSize: 13 }}>{c.counterparty}</span>
                </td>
                <td>
                  <div className="risk-score-cell">
                    <div
                      className="risk-score-bar-track"
                    >
                      <div
                        className="risk-score-bar-fill"
                        style={{
                          width: `${c.riskScore}%`,
                          background: riskColors[c.riskLevel],
                        }}
                      />
                    </div>
                    <span className="risk-score-num" style={{ color: riskColors[c.riskLevel] }}>
                      {c.riskScore}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${gstBadge[c.gstStatus].cls}`}>
                    {gstBadge[c.gstStatus].label}
                  </span>
                </td>
                <td>
                  <span className="text-secondary" style={{ fontSize: 13 }}>{c.jurisdiction}</span>
                </td>
                <td>
                  {c.missingClauses > 0 ? (
                    <span className="badge badge-missing">{c.missingClauses} missing</span>
                  ) : (
                    <span className="flex items-center gap-1 text-safe text-sm">
                      <CheckCircle2 size={12} /> None
                    </span>
                  )}
                </td>
                <td>
                  <span className={`badge ${statusBadge[c.status].cls}`}>
                    {statusBadge[c.status].label}
                  </span>
                </td>
                <td>
                  <span className="flex items-center gap-1 text-tertiary text-sm">
                    <Clock size={12} /> {c.date}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <button className="btn-icon">
                    <MoreHorizontal size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Upload Drop Zone ── */}
      <label className="upload-drop-zone">
        <input type="file" hidden accept=".pdf,.doc,.docx,image/*" onChange={() => navigate('/app/analysis/123')} />
        <UploadCloud size={20} className="upload-zone-icon" />
        <div className="upload-zone-text">
          <span className="text-secondary">Drop a contract here or </span>
          <span className="text-ai">browse files</span>
        </div>
        <span className="text-tertiary text-sm">PDF, DOCX, or scanned image · Max 50MB</span>
        <div className="upload-zone-langs">
          <span className="lang-pill">English</span>
          <span className="lang-pill">हिंदी</span>
        </div>
      </label>
    </div>
  );
};

export default Dashboard;
