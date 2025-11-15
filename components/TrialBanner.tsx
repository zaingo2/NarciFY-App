import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TrialBannerProps {
  onStartTrial: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onStartTrial }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-teal-500/20 to-violet-500/20 rounded-xl border border-teal-400/30 text-center shadow-lg">
      <div className="flex flex-col sm:flex-row justify-center items-center mb-4 gap-4">
        <i className="fa-solid fa-rocket text-3xl text-teal-300"></i>
        <h3 className="text-xl font-bold text-slate-50">{t('trialBanner.title')}</h3>
      </div>
      <p className="text-slate-300 mb-6 max-w-xl mx-auto">{t('trialBanner.description')}</p>
      <button
        onClick={onStartTrial}
        className="bg-teal-500 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-600 transition-transform hover:scale-105"
      >
        {t('trialBanner.ctaButton')}
      </button>
    </div>
  );
};
