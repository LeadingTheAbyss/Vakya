import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HowItWorks.css';

import img1 from '../images/1.png';
import img2 from '../images/2.png';
import img3 from '../images/3.png';
import img4 from '../images/4.png';
import img5 from '../images/5.png';
import img6 from '../images/6.png';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    // Calculate max scroll dynamically based on canvas and viewport width
    let scrollMax = canvas.scrollWidth - window.innerWidth + 200;

    const horizontalTween = gsap.to(canvas, {
      x: -scrollMax,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        pin: true,
        scrub: 1,
        end: () => '+=' + scrollMax,
        onUpdate: (self) => {
          const lineFill = document.querySelector('.line-path-fill') as SVGPathElement | null;
          if (lineFill) {
            const offset = 4400 - (4400 * self.progress);
            lineFill.style.strokeDashoffset = `${offset}`;
          }
        }
      },
    });

    // Hide scroll instruction when user begins scrolling
    gsap.to('.scroll-instruction', {
      opacity: 0,
      y: 20,
      scrollTrigger: {
        trigger: 'body',
        start: 'top -50',
        end: 'top -100',
        scrub: true,
      },
    });



    // Animate the dots lighting up as they come into view
    gsap.utils.toArray('.connector-dot').forEach((dot) => {
      gsap.fromTo(dot as Element, 
        { backgroundColor: '#cbd5e1', boxShadow: 'none' },
        {
          backgroundColor: '#10b981', // Success Emerald Green
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          scrollTrigger: {
            trigger: dot as Element,
            containerAnimation: horizontalTween,
            start: 'left center', // Light up when it reaches the center of viewport
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const steps = [
    { id: 1, title: 'Contract Ingestion', subtitle: 'Parses PDF & OCR', icon: '🔍', color: '#6366f1', image: img1 },
    { id: 2, title: 'Smart Classification', subtitle: 'Segments clauses', icon: '📑', color: '#8b5cf6', image: img2 },
    { id: 3, title: 'Compliance Verification', subtitle: 'Checks GST & law', icon: '⚖️', color: '#ec4899', image: img3 },
    { id: 4, title: 'Risk Assessment', subtitle: 'Scores each clause', icon: '🚨', color: '#ef4444', image: img4 },
    { id: 5, title: 'AI Negotiation', subtitle: 'Rewrites for MSME', icon: '✍️', color: '#10b981', image: img5 },
    { id: 6, title: 'Final Audit Report', subtitle: 'Output Document', icon: '🛡️', color: '#059669', image: img6 },
  ];

  return (
    <div className="hiw-section" id="how">

      <div className="scroll-wrapper" ref={wrapperRef}>
        <div className="canvas" ref={canvasRef} style={{ width: '5600px' }}>
          <svg className="lines-layer" viewBox="0 0 5600 1000">
            {/* Background track */}
            <path className="line-path-base" d="M 400 500 L 4800 500" />
            {/* Foreground fill (animated) */}
            <path className="line-path-fill" d="M 400 500 L 4800 500" style={{ strokeDasharray: 4400, strokeDashoffset: 4400 }} />
          </svg>

          {steps.map((step, index) => {
            const left = 800 + index * 800;
            return (
              <React.Fragment key={step.id}>
                {/* Connector Dot (exactly halfway between cards) */}
                <div 
                  className="clay-element connector-dot" 
                  style={{ left: `${left - 400}px`, top: '500px' }}
                ></div>

                {/* Main Card */}
                <div 
                  className="clay-element hiw-card" 
                  style={{ left: `${left}px`, top: '500px' }}
                >
                  <div className="card-video-wrap" onClick={() => setSelectedImage(step.image)} style={{ cursor: 'pointer' }}>
                    <img className="thumbnail" src={step.image} alt={step.title} />
                    <div className="header-badges">
                      <div className="badge-group">
                        <span className="hiw-badge" style={{ background: step.color }}>{step.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-stats">
                    <div className="card-text-content">
                      <h3 className="hiw-clean-title" style={{ color: step.color }}>{step.title}</h3>
                      <span className="hiw-clean-subtitle">{step.subtitle}</span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {selectedImage && (
        <div className="hiw-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="hiw-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Expanded view" />
            <button className="hiw-lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HowItWorks;
