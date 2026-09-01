import { useEffect, useRef, useState } from 'react';
import './BookLoader.css';
import vakyaLogo from '../images/logo_nobg.png';

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

  return (
    <div className={`book-scene book-scene--${phase}`}>
      <div className="book-wrapper">
        <div className="book-wing book-wing--left" />
        <div className="book-wing book-wing--right" />

        <div className="book-perspective">
          <div className={`book-flip book-flip--${phase}`}>

            <div className="book-face book-face--front">
              <div className="cover-frame">
                <img className="cover-logo" src={vakyaLogo} alt="Vakya" />
              </div>
            </div>

            <div className="book-face book-face--back">
              <div className="book-spine-shadow" />
              <div className="page page--left">
                <div className="page-heading">Uploaded Bond</div>
                <div className="page-rules">
                  <p className="page-line">
                    {typed}
                    <span className="pen-nib" aria-hidden="true">
                      <svg width="220" height="120" viewBox="0 0 420 220" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          <linearGradient id="featherLight" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#f4ede0" />
                            <stop offset="55%" stopColor="#e2d3b3" />
                            <stop offset="100%" stopColor="#b89b6c" />
                          </linearGradient>
                          <linearGradient id="featherShade" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#d8c7a0" />
                            <stop offset="100%" stopColor="#9c7f52" />
                          </linearGradient>
                        </defs>

                        {/* quill feather, fanning out behind the barrel */}
                        <g className="pen-feather">
                          <path d="M330 108 C 400 60, 430 -10, 404 -46 C 392 4, 362 40, 330 66 Z" fill="url(#featherLight)" stroke="#8a6f45" strokeWidth="1.4" />
                          <path d="M330 108 C 392 82, 432 40, 432 2 C 404 34, 366 62, 330 82 Z" fill="url(#featherShade)" stroke="#8a6f45" strokeWidth="1.4" />
                          <path d="M330 112 C 396 118, 440 108, 452 78 C 416 92, 372 96, 330 96 Z" fill="url(#featherLight)" stroke="#8a6f45" strokeWidth="1.4" />
                          <path d="M330 116 C 392 138, 432 148, 452 132 C 412 130, 372 122, 330 108 Z" fill="url(#featherShade)" stroke="#8a6f45" strokeWidth="1.4" />
                          <path d="M330 60 L 452 -20" stroke="#7a6038" strokeWidth="2" strokeLinecap="round" />
                        </g>

                        <path d="M8 60 68 34 90 60 68 86Z" fill="url(#penSilver)" stroke="#3a3d40" strokeWidth="2.4" />
                        <line x1="34" y1="60" x2="82" y2="60" stroke="#3a3d40" strokeWidth="2" />
                        <circle cx="12" cy="60" r="4.5" fill="#1a1a1a" />

                        <rect x="82" y="40" width="32" height="40" rx="6" fill="#25282c" />

                        <rect x="110" y="30" width="230" height="60" rx="30" fill="url(#penBarrel)" stroke="#08234d" strokeWidth="2.4" />
                        <rect x="128" y="37" width="196" height="10" rx="5" fill="#d9ecff" opacity="0.6" />
                        <rect x="128" y="72" width="196" height="6" rx="3" fill="#04193f" opacity="0.35" />

                        <rect x="330" y="26" width="26" height="66" rx="5" fill="url(#penGold)" stroke="#5c3d0d" strokeWidth="2" />
                      </svg>
                    </span>
                  </p>
                </div>
              </div>
              <div className="page page--right" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoader;
