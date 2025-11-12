import React from 'react';

export const AudioBanner: React.FC = () => {
  return (
    <div className="w-full h-auto mb-6">
      <svg
        viewBox="0 0 400 70"
        width="100%"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" // Decorative image
      >
        <defs>
          <linearGradient id="audioBannerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A6C1B9" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#B4A5D6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7B5EA6" stopOpacity="0.25" />
          </linearGradient>
          <filter id="softBlurAudio" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>
        
        {/* Base rounded rectangle */}
        <rect
          x="0"
          y="0"
          width="400"
          height="70"
          rx="12"
          ry="12"
          fill="#0F172A" // slate-900 for depth
        />
        
        {/* Soft blurred background shapes */}
        <ellipse cx="100" cy="35" rx="120" ry="40" fill="url(#audioBannerGradient)" filter="url(#softBlurAudio)" />
        <ellipse cx="300" cy="35" rx="100" ry="35" fill="url(#audioBannerGradient)" filter="url(#softBlurAudio)" opacity="0.7" />

        {/* Abstract audio waveform representation */}
        <g>
            <path
                d="M 40 35 L 55 42 L 70 28 L 85 48 L 100 25 L 115 52 L 130 35 L 145 38 L 160 32 L 175 45 L 190 25 L 205 50 L 220 30 L 235 45 L 250 35 L 265 29 L 280 49 L 295 24 L 310 51 L 325 35 L 340 42 L 360 35"
                stroke="#7B5EA6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.5"
            >
                <animate
                    attributeName="opacity"
                    values="0.5;0.2;0.5"
                    dur="2.5s"
                    repeatCount="indefinite"
                />
            </path>
            <path
                d="M 40 35 L 60 25 L 80 45 L 100 20 L 120 50 L 140 35 L 160 30 L 180 40 L 200 35 L 220 42 L 240 28 L 260 55 L 280 22 L 300 48 L 320 35 L 340 40 L 360 35"
                stroke="#B4A5D6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.8"
            >
                <animate
                    attributeName="opacity"
                    values="0.3;0.8;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                />
            </path>
        </g>
      </svg>
    </div>
  );
};
