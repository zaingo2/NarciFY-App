
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 p-6 text-center relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <i className="fa-solid fa-times text-lg"></i>
        </button>
        
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-battery-empty text-3xl text-amber-500"></i>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{t('usage.limitReachedTitle')}</h2>
        <p className="text-slate-300 mb-6">{t('usage.limitReachedDesc')}</p>
        
        <button 
            onClick={() => { onClose(); onUpgrade(); }}
            className="w-full bg-gradient-to-r from-teal-500 to-violet-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-all mb-3"
        >
            {t('usage.goPremiumButton')}
        </button>
        
        <button onClick={onClose} className="text-slate-400 text-sm hover:text-white">
            {t('usage.comeBackTomorrow')}
        </button>
      </div>
    </div>
  );
};
