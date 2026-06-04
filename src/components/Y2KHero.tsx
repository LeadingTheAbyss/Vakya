import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroImage from '../images/bg.png';
import './Y2KHero.css';

gsap.registerPlugin(ScrollTrigger);

const LINE1 = "WE READ THE FINE PRINT";
const LINE2 = "SO YOU DON'T PAY THE PRICE.";

const Y2KHero = () => {
  const container = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const belowRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // ── HOVER: shuffle chars up → in from below ─────────────────
  const handleBelowEnter = useCallback(() => {
    const chars = belowRef.current?.querySelectorAll('.bt-char');
    const lines = belowRef.current?.querySelectorAll('.bt-line');
    if (!chars || chars.length === 0) return;

    // Activate underlines on all lines
    lines?.forEach(l => l.classList.add('underline-active'));

    if (isAnimating.current) return;
    isAnimating.current = true;

    // Phase 1: fly up + fade out
    gsap.to(chars, {
      yPercent: -110,
      opacity: 0,
      duration: 0.35,
      stagger: { each: 0.018, from: 'start' },
      ease: 'power2.in',
      onComplete: () => {
        // Phase 2: reset below, fly back in
        gsap.fromTo(chars,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.45,
            stagger: { each: 0.018, from: 'start' },
            ease: 'power3.out',
            onComplete: () => { isAnimating.current = false; }
          }
        );
      }
    });
  }, []);

  const handleBelowLeave = useCallback(() => {
    const lines = belowRef.current?.querySelectorAll('.bt-line');
    lines?.forEach(l => l.classList.remove('underline-active'));
  }, []);

  useEffect(() => {
    const cursorEl = cursorRef.current;
    const ringEl = cursorRingRef.current;
    const wrapperEl = container.current;

    // ── CURSOR ────────────────────────────────────────────────
    let mx = 0, my = 0, rx = 0, ry = 0;
    let cursorVisible = false;

    const onMouseMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);

    const onMouseEnter = () => {
      cursorVisible = true;
      if (cursorEl) cursorEl.style.opacity = '1';
      if (ringEl) ringEl.style.opacity = '1';
      if (wrapperEl) wrapperEl.style.cursor = 'none';
    };
    const onMouseLeave = () => {
      cursorVisible = false;
      if (cursorEl) cursorEl.style.opacity = '0';
      if (ringEl) ringEl.style.opacity = '0';
      if (wrapperEl) wrapperEl.style.cursor = 'auto';
    };

    wrapperEl?.addEventListener('mouseenter', onMouseEnter);
    wrapperEl?.addEventListener('mouseleave', onMouseLeave);

    gsap.ticker.add(() => {
      if (!cursorVisible) return;
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (cursorEl) gsap.set(cursorEl, { x: mx, y: my });
      if (ringEl) gsap.set(ringEl, { x: rx, y: ry });
    });

    // ── ENTRANCE ──────────────────────────────────────────────
    const ctx = gsap.context(() => {
      const rowA = document.getElementById('rowA');
      gsap.set([rowA], { yPercent: 105 });
      gsap.set(['.y2k-bracket'], { opacity: 0 });

      gsap.timeline({ delay: 0.15 })
        .to(rowA, { yPercent: 0, duration: 0.9, ease: 'power3.out' })
        .to('.y2k-bracket', { opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '-=0.4');

      // ── SCROLL ZOOM ─────────────────────────────────────────
      gsap.timeline({
        scrollTrigger: { trigger: '#y2k-wrapper', start: 'top top', end: '+=180%', pin: true, scrub: true }
      })
        .fromTo('#heroImg', { scale: 1 }, { scale: 2.2, duration: 1, transformOrigin: 'center center', ease: 'none' }, 0)
        .fromTo(rowA, { yPercent: 0, opacity: 1 }, { yPercent: -120, opacity: 0, duration: 0.8, ease: 'power2.in' }, 0)
        .fromTo(['#bTL', '#bBR', '#bTR', '#bBL'], { scale: 1, opacity: 1 }, { scale: 0.5, opacity: 0, duration: 0.6, ease: 'power2.in' }, 0)
        .fromTo('#bgPlasma', { opacity: 1 }, { opacity: 0, duration: 0.7, ease: 'power2.in' }, 0.3)
        .fromTo('.y2k-scanlines', { opacity: 0.6 }, { opacity: 1.5, duration: 1, ease: 'none' }, 0);

      // ── SCROLL REVEAL chars ──────────────────────────────────
      gsap.from('.bt-char', {
        scrollTrigger: {
          trigger: '.section-below',
          start: 'top 75%',
          toggleActions: 'play reverse play reverse'
        },
        opacity: 0,
        y: 50,
        scale: 0.7,
        duration: 0.55,
        stagger: 0.022,
        ease: 'back.out(2)',
      });
    }, container);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      wrapperEl?.removeEventListener('mouseenter', onMouseEnter);
      wrapperEl?.removeEventListener('mouseleave', onMouseLeave);
      ctx.revert();
    };
  }, []);

  return (
    <div className="y2k-hero-wrapper" ref={container}>
      {/* ── CURSOR ── */}
      <div className="y2k-cursor" ref={cursorRef}></div>
      <div className="y2k-cursor-ring" ref={cursorRingRef}></div>

      {/* ── PINNED HERO ── */}
      <div className="y2k-wrapper" id="y2k-wrapper">
        <div className="bg-plasma" id="bgPlasma"></div>
        <div className="image-container" id="imgContainer">
          <img src={heroImage} alt="hero" id="heroImg" />
        </div>
        <div className="y2k-scanlines"></div>
        <div className="brackets">
          <div className="y2k-bracket bracket-tl" id="bTL"></div>
          <div className="y2k-bracket bracket-tr" id="bTR"></div>
          <div className="y2k-bracket bracket-bl" id="bBL"></div>
          <div className="y2k-bracket bracket-br" id="bBR"></div>
        </div>
        <div className="hero-overlay">
          <div className="hero-title" id="heroTitle">
            <div className="y2k-row"><span id="rowA">VAKYA</span></div>
          </div>
        </div>
      </div>

      {/* ── BELOW SECTION — hover wired via React ── */}
      <div className="section-below">
        <div className="bg-plasma" style={{ opacity: 0.12 }}></div>
        <div
          className="below-text"
          id="belowText"
          ref={belowRef}
          onMouseEnter={handleBelowEnter}
          onMouseLeave={handleBelowLeave}
        >
          {/* Line 1 */}
          <div className="bt-line">
            <div className="bt-underline"></div>
            <div className="bt-chars-wrap">
              {LINE1.split("").map((ch, i) => (
                <span key={'l1' + i} className={"bt-char" + (ch === " " ? " bt-space" : "")}>
                  {ch === " " ? "\u00a0" : ch}
                </span>
              ))}
            </div>
          </div>

          {/* Line 2 */}
          <div className="bt-line">
            <div className="bt-underline"></div>
            <div className="bt-chars-wrap">
              <em>
                {LINE2.split("").map((ch, i) => (
                  <span key={'l2' + i} className={"bt-char" + (ch === " " ? " bt-space" : "")}>
                    {ch === " " ? "\u00a0" : ch}
                  </span>
                ))}
              </em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Y2KHero;
