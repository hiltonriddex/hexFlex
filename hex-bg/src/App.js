import React, { useEffect, useRef } from 'react';
import './App.css';

const HexagonBackground = () => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const tiles = useRef([]);

  // --- CONFIGURATION ---
  const hexHeight = 20; 
  const hexRadius = hexHeight / 2;
  const hexWidth = Math.sqrt(3) * hexRadius;
  const vertDist = hexHeight * 0.75;
  const horizDist = hexWidth;
  const trailDuration = 1000; // How long (ms) the tile stays flipped

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
          const x = c * horizDist + (r % 2 === 0 ? 0 : horizDist / 2);
          const y = r * vertDist;
          tiles.current.push({
            x, y, 
            flipProgress: 0,
            targetFlip: 0,
            lastTouched: 0 // New property to track time
          });
        }
      }
    };

    const drawHex = (ctx, x, y, radius, scaleX, color) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - (Math.PI / 2);
        const px = x + radius * Math.cos(angle) * scaleX;
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
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
      
      tiles.current.forEach(tile => {
        const dx = mousePos.current.x - tile.x;
        const dy = mousePos.current.y - tile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 1. Check if mouse is CURRENTLY over the tile
        if (dist < (hexRadius * 0.95)) {
          tile.lastTouched = time; // Record the timestamp
        }

        // 2. Decide if it should be flipped:
        // Either the mouse is over it, OR it was touched recently (within trailDuration)
        const shouldBeFlipped = (time - tile.lastTouched) < trailDuration;
        tile.targetFlip = shouldBeFlipped ? 1 : 0;

        // 3. Smooth animation
        // We use a slightly slower return speed (0.1) for a "lazy" flip back
        const lerpFactor = shouldBeFlipped ? 0.2 : 0.05; 
        tile.flipProgress += (tile.targetFlip - tile.flipProgress) * lerpFactor;

        const scaleX = Math.abs(Math.cos(tile.flipProgress * Math.PI));
        const color = tile.flipProgress > 0.5 ? '#e8e8e8' : '#fdfdfd';

        drawHex(ctx, tile.x, tile.y, hexRadius, scaleX, color);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    setup();
    requestAnimationFrame(render);

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', setup);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', setup);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="hex-canvas" />;
};

export default HexagonBackground;