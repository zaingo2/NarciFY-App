
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const ChristmasBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-red-900 via-purple-900 to-slate-900 border-b border-yellow-500/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <span className="text-xl animate-bounce">🎄</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
            <p className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
              {t('christmas.bannerTitle')}
            </p>
            <div className="text-xs sm:text-sm flex items-center gap-2">
               <span className="text-slate-400 line-through decoration-red-500">$97.99</span>
               <span className="text-yellow-400 font-bold glow-text">$49.99</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <a 
              href="https://zaingoplus.pay.clickbank.net/?cbitems=1"
              className="bg-gradient-to-r from-yellow-500 to-amber-500 text-red-900 text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-full hover:scale-105 transition-transform shadow-lg whitespace-nowrap uppercase tracking-wide"
            >
              {t('christmas.claimButton')}
            </a>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close banner"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
      </div>
      <style>{`
        .glow-text {
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
        }
      `}</style>
    </div>
  );
};
