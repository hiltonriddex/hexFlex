import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- NEW LOGO COMPONENT ---
const Logo = () => (
  <div className="brand-logo">
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hexagon Background Shape */}
      <path 
        d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" 
        fill="#FF0000" 
      />
      {/* Modern 'R' Cutout */}
      <path 
        d="M35 30H55C62 30 65 34 65 39C65 44 62 48 55 48H35V30ZM35 48V70H43V55H48L58 70H68L56 53C62 51 65 47 65 39C65 31 60 22 48 22H35V48Z" 
        fill="white" 
      />
    </svg>
    <span className="logo-text">Rdx<span className="logo-tech">Tech</span></span>
  </div>
);

const sections = {
  home: { title: "Welcome", content: "This is the starting point of our hexagonal journey." },
  services: { title: "Our Services", content: "Precision-crafted digital solutions using modern tech." },
  projects: { title: "Case Studies", content: "Explore the tiles to see our latest architectural work." },
  contact: { title: "Get in Touch", content: "Reach out and let's build something together." }
};

const HexagonBackground = ({ activeSection }) => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const tiles = useRef([]);

  const hexHeight = 20; 
  const hexRadius = hexHeight / 2;
  const hexWidth = Math.sqrt(3) * hexRadius;
  const vertDist = hexHeight * 0.75;
  const horizDist = hexWidth;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const cols = Math.ceil(window.innerWidth / horizDist) + 1;
      const rows = Math.ceil(window.innerHeight / vertDist) + 1;
      
      tiles.current = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.current.push({
            x: c * horizDist + (r % 2 === 0 ? 0 : horizDist / 2),
            y: r * vertDist,
            flipProgress: 0,
            targetFlip: 0,
            lastTouched: 0
          });
        }
      }
    };

    const drawHex = (ctx, x, y, radius, scaleX, color) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - (Math.PI / 2);
        ctx.lineTo(x + radius * Math.cos(angle) * scaleX, y + radius * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const render = (time) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const boxW = 400;
      const boxH = 300;
      const boxX = (window.innerWidth - boxW) / 2;
      const boxY = (window.innerHeight - boxH) / 2;

      tiles.current.forEach(tile => {
        const dx = mousePos.current.x - tile.x;
        const dy = mousePos.current.y - tile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const inBox = activeSection !== 'home' && 
                      tile.x > boxX && tile.x < boxX + boxW && 
                      tile.y > boxY && tile.y < boxY + boxH;

        if (dist < (hexRadius * 0.95)) tile.lastTouched = time;

        const shouldBeFlipped = inBox || (time - tile.lastTouched) < 1000;
        tile.targetFlip = shouldBeFlipped ? 1 : 0;

        const lerp = shouldBeFlipped ? 0.15 : 0.05;
        tile.flipProgress += (tile.targetFlip - tile.flipProgress) * lerp;

        const scaleX = Math.abs(Math.cos(tile.flipProgress * Math.PI));
        const color = tile.flipProgress > 0.5 ? (inBox ? '#f0f0f0' : '#e8e8e8') : '#fdfdfd';

        drawHex(ctx, tile.x, tile.y, hexRadius, scaleX, color);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    setup();
    requestAnimationFrame(render);

    const handleMouseMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', setup);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', setup);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSection]);

  return <canvas ref={canvasRef} className="hex-canvas" />;
};

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="app-container">
      {/* Added the Logo Component here */}
      <Logo />

      <nav className="nav-menu">
        {Object.keys(sections).map(key => (
          <button 
            key={key} 
            className={activeSection === key ? 'active' : ''} 
            onClick={() => setActiveSection(key)}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </nav>

      <HexagonBackground activeSection={activeSection} />

      {activeSection !== 'home' && (
        <div className="content-overlay">
          <div className="content-card">
            <h1>{sections[activeSection].title}</h1>
            <p>{sections[activeSection].content}</p>
            <button onClick={() => setActiveSection('home')}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}