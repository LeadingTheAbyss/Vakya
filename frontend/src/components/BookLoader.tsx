import { useEffect, useRef, useState } from 'react';
import './BookLoader.css';

interface AgentLike {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'done';
}

interface BookLoaderProps {
  fileName: string;
  agents: AgentLike[];
  complete: boolean;
  onFinished: () => void;
}

type Phase = 'closed' | 'opening' | 'open' | 'closing' | 'flying';

const STEP_THEME: Record<string, string> = {
  'Doc Ingestion': 'Reading the clauses...',
  'Clause Classification': 'Sorting the parchment...',
  'Compliance Check': 'Confirming all changes...',
  'Risk Assessment': 'Weighing the risks...',
  'Negotiator Agent': "Drafting counsel's reply...",
};

const BookLoader = ({ fileName, agents, complete, onFinished }: BookLoaderProps) => {
  const [phase, setPhase] = useState<Phase>('closed');
  const [typed, setTyped] = useState('');
  const typedLineRef = useRef('');

  const activeAgent = agents.find(a => a.status === 'active');
  const lastDone = [...agents].reverse().find(a => a.status === 'done');
  const trackedAgent = activeAgent ?? lastDone;
  const currentLine = trackedAgent
    ? STEP_THEME[trackedAgent.name] || `${trackedAgent.name}...`
    : 'Opening the ledger...';

  useEffect(() => {
    const openTimer = setTimeout(() => setPhase('opening'), 350);
    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'opening') return;
    const t = setTimeout(() => setPhase('open'), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'open' && phase !== 'closing' && phase !== 'flying') return;
    if (typedLineRef.current === currentLine) return;
    typedLineRef.current = currentLine;
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(currentLine.slice(0, i));
      if (i >= currentLine.length) clearInterval(id);
    }, 34);
    return () => clearInterval(id);
  }, [currentLine, phase]);

  const phaseRef = useRef<Phase>(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const onFinishedRef = useRef(onFinished);
  useEffect(() => { onFinishedRef.current = onFinished; }, [onFinished]);

  const closeStartedRef = useRef(false);

  useEffect(() => {
    if (!complete || closeStartedRef.current) return;
    let cancelled = false;

    const tryStartClosing = () => {
      if (cancelled || closeStartedRef.current) return;
      if (phaseRef.current !== 'open') {
        setTimeout(tryStartClosing, 100);
        return;
      }
      closeStartedRef.current = true;
      setPhase('closing');
      setTimeout(() => setPhase('flying'), 950);
      setTimeout(() => onFinishedRef.current(), 950 + 1000);
    };

    tryStartClosing();
    return () => { cancelled = true; };
  }, [complete]);

  const displayName = fileName.replace(/\.[^/.]+$/, '');

  return (
    <div className={`book-scene book-scene--${phase}`}>
      <div className="book-wrapper">
        <div className="book-wing book-wing--left" />
        <div className="book-wing book-wing--right" />

        <div className="book-perspective">
          <div className={`book-flip book-flip--${phase}`}>

            <div className="book-face book-face--front">
              <div className="cover-frame">
                <div className="cover-emblem">V</div>
                <div className="cover-title">VAKYA</div>
                <div className="cover-subtitle">Legal Grimoire</div>
              </div>
            </div>

            <div className="book-face book-face--back">
              <div className="book-spine-shadow" />
              <div className="page page--left">
                <div className="page-heading">{displayName || 'Untitled Contract'}</div>
                <div className="page-rules">
                  <p className="page-line">
                    {typed}
                    <span className="pen-nib" aria-hidden="true">
                      <svg width="58" height="32" viewBox="0 0 110 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="penBarrel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a9d4ff" />
                            <stop offset="32%" stopColor="#3579d6" />
                            <stop offset="62%" stopColor="#1a4fa0" />
                            <stop offset="100%" stopColor="#0a2c5e" />
                          </linearGradient>
                          <linearGradient id="penGold" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fff6d8" />
                            <stop offset="30%" stopColor="#eecb6b" />
                            <stop offset="65%" stopColor="#b8892a" />
                            <stop offset="100%" stopColor="#7a5312" />
                          </linearGradient>
                          <linearGradient id="penSilver" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#d6dade" />
                            <stop offset="72%" stopColor="#9498a0" />
                            <stop offset="100%" stopColor="#585c62" />
                          </linearGradient>
                        </defs>

                        <path d="M2 15 18 8.5 22.5 15 18 21.5Z" fill="url(#penSilver)" stroke="#3a3d40" strokeWidth="0.7" />
                        <line x1="9" y1="15" x2="20.5" y2="15" stroke="#3a3d40" strokeWidth="0.6" />
                        <circle cx="3.2" cy="15" r="1.2" fill="#1a1a1a" />

                        <rect x="20.5" y="10" width="8" height="10" rx="1.6" fill="#25282c" />

                        <rect x="27.5" y="7.5" width="59" height="15" rx="7.5" fill="url(#penBarrel)" stroke="#08234d" strokeWidth="0.7" />
                        <rect x="32" y="9.3" width="50" height="2.6" rx="1.3" fill="#d9ecff" opacity="0.6" />

                        <rect x="84" y="7" width="6.5" height="16" rx="1.2" fill="url(#penGold)" stroke="#5c3d0d" strokeWidth="0.6" />

                        <path d="M91 7.5H101.5C104.5 7.5 107 10.4 107 15C107 19.6 104.5 22.5 101.5 22.5H91Z" fill="url(#penGold)" stroke="#5c3d0d" strokeWidth="0.7" />
                        <rect x="97" y="3" width="2.6" height="10" rx="1.3" fill="url(#penGold)" stroke="#5c3d0d" strokeWidth="0.5" />
                      </svg>
                    </span>
                  </p>
                </div>
              </div>
              <div className="page page--right">
                <div className="page-seal">
                  <span>V</span>
                </div>
                <div className="page-flourish" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoader;
