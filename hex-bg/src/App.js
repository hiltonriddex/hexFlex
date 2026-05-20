import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import './App.css';

const Logo = () => (
  <div className="brand-logo">
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5L89 27.5V72.5L50 95L11 72.5V27.5L50 5Z" fill="#FF0000" />
      <path d="M35 30H55C62 30 65 34 65 39C65 44 62 48 55 48H35V30ZM35 48V70H43V55H48L58 70H68L56 53C62 51 65 47 65 39C65 31 60 22 48 22H35V48Z" fill="white" />
    </svg>
    <span className="logo-text">Rdx<span className="logo-tech">Tech</span></span>
  </div>
);

const sections = {
  home: { title: "Welcome", content: "This is the starting point of our hexagonal journey." },
  services: { title: "Our Services", content: "Precision-crafted digital solutions using modern tech." },
  projects: { title: "Case Studies", content: "Explore the tiles to see our latest architectural work." },
  login: { title: "Secure Access", content: "Enter your credentials to access the RdxTech portal." },
  contact: { title: "Get in Touch", content: "Reach out and let's build something together." }
};

const HexagonBackground = ({ activeSection, contentRef }) => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const tiles = useRef([]);
  const contentBounds = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const hexHeight = 20; 
  const hexRadius = hexHeight / 2;
  const hexWidth = Math.sqrt(3) * hexRadius;
  const vertDist = hexHeight * 0.75;
  const horizDist = hexWidth;

  const hexPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - (Math.PI / 2);
      points.push({ x: Math.cos(angle), y: Math.sin(angle) });
    }
    return points;
  }, []);

  useLayoutEffect(() => {
    if (activeSection !== 'home' && contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      contentBounds.current = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
    }
  }, [activeSection, contentRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      
      const cols = Math.ceil(window.innerWidth / horizDist) + 1;
      const rows = Math.ceil(window.innerHeight / vertDist) + 1;
      
      tiles.current = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          tiles.current.push({
            x: c * horizDist + (r % 2 === 0 ? 0 : horizDist / 2),
            y: r * vertDist,
            row: r,
            col: c,
            flipProgress: 0,
            lastTouched: 0
          });
        }
      }
    };

    const render = (time) => {
      ctx.fillStyle = '#fdfdfd';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      
      const b = contentBounds.current;
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      const approxCol = Math.floor(mx / horizDist);
      const approxRow = Math.floor(my / vertDist);

      tiles.current.forEach(tile => {
        const isNearMouse = Math.abs(tile.row - approxRow) < 3 && Math.abs(tile.col - approxCol) < 3;
        
        if (isNearMouse) {
          const dx = mx - tile.x;
          const dy = my - tile.y;
          if (Math.sqrt(dx * dx + dy * dy) < hexRadius) {
            tile.lastTouched = time;
          }
        }

        const inBox = activeSection !== 'home' && 
                      tile.x > b.x && tile.x < b.x + b.w && 
                      tile.y > b.y && tile.y < b.y + b.h;

        const shouldBeFlipped = inBox || (time - tile.lastTouched) < 200;
        const target = shouldBeFlipped ? 1 : 0;
        const lerp = shouldBeFlipped ? 0.8 : 0.3;
        tile.flipProgress += (target - tile.flipProgress) * lerp;

        if (tile.flipProgress < 0.001 && !shouldBeFlipped) {
          tile.flipProgress = 0;
        }

        const scaleX = Math.abs(Math.cos(tile.flipProgress * Math.PI));
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const pt = hexPoints[i];
          ctx.lineTo(tile.x + hexRadius * pt.x * scaleX, tile.y + hexRadius * pt.y);
        }
        ctx.closePath();
        
        ctx.fillStyle = tile.flipProgress > 0.5 ? (inBox ? '#f4f4f4' : '#eeeeee') : '#fdfdfd';
        ctx.fill();

        // --- UPDATED BORDER STYLES ---
        ctx.strokeStyle = '#d1d1d1'; // Slightly darker grey for better definition
        ctx.lineWidth = 0.7;          // Slightly thicker for precision
        ctx.stroke();
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
  }, [activeSection, horizDist, vertDist, hexRadius, hexPoints]);

  return <canvas ref={canvasRef} className="hex-canvas" style={{ touchAction: 'none' }} />;
};

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const contentRef = useRef(null);

  return (
    <div className="app-container">
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

      <HexagonBackground activeSection={activeSection} contentRef={contentRef} />

      {activeSection !== 'home' && (
        <div className="content-overlay">
          <div className="content-card" ref={contentRef}>
            <h1>{sections[activeSection].title}</h1>
            {activeSection === 'login' ? (
              <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" className="btn-primary">Sign In</button>
              </form>
            ) : (
              <p>{sections[activeSection].content}</p>
            )}
            <button className="btn-close" onClick={() => setActiveSection('home')}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}