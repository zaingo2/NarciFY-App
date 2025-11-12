import React from 'react';

export const AnalysisBanner: React.FC = () => {
  return (
    <div className="w-full h-auto mb-6">
      <svg
        viewBox="0 0 400 70"
        width="100%"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" // Decorative image
      >
        <defs>
          <linearGradient id="keyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" /> 
            <stop offset="100%" stopColor="#ec4899" /> 
          </linearGradient>
          <filter id="bokehBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
           <clipPath id="bannerClip">
            <rect width="400" height="70" rx="12" />
           </clipPath>
        </defs>
        
        {/* Base rounded rectangle */}
        <rect
          x="0"
          y="0"
          width="400"
          height="70"
          rx="12"
          ry="12"
          fill="#020617" // near black for depth
        />

        {/* Bokeh background keys */}
        <g clipPath="url(#bannerClip)" filter="url(#bokehBlur)" opacity="0.6">
            {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 20 }).map((_, col) => (
                    <ellipse
                        key={`${row}-${col}`}
                        cx={(col * 22) + 100}
                        cy={(row * 15) - 10}
                        rx="9"
                        ry="6"
                        transform={`rotate(-20 ${ (col * 22) + 100},${(row * 15) - 10})`}
                        fill="url(#keyGlow)"
                        opacity={0.1 + (col > 10 ? Math.random() * 0.4 : 0)}
                    />
                ))
            )}
        </g>
        
        {/* Foreground sharp keys */}
        <g transform="translate(-10, 5) rotate(-5)">
            <rect x="20" y="25" width="25" height="15" rx="3" fill="#1e293b" stroke="url(#keyGlow)" strokeWidth="0.5" opacity="0.9"/>
            <rect x="50" y="22" width="25" height="15" rx="3" fill="#1e293b" stroke="url(#keyGlow)" strokeWidth="0.5" opacity="0.9"/>
            <rect x="25" y="45" width="45" height="15" rx="3" fill="#1e293b" stroke="url(#keyGlow)" strokeWidth="0.5" opacity="0.9"/>
            {/* abstract letter hint */}
            <path d="M 30 32 L 32 38 L 34 32" stroke="#ec4899" strokeWidth="1" fill="none" opacity="0.5" />
        </g>

      </svg>
    </div>
  );
};
