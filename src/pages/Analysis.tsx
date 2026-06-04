import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, FileSearch, Scale,
  Brain, ShieldAlert, ChevronRight, ChevronDown, Languages, Copy,
  RotateCcw, X, Layers, GitBranch, FileText, ExternalLink, Loader2, Download
} from 'lucide-react';
import './Analysis.css';

// ── Types ──────────────────────────────────────────────────────────────────────
interface AgentStep {
  id: number;
  name: string;
  desc: string;
  status: 'pending' | 'active' | 'done';
  icon: React.ReactNode;
  thoughts?: string[];
}

interface Clause {
  id: number;
  title: string;
  type: string;
  risk: 'critical' | 'warning' | 'safe' | 'missing';
  text: string | null;
  original: string | null;
  rewrite: string | null;
  issue: { en: string; hi: string };
  suggestion: { en: string; hi: string };
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const agentStepsData: AgentStep[] = [
  {
    id: 1, name: 'Doc Ingestion', desc: 'Parsing PDF, running OCR on pages 1–12',
    status: 'done', icon: <FileSearch size={14} />,
    thoughts: [
      'Detected document language: English (primary)',
      'OCR confidence: 97.4% on all pages',
      '42 logical sections identified',
      'Document type classified: Vendor Service Agreement',
    ],
  },
  {
    id: 2, name: 'Clause Classification', desc: 'Segmented 42 clauses across 11 categories',
    status: 'done', icon: <Layers size={14} />,
    thoughts: [
      'Payment Terms: 3 clauses merged',
      'Termination: 2 clauses, 1 asymmetric detected',
      'Indemnification: flagged for Risk Agent',
      'Force Majeure: present and standard',
    ],
  },
  {
    id: 3, name: 'Compliance Check', desc: 'Verifying GST clauses, jurisdiction, arbitration',
    status: 'done', icon: <Scale size={14} />,
    thoughts: [
      'GST clause: ABSENT — high risk for interstate SaaS supply',
      'Arbitration seat: not specified — defaults favor counterparty',
      'MSME Delayed Payments Act: not referenced',
      'Jurisdiction: no governing law clause found',
    ],
  },
  {
    id: 4, name: 'Risk Assessment', desc: 'Scored 12 clauses · 3 critical, 2 moderate',
    status: 'done', icon: <ShieldAlert size={14} />,
    thoughts: [
      'Aggregate risk score: 72/100',
      'Payment clause: 90-day withholding — HIGH',
      'Termination: 7-day notice asymmetry — MEDIUM',
      'Liability cap: absent — HIGH',
    ],
  },
  {
    id: 5, name: 'Negotiator Agent', desc: 'Generated safe rewrites for all critical clauses',
    status: 'done', icon: <Brain size={14} />,
    thoughts: [
      'Payment rewrite: Net-30, objective dispute trigger',
      'Termination rewrite: 30-day parity + pro-rata payment',
      'Jurisdiction insert: Pune courts, Indian law',
    ],
  },
];

const clausesData: Clause[] = [
  {
    id: 1,
    title: 'Payment Terms',
    type: 'Financial',
    risk: 'critical',
    text: 'The Client shall pay the Service Provider within 90 days of receiving the invoice. The Client reserves the right to withhold payment at its sole discretion if it deems the work unsatisfactory.',
    original: 'Payment within 90 days · withholding at sole discretion',
    rewrite: 'The Client shall pay the Service Provider within 30 days of receiving a valid invoice. Any dispute regarding quality of work must be raised in writing within 7 days of delivery. Disputed amounts may not exceed the value of the disputed deliverable.',
    issue: {
      en: 'Allows the Client to delay payment for 90 days and withhold indefinitely without objective criteria — directly violates MSME Delayed Payments Act protections.',
      hi: 'क्लाइंट 90 दिनों तक पेमेंट रोक सकता है और बिना किसी स्पष्ट आधार के अनिश्चित काल तक भुगतान रोके रह सकता है। यह MSME देरी से भुगतान अधिनियम का उल्लंघन है।',
    },
    suggestion: {
      en: 'Counter-propose Net-30 payment and require documented, written dispute notice within 7 days of delivery.',
      hi: 'नेट-30 भुगतान की मांग करें और डिलीवरी के 7 दिनों के भीतर लिखित विवाद नोटिस का प्रावधान जोड़ें।',
    },
  },
  {
    id: 2,
    title: 'Termination for Convenience',
    type: 'Termination',
    risk: 'warning',
    text: 'Either party may terminate this Agreement at any time by providing 7 days written notice.',
    original: '7-day termination notice for either party',
    rewrite: 'Either party may terminate this Agreement by providing 30 days written notice. Upon termination, the Client shall pay the Service Provider for all work completed and expenses incurred up to the termination date, within 14 days.',
    issue: {
      en: '7 days is insufficient for a service business to transition. The clause is symmetric on paper but favors the larger party in practice.',
      hi: '7 दिन का नोटिस पीरियड सेवा व्यवसाय के लिए बहुत कम है। यह क्लॉज बड़ी कंपनियों को ज्यादा फायदा देता है।',
    },
    suggestion: {
      en: 'Negotiate 30-day notice for both parties and ensure explicit pro-rata payment for work already completed.',
      hi: '30 दिन का नोटिस पीरियड और पहले किए गए कार्य के लिए आनुपातिक भुगतान सुनिश्चित करें।',
    },
  },
  {
    id: 3,
    title: 'Confidentiality',
    type: 'Information',
    risk: 'safe',
    text: 'Both parties agree to keep all proprietary information confidential for 2 years following termination of this Agreement. This obligation does not apply to information already in the public domain.',
    original: '2-year mutual NDA post-termination',
    rewrite: null,
    issue: {
      en: 'Balanced and mutual. Includes a standard carve-out for public domain information. No action required.',
      hi: 'यह क्लॉज संतुलित और पारस्परिक है। कोई बदलाव आवश्यक नहीं।',
    },
    suggestion: {
      en: 'Acceptable as written. Consider this clause standard for the agreement type.',
      hi: 'यह क्लॉज स्वीकार्य है। कोई बदलाव की आवश्यकता नहीं।',
    },
  },
  {
    id: 4,
    title: 'Jurisdiction & Governing Law',
    type: 'Dispute Resolution',
    risk: 'missing',
    text: null,
    original: null,
    rewrite: 'This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.',
    issue: {
      en: 'No jurisdiction clause detected. Without this, any dispute could be filed in a court convenient for the counterparty — potentially hundreds of kilometers away.',
      hi: 'कोई न्यायक्षेत्र क्लॉज नहीं मिला। इसके बिना, विवाद की स्थिति में दूसरा पक्ष अपनी सुविधा के अनुसार किसी भी कोर्ट में मामला दर्ज कर सकता है।',
    },
    suggestion: {
      en: 'Insert the AI-generated jurisdiction clause below. Specify your home city as the seat of jurisdiction.',
      hi: 'नीचे दिया गया AI-जनित क्लॉज जोड़ें। अपने शहर को न्यायक्षेत्र के रूप में निर्दिष्ट करें।',
    },
  },
];

// ── Analysis Component ─────────────────────────────────────────────────────────
const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [, setLoadingStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'trace' | 'risks' | 'rewrite'>('trace');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set([1, 2, 3]));
  const [agents, setAgents] = useState<AgentStep[]>(
    agentStepsData.map((a, i) => ({ ...a, status: i === 0 ? 'active' : 'pending' }))
  );

  // Loading simulation
  useEffect(() => {
    if (isLoaded) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        const next = prev + 1;
        if (next >= agentStepsData.length) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoaded(true);
            setAgents(agentStepsData);
          }, 600);
          return prev;
        }
        setAgents(current =>
          current.map((a, i) => ({
            ...a,
            status: i < next ? 'done' : i === next ? 'active' : 'pending',
          }))
        );
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoaded]);

  const toggleAgentExpand = (id: number) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Loading Screen ──
  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-card animate-fade-up">
          <div className="loading-header">
            <div className="loading-orb animate-pulse-glow" />
            <div>
              <h3>Processing Contract</h3>
              <p className="text-secondary text-sm">
                Vendor_Agreement_TechCorp.pdf · 12 pages
              </p>
            </div>
          </div>
          <div className="loading-steps">
            {agents.map((step, _index) => (
              <div key={step.id} className={`loading-step loading-step--${step.status}`}>
                <div className="loading-step-icon">
                  {step.status === 'done' ? (
                    <CheckCircle2 size={14} />
                  ) : step.status === 'active' ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="loading-step-name">{step.name}</span>
                <span className="loading-step-desc">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Analysis Workspace ──
  return (
    <div className="analysis-workspace">
      {/* ── Workspace Header ── */}
      <div className="workspace-header">
        <button className="btn-back" onClick={() => navigate('/app')}>
          <ArrowLeft size={15} /> Repository
        </button>
        <div className="workspace-title">
          <FileText size={15} className="text-tertiary" />
          <span>Vendor_Agreement_TechCorp.pdf</span>
          <span className="badge badge-critical">Risk 72/100</span>
        </div>
        <div className="workspace-header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
          >
            <Languages size={14} />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/app/report/${id}`)}
          >
            Generate Report
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* ── Split Pane ── */}
      <div className="split-pane">
        {/* ── Left: Document Viewer ── */}
        <div className="doc-pane">
          <div className="pane-header">
            <span className="pane-header-title">Document</span>
            <span className="text-tertiary text-sm">Page 1 of 12</span>
          </div>
          <div className="doc-viewer">
            <div className="mock-doc">
              <div className="doc-watermark">VENDOR SERVICE AGREEMENT</div>
              <p className="doc-intro">
                This Vendor Service Agreement ("Agreement") is entered into as of the date of the last signature by and between <strong>TechCorp Solutions Pvt. Ltd.</strong> ("Client") and the Service Provider identified below ("Provider").
              </p>

              {clausesData.map(clause => (
                clause.text ? (
                  <div
                    key={clause.id}
                    className={`doc-clause ${
                      clause.risk === 'critical' ? 'doc-clause--critical' :
                      clause.risk === 'warning' ? 'doc-clause--warning' :
                      clause.risk === 'safe' ? 'doc-clause--safe' : ''
                    } ${selectedClause?.id === clause.id ? 'doc-clause--selected' : ''}`}
                    onClick={() => { setSelectedClause(clause); setActiveTab('risks'); }}
                  >
                    <div className="doc-clause-header">
                      <span className="doc-clause-title">{clause.id}. {clause.title}</span>
                      <span className={`badge badge-${clause.risk === 'critical' ? 'critical' : clause.risk === 'warning' ? 'warning' : 'safe'}`}>
                        {clause.risk}
                      </span>
                    </div>
                    <p className="doc-clause-text">{clause.text}</p>
                  </div>
                ) : null
              ))}

              <div
                className="doc-clause-missing"
                onClick={() => { setSelectedClause(clausesData[3]); setActiveTab('risks'); }}
              >
                <AlertTriangle size={14} />
                <span>Missing: Jurisdiction & Governing Law clause</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Intelligence Pane ── */}
        <div className="intelligence-pane">
          <div className="pane-tabs">
            <button
              className={`pane-tab ${activeTab === 'trace' ? 'active' : ''}`}
              onClick={() => setActiveTab('trace')}
            >
              <GitBranch size={14} /> Agent Trace
            </button>
            <button
              className={`pane-tab ${activeTab === 'risks' ? 'active' : ''}`}
              onClick={() => { setActiveTab('risks'); setSelectedClause(null); }}
            >
              <ShieldAlert size={14} /> Risk & Redlines
              <span className="pane-tab-count">4</span>
            </button>
            <button
              className={`pane-tab ${activeTab === 'rewrite' ? 'active' : ''}`}
              onClick={() => { setActiveTab('rewrite'); setSelectedClause(null); }}
            >
              <FileText size={14} /> MSME Draft
            </button>
          </div>

          <div className="pane-body">
            {/* ── Tab 1: Agent Trace ── */}
            {activeTab === 'trace' && (
              <div className="agent-trace animate-fade-up">
                <div className="trace-summary">
                  <div className="trace-summary-item">
                    <CheckCircle2 size={13} className="text-safe" />
                    <span className="text-secondary text-sm">5 agents completed</span>
                  </div>
                  <div className="trace-summary-item">
                    <AlertTriangle size={13} className="text-critical" />
                    <span className="text-secondary text-sm">3 critical issues</span>
                  </div>
                </div>

                {agents.map(agent => (
                  <div key={agent.id} className="trace-agent">
                    <div
                      className="trace-agent-header"
                      onClick={() => toggleAgentExpand(agent.id)}
                    >
                      <div className={`trace-agent-icon trace-agent-icon--${agent.status}`}>
                        {agent.status === 'done' ? <CheckCircle2 size={12} /> :
                         agent.status === 'active' ? <Loader2 size={12} className="animate-spin" /> :
                         agent.icon}
                      </div>
                      <div className="trace-agent-meta">
                        <span className="trace-agent-name">{agent.name}</span>
                        <span className="trace-agent-desc text-tertiary text-sm">{agent.desc}</span>
                      </div>
                      {agent.thoughts && (
                        <button className="trace-expand-btn">
                          {expandedAgents.has(agent.id)
                            ? <ChevronDown size={13} />
                            : <ChevronRight size={13} />}
                        </button>
                      )}
                    </div>

                    {expandedAgents.has(agent.id) && agent.thoughts && (
                      <div className="trace-thoughts animate-fade-up">
                        {agent.thoughts.map((t, i) => (
                          <div key={i} className="trace-thought">
                            <div className="trace-thought-dot" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab 2: Risk & Redlines ── */}
            {activeTab === 'risks' && !selectedClause && (
              <div className="risk-overview animate-fade-up">
                <div className="risk-summary-cards">
                  <div className="risk-summary-card risk-summary-card--critical">
                    <AlertTriangle size={16} /> <span>2 Critical</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--warning">
                    <AlertTriangle size={16} /> <span>1 Moderate</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--missing">
                    <X size={16} /> <span>1 Missing</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--safe">
                    <CheckCircle2 size={16} /> <span>1 Safe</span>
                  </div>
                </div>

                <div className="clause-cards">
                  {clausesData.map(clause => (
                    <div
                      key={clause.id}
                      className={`clause-card clause-card--${clause.risk}`}
                      onClick={() => setSelectedClause(clause)}
                    >
                      <div className="clause-card-header">
                        <div>
                          <div className="clause-card-title">{clause.title}</div>
                          <div className="clause-card-type text-sm text-tertiary">{clause.type}</div>
                        </div>
                        <span className={`badge badge-${clause.risk === 'critical' ? 'critical' : clause.risk === 'warning' ? 'warning' : clause.risk === 'safe' ? 'safe' : 'missing'}`}>
                          {clause.risk}
                        </span>
                      </div>
                      {clause.original && (
                        <p className="clause-card-preview text-sm text-tertiary">
                          {clause.original}
                        </p>
                      )}
                      <div className="clause-card-footer">
                        <span className="text-sm text-ai">View analysis</span>
                        <ChevronRight size={13} className="text-ai" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Clause Detail Panel ── */}
            {activeTab === 'risks' && selectedClause && (
              <div className="clause-detail animate-fade-up">
                <div className="clause-detail-header">
                  <button
                    className="btn-back"
                    onClick={() => setSelectedClause(null)}
                  >
                    <ArrowLeft size={14} /> All clauses
                  </button>
                  <span className={`badge badge-${selectedClause.risk === 'critical' ? 'critical' : selectedClause.risk === 'warning' ? 'warning' : selectedClause.risk === 'safe' ? 'safe' : 'missing'}`}>
                    {selectedClause.risk}
                  </span>
                </div>

                <div className="clause-detail-body">
                  <h4 className="clause-detail-title">{selectedClause.title}</h4>

                  {/* Original Clause */}
                  {selectedClause.text && (
                    <div className="detail-section">
                      <div className="detail-label">Original Clause</div>
                      <div className="detail-original">
                        "{selectedClause.text}"
                      </div>
                    </div>
                  )}

                  {/* Risk Explanation */}
                  <div className={`detail-risk-box detail-risk-box--${selectedClause.risk}`}>
                    <div className="detail-risk-header">
                      <AlertTriangle size={14} />
                      What is the risk?
                    </div>
                    <p className={language === 'hi' ? 'lang-hi' : ''}>
                      {selectedClause.issue[language]}
                    </p>
                  </div>

                  {/* Suggestion */}
                  <div className="detail-section">
                    <div className="detail-label">Recommended Action</div>
                    <p className={`detail-suggestion ${language === 'hi' ? 'lang-hi' : ''}`}>
                      {selectedClause.suggestion[language]}
                    </p>
                  </div>

                  {/* Rewrite */}
                  {selectedClause.rewrite && (
                    <div className="detail-section">
                      <div className="detail-label-row">
                        <div className="detail-label text-safe">Safer Wording</div>
                        <button className="btn-icon btn-sm">
                          <Copy size={13} />
                        </button>
                      </div>
                      <div className="detail-rewrite">
                        {selectedClause.rewrite}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="detail-actions">
                    <button className="btn btn-ghost btn-sm">
                      <RotateCcw size={13} /> Remix
                    </button>
                    <button className="btn btn-danger btn-sm">
                      Flag for Lawyer
                    </button>
                    <button className="btn btn-safe btn-sm">
                      Accept Rewrite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 3: Full MSME Draft ── */}
            {activeTab === 'rewrite' && (
              <div className="rewrite-pane animate-fade-up" style={{ padding: '24px' }}>
                <div className="rewrite-header" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Negotiated MSME Draft</h3>
                  <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    This AI-generated draft resolves 3 critical issues and adds 1 missing clause to protect your MSME rights. It is unbiased, legally sound, and optimized for Indian business contexts.
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: '20px' }}>
                    <Download size={14} /> Download Revised PDF
                  </button>
                </div>

                <div className="rewrite-changes" style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Summary of Changes Made</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span className="text-safe" style={{ marginTop: '2px' }}><CheckCircle2 size={16} /></span>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        <strong>Payment Terms:</strong> Reduced from 90 to 30 days. Removed indefinite withholding.
                      </span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span className="text-safe" style={{ marginTop: '2px' }}><CheckCircle2 size={16} /></span>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        <strong>Termination:</strong> Extended notice period from 7 to 30 days for fairness.
                      </span>
                    </li>
                    <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span className="text-safe" style={{ marginTop: '2px' }}><CheckCircle2 size={16} /></span>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        <strong>Jurisdiction:</strong> Added missing clause anchoring disputes to Pune courts under Indian law.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rewrite-diff">
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Redlines Review</h4>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '20px', fontSize: '13px', lineHeight: '1.7', fontFamily: 'var(--font-mono, monospace)', overflowX: 'auto' }}>
                    <div className="text-tertiary">... [Section 3: Financials] ...</div>
                    
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--critical-color)', textDecoration: 'line-through' }}>
                      - 3.1 The Client shall pay the Service Provider within 90 days of receiving the invoice. The Client reserves the right to withhold payment at its sole discretion if it deems the work unsatisfactory.
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--safe-color)' }}>
                      + 3.1 The Client shall pay the Service Provider within 30 days of receiving a valid invoice. Any dispute regarding quality of work must be raised in writing within 7 days of delivery. Disputed amounts may not exceed the value of the disputed deliverable.
                    </div>
                    
                    <div className="text-tertiary" style={{ marginTop: '16px' }}>... [Section 8: Term & Termination] ...</div>
                    
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--critical-color)', textDecoration: 'line-through' }}>
                      - 8.2 Either party may terminate this Agreement at any time by providing 7 days written notice.
                    </div>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--safe-color)' }}>
                      + 8.2 Either party may terminate this Agreement by providing 30 days written notice. Upon termination, the Client shall pay the Service Provider for all work completed and expenses incurred up to the termination date, within 14 days.
                    </div>

                    <div className="text-tertiary" style={{ marginTop: '16px' }}>... [Section 12: Miscellaneous] ...</div>

                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--safe-color)' }}>
                      + <strong>12.4 Jurisdiction & Governing Law.</strong> This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
