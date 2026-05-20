import React, { useEffect, useState } from 'react';
import './HexagonBackground.css';

const HexagonBackground = () => {
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);

  // Hexagon dimensions based on your "20px top-to-bottom" requirement
  const hexHeight = 20;
  const hexWidth = 17.32; // Calculated as sqrt(3)/2 * height for a perfect hexagon

  useEffect(() => {
    const calculateGrid = () => {
      // We add a little extra to ensure the screen is fully covered
      const cols = Math.ceil(window.innerWidth / hexWidth) + 1;
      const rws = Math.ceil(window.innerHeight / (hexHeight * 0.75)) + 1;
      setColumns(cols);
      setRows(rws);
    };

    calculateGrid();
    window.addEventListener('resize', calculateGrid);
    return () => window.removeEventListener('resize', calculateGrid);
  }, []);

  return (
    <div className="hex-container">
      <div className="hex-grid">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="hex-row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="hex-cell">
                <div className="hex-inner">
                  <div className="hex-front"></div>
                  <div className="hex-back"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HexagonBackground;