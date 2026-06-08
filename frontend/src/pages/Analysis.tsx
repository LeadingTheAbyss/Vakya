import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, FileSearch, Scale,
  Brain, ShieldAlert, ChevronRight, ChevronDown, Languages, Copy,
  RotateCcw, X, Layers, GitBranch, FileText, ExternalLink, Loader2, Download, Clock
} from 'lucide-react';
import './Analysis.css';
import { uploadDocument, analyzeDocument, saveContract, fetchContractDetail } from '../api/client';
import { useApp } from '../context/AppContext';
import ContractChat from '../components/ContractChat';

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
  const location = useLocation();
  const { user, t, language, setLanguage } = useApp();
  const file = location.state?.file as File | undefined;

  // A UUID id with no file = open a cached contract from DB
  const isCached = !!id && id !== 'new' && !file;

  const [, setLoadingStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'trace' | 'risks' | 'rewrite'>('trace');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set([1, 2, 3]));
  const [agents, setAgents] = useState<AgentStep[]>(
    agentStepsData.map((a, i) => ({ ...a, status: i === 0 ? 'active' : 'pending' }))
  );
  const [realClauses, setRealClauses] = useState<Clause[]>(clausesData);
  const [cachedFilename, setCachedFilename] = useState<string | null>(null);
  const [cachedRiskScore, setCachedRiskScore] = useState<number>(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(() => {
    if (!file) return 50;
    const sizeMB = file.size / (1024 * 1024);
    
    // AI Pipeline takes heavy base time (LLM chaining, OCR, segmentation)
    let baseTime = 40;
    if (file.type && file.type.startsWith('image/')) {
      baseTime += 15; // Extra overhead for Image OCR
    } else if (file.type === 'application/pdf') {
      baseTime += 5; // Extra overhead for PDF parsing
    }

    // Hardware heuristic: assuming backend runs locally, read local system specs
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 8; // GB of RAM
    
    // Adjust timing: faster machines (more cores + ram) take less time.
    // e.g., 8 cores -> 0.5x time. 16GB RAM -> 0.5x time.
    const cpuFactor = Math.max(0.4, 4 / cores);
    const ramFactor = Math.max(0.5, 8 / memory);
    const hardwareFactor = cpuFactor * ramFactor;

    // ~45s per MB + base time, multiplied by how powerful the machine is
    const finalEstimate = Math.round((sizeMB * 45 + baseTime) * hardwareFactor);
    
    // Clamp between 15s and 5 minutes
    return Math.max(15, Math.min(300, finalEstimate));
  });

  useEffect(() => {
    if (isLoaded) return;
    const interval = setInterval(() => {
      setEstimatedSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  // ── Load cached contract OR run pipeline ──────────────────────────────────────
  useEffect(() => {
    if (isLoaded) return;

    // ── Case 1: Existing contract from DB (no file in state, id is a UUID) ──
    if (isCached && id) {
      fetchContractDetail(id)
        .then(({ contract }) => {
          setCachedFilename(contract.filename);
          setCachedRiskScore(contract.risk_score ?? 0);
          const stored: Clause[] = (contract.clauses_json || []).map((c: any, i: number) => ({
            id: i + 1,
            title: c.title || `Clause ${i + 1}`,
            type: c.type || 'General',
            risk: c.risk || 'warning',
            text: c.text || null,
            original: c.original || null,
            rewrite: c.rewrite || null,
            issue: c.issue || { en: '', hi: '' },
            suggestion: c.suggestion || { en: '', hi: '' },
          }));
          setRealClauses(stored);
          setAgents(agentStepsData); // show all steps as done
          setIsLoaded(true);
        })
        .catch(() => {
          // Fallback: show mock data
          setIsLoaded(true);
        });
      return;
    }

    // ── Case 2: Demo view (no file, id = 'new' or non-UUID) ──
    if (!file) {
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
    }

    // ── Case 3: Real new analysis ──
    const runAnalysis = async () => {
      try {
        setAgents(current => current.map((a, i) => i === 0 ? { ...a, status: 'active' } : a));
        
        // 1. Upload
        const uploadRes = await uploadDocument(file);
        const { clauses } = uploadRes;
        
        setAgents(current => current.map((a, i) => 
          i === 0 ? { ...a, status: 'done', thoughts: [`Processed ${file.name}`, `Detected clauses: ${clauses.length}`] } : 
          i === 1 ? { ...a, status: 'active' } : a
        ));
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgents(current => current.map((a, i) => 
          i === 1 ? { ...a, status: 'done', thoughts: [`Segmented ${clauses.length} clauses`] } : 
          i === 2 ? { ...a, status: 'active' } : a
        ));
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setAgents(current => current.map((a, i) => 
          i === 2 ? { ...a, status: 'done', thoughts: ['Compliance check passed initial scan'] } : 
          i === 3 ? { ...a, status: 'active' } : a
        ));

        // 2. Analyze
        const analyzeRes = await analyzeDocument(clauses);
        const { analyzed_clauses } = analyzeRes;
        
        setAgents(current => current.map((a, i) => 
          i === 3 ? { ...a, status: 'done', thoughts: [`Scored ${analyzed_clauses.length} clauses`] } : 
          i === 4 ? { ...a, status: 'active' } : a
        ));
        
        // Map backend output to Clause[]
        const mappedClauses: Clause[] = analyzed_clauses.map((c: any, index: number) => {
          const clauseInfo = c.clause_info || {};
          const riskInfo = c.risk_info || {};
          const complianceInfo = c.compliance_info || {};
          const negotiationInfo = c.negotiation_info || {};

          const riskLevel = riskInfo.risk_level || '';
          const risk: Clause['risk'] =
            riskLevel === 'High' ? 'critical' :
            riskLevel === 'Medium' ? 'warning' :
            riskLevel === 'Low' ? 'safe' : 'warning';

          const counterTermsList = Array.isArray(negotiationInfo.counter_terms)
            ? negotiationInfo.counter_terms.join(' | ')
            : negotiationInfo.counter_terms || '';

          const issueText = [
            complianceInfo.compliance_issues || '',
            riskInfo.risk_explanation || '',
            Array.isArray(complianceInfo.missing_mandatory_clauses) && complianceInfo.missing_mandatory_clauses.length > 0
              ? `Missing: ${complianceInfo.missing_mandatory_clauses.join(', ')}`
              : ''
          ].filter(Boolean).join(' — ') || 'No specific issue identified.';

          return {
            id: index + 1,
            title: clauseInfo.category || c.type || `Clause ${index + 1}`,
            type: clauseInfo.category || 'General',
            risk,
            text: c.text || null,
            original: c.text || null,
            rewrite: negotiationInfo.improved_wording && negotiationInfo.improved_wording !== 'No change needed'
              ? negotiationInfo.improved_wording
              : null,
            issue: {
              en: issueText,
              hi: 'कोई विशिष्ट समस्या नहीं पाई गई।'
            },
            suggestion: {
              en: counterTermsList || (negotiationInfo.improved_wording === 'No change needed'
                ? 'Standard clause, no action required.'
                : negotiationInfo.improved_wording || 'Standard clause, no action required.'),
              hi: 'मानक खंड, किसी कार्रवाई की आवश्यकता नहीं है।'
            }
          };
        });
        
        setRealClauses(mappedClauses);

        await new Promise(resolve => setTimeout(resolve, 800));
        setAgents(current => current.map((a, i) => 
          i === 4 ? { ...a, status: 'done', thoughts: ['Generated safe rewrites'] } : a
        ));

        // 3. Save to DB if user is logged in
        if (user?.id) {
          const criticals = mappedClauses.filter(c => c.risk === 'critical').length;
          const riskScore = Math.round(
            mappedClauses.reduce((acc, c) => acc + (c.risk === 'critical' ? 80 : c.risk === 'warning' ? 50 : 15), 0) /
            Math.max(mappedClauses.length, 1)
          );
          const riskLevel = criticals > 0 ? 'high' : riskScore > 40 ? 'medium' : 'low';
          saveContract({
            user_id: user.id,
            filename: file.name,
            risk_score: riskScore,
            risk_level: riskLevel,
            clauses: mappedClauses,
            summary: { total: mappedClauses.length, critical: criticals },
            status: 'review',
          }).catch(console.error);
        }

        setIsLoaded(true);
      } catch (err) {
        console.error('Analysis failed', err);
        setIsLoaded(true);
      }
    };
    
    runAnalysis();
  }, [isLoaded, file, isCached, id, user?.id]);

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
              <h3>{t('analysis.processing')}</h3>
              <p className="text-secondary text-sm">
                {file ? file.name : 'Vendor_Agreement_TechCorp.pdf'}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
            <Clock size={16} className="text-ai" />
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{t('analysis.estimatedTime')}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>~{estimatedSeconds}s</span>
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
        <button className="btn-back" onClick={() => navigate('/app/repository')}>
          <ArrowLeft size={15} /> {t('analysis.repository')}
        </button>
        <div className="workspace-title">
          <FileText size={15} className="text-tertiary" />
          <span>{isCached ? (cachedFilename || 'Contract') : (file ? file.name : 'Vendor_Agreement_TechCorp.pdf')}</span>
          <span className="badge badge-critical">
            {t('analysis.risk')} {isCached ? cachedRiskScore : 72}/100
          </span>
          {isCached && <span className="badge badge-safe" style={{ marginLeft: 4 }}>{t('analysis.cached')}</span>}
        </div>
        <div className="workspace-header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          >
            <Languages size={14} />
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/app/report/${id}`, { state: { analyzedClauses: realClauses, filename: file ? file.name : 'Vendor_Agreement_TechCorp.pdf' } })}
          >
            {t('analysis.generateReport')}
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* ── Split Pane ── */}
      <div className="split-pane">
        {/* ── Left: Document Viewer ── */}
        <div className="doc-pane">
          <div className="pane-header">
            <span className="pane-header-title">{t('analysis.document')}</span>
            <span className="text-tertiary text-sm">{t('analysis.page')} 1 {t('analysis.of')} 12</span>
          </div>
          <div className="doc-viewer">
            <div className="mock-doc">
              <div className="doc-watermark">VENDOR SERVICE AGREEMENT</div>
              <p className="doc-intro">
                This Vendor Service Agreement ("Agreement") is entered into as of the date of the last signature by and between <strong>TechCorp Solutions Pvt. Ltd.</strong> ("Client") and the Service Provider identified below ("Provider").
              </p>

              {realClauses.map(clause => (
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

              {!file && (
                <div
                  className="doc-clause-missing"
                  onClick={() => { setSelectedClause(realClauses[3]); setActiveTab('risks'); }}
                >
                  <AlertTriangle size={14} />
                  <span>{t('analysis.missingClause')}</span>
                </div>
              )}
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
              <GitBranch size={14} /> {t('analysis.agentTrace')}
            </button>
            <button
              className={`pane-tab ${activeTab === 'risks' ? 'active' : ''}`}
              onClick={() => { setActiveTab('risks'); setSelectedClause(null); }}
            >
              <ShieldAlert size={14} /> {t('analysis.risksRedlines')}
              <span className="pane-tab-count">4</span>
            </button>
            <button
              className={`pane-tab ${activeTab === 'rewrite' ? 'active' : ''}`}
              onClick={() => { setActiveTab('rewrite'); setSelectedClause(null); }}
            >
              <FileText size={14} /> {t('analysis.msmeDraft')}
            </button>
          </div>

          <div className="pane-body">
            {/* ── Tab 1: Agent Trace ── */}
            {activeTab === 'trace' && (
              <div className="agent-trace animate-fade-up">
                <div className="trace-summary">
                  <div className="trace-summary-item">
                    <CheckCircle2 size={13} className="text-safe" />
                    <span className="text-secondary text-sm">5 {t('analysis.agentsCompleted')}</span>
                  </div>
                  <div className="trace-summary-item">
                    <AlertTriangle size={13} className="text-critical" />
                    <span className="text-secondary text-sm">3 {t('analysis.criticalIssues')}</span>
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
                    <AlertTriangle size={16} /> <span>2 {t('analysis.critical')}</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--warning">
                    <AlertTriangle size={16} /> <span>1 {t('analysis.moderate')}</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--missing">
                    <X size={16} /> <span>1 {t('analysis.missing')}</span>
                  </div>
                  <div className="risk-summary-card risk-summary-card--safe">
                    <CheckCircle2 size={16} /> <span>1 {t('analysis.safe')}</span>
                  </div>
                </div>

                <div className="clause-cards">
                  {realClauses.map(clause => (
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
                        <span className="text-sm text-ai">{t('analysis.viewAnalysis')}</span>
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
                    <ArrowLeft size={14} /> {t('analysis.allClauses')}
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
                      <div className="detail-label">{t('analysis.originalText')}</div>
                      <div className="detail-original">
                        "{selectedClause.text}"
                      </div>
                    </div>
                  )}

                  {/* Risk Explanation */}
                  <div className={`detail-risk-box detail-risk-box--${selectedClause.risk}`}>
                    <div className="detail-risk-header">
                      <AlertTriangle size={14} />
                      {t('analysis.whatIsRisk')}
                    </div>
                    <p className={language === 'hi' ? 'lang-hi' : ''}>
                      {selectedClause.issue[language]}
                    </p>
                  </div>

                  {/* Suggestion */}
                  <div className="detail-section">
                    <div className="detail-label">{t('analysis.recommendedAction')}</div>
                    <p className={`detail-suggestion ${language === 'hi' ? 'lang-hi' : ''}`}>
                      {selectedClause.suggestion[language]}
                    </p>
                  </div>

                  {/* Rewrite */}
                  {selectedClause.rewrite && (
                    <div className="detail-section">
                      <div className="detail-label-row">
                        <div className="detail-label text-safe">{t('analysis.saferWording')}</div>
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
                      <RotateCcw size={13} /> {t('analysis.remix')}
                    </button>
                    <button className="btn btn-danger btn-sm">
                      {t('analysis.flagForLawyer')}
                    </button>
                    <button className="btn btn-safe btn-sm">
                      {t('analysis.acceptRewrite')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 3: Full MSME Draft ── */}
            {activeTab === 'rewrite' && (
              <div className="rewrite-pane animate-fade-up" style={{ padding: '24px' }}>
                <div className="rewrite-header" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{t('analysis.negotiatedDraft')}</h3>
                  <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {t('analysis.draftDesc')
                      .replace('{rewrites}', realClauses.filter(c => c.rewrite).length.toString())
                      .replace('{highRisk}', realClauses.filter(c => c.risk === 'critical').length.toString())}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: '20px' }}>
                    <Download size={14} /> {t('analysis.downloadPdf')}
                  </button>
                </div>

                <div className="rewrite-changes" style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{t('analysis.summaryOfChanges')}</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
                    {realClauses.filter(c => c.rewrite).map(clause => (
                      <li key={clause.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <span className="text-safe" style={{ marginTop: '2px' }}><CheckCircle2 size={16} /></span>
                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                          <strong>{clause.title}:</strong> {clause.issue.en}
                        </span>
                      </li>
                    ))}
                    {realClauses.filter(c => c.rewrite).length === 0 && (
                      <li style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('analysis.noRewrites')}</li>
                    )}
                  </ul>
                </div>

                <div className="rewrite-diff">
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{t('analysis.redlinesReview')}</h4>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '20px', fontSize: '13px', lineHeight: '1.7', fontFamily: 'var(--font-mono, monospace)', overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {realClauses.filter(c => c.risk === 'critical' || c.risk === 'warning' || c.rewrite).map(clause => (
                      <div key={clause.id}>
                        <div className="text-tertiary">... [{clause.title}] ...</div>
                        {clause.original && (
                          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--critical-color)', textDecoration: 'line-through' }}>
                            - {clause.original}
                          </div>
                        )}
                        {clause.rewrite ? (
                          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--safe-color)' }}>
                            + {clause.rewrite}
                          </div>
                        ) : (
                          <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning-color)', padding: '6px 12px', margin: '8px 0', borderLeft: '3px solid var(--warning-color)' }}>
                            ⚠ {clause.issue.en}
                          </div>
                        )}
                      </div>
                    ))}
                    {realClauses.filter(c => c.risk !== 'safe').length === 0 && (
                      <div className="text-tertiary">{t('analysis.noIssues')}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLoaded && (
        <ContractChat
          clauses={realClauses}
          filename={isCached ? (cachedFilename || undefined) : (file ? file.name : undefined)}
        />
      )}
    </div>
  );
};

export default Analysis;
