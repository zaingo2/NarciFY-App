import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
      <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M35 75 L35 25 L65 75 Q 80 50, 65 25"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
};
