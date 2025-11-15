
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

// =================================================================================
// ¡ACCIÓN REQUERIDA!
// Pega aquí los "Checkout Links" que obtuviste de tu panel de Lemon Squeezy.
// Los encontrarás en la sección "Store" -> "Products" -> "Share".
// =================================================================================
const LEMON_SQUEEZY_MONTHLY_LINK = 'https://zaingoapps.lemonsqueezy.com/buy/619200eb-fbd6-46bc-b558-1bbb5f7e308f'; // <-- FINAL LINK
const LEMON_SQUEEZY_ANNUAL_LINK = 'https://zaingoapps.lemonsqueezy.com/buy/0e3a803a-19c9-4f4c-8f48-909311d2b42c';  // <-- FINAL LINK


interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}


export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onStartTrial }) => {
  const { t } = useTranslation();
  const { status } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  
  const premiumFeatures = [
    { icon: 'fa-magnifying-glass-chart', title: t('upgrade.feature1Title'), description: t('upgrade.feature1Desc') },
    { icon: 'fa-heart', title: t('upgrade.feature2Title'), description: t('upgrade.feature2Desc') },
    { icon: 'fa-wand-magic-sparkles', title: t('upgrade.feature3Title'), description: t('upgrade.feature3Desc') },
    { icon: 'fa-microphone', title: t('upgrade.feature4Title'), description: t('upgrade.feature4Desc') }
  ];

  if (!isOpen) return null;

  const getCheckoutLink = () => {
    const link = selectedPlan === 'annual' ? LEMON_SQUEEZY_ANNUAL_LINK : LEMON_SQUEEZY_MONTHLY_LINK;
    if (link.includes('URL_')) {
        // This is a friendly alert for the developer, not the end-user.
        alert("Configuration needed: Please replace the placeholder Lemon Squeezy URLs in the components/UpgradeModal.tsx file.");
        return '#'; // Return a safe link to prevent errors
    }
    return link;
  };

  const MainActionButton = () => {
    if (status === 'free') {
      return (
        <button
          onClick={onStartTrial}
          className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-bolt mr-2"></i>
          {t('upgrade.startTrialButton')}
        </button>
      );
    }
    return (
      <a 
        href={getCheckoutLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center"
      >
        <i className="fa-solid fa-lock mr-2"></i>
        {t('upgrade.upgradeButton')}
      </a>
    );
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-2xl shadow-2xl w-11/12 max-w-lg m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 mb-4 -mt-12 border-4 border-slate-800">
                <i className="fa-solid fa-rocket text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">{t('upgrade.modalTitle')}</h2>
            <p className="text-slate-300">{t('upgrade.modalDescription')}</p>
        </div>
        
        <div className="px-6 pb-6 space-y-4 max-h-[40vh] overflow-y-auto">
            {premiumFeatures.map(feature => (
                <div key={feature.title} className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-lg">
                    <i className={`fa-solid ${feature.icon} text-xl text-teal-300 mt-1 w-6 text-center`}></i>
                    <div>
                        <h4 className="font-semibold text-slate-100">{feature.title}</h4>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Pricing Toggle */}
        <div className="px-6 pb-4">
            <div className="bg-slate-900 p-1.5 rounded-xl flex items-center relative">
                 <button onClick={() => setSelectedPlan('monthly')} className={`w-1/2 p-2 rounded-lg text-sm font-bold z-10 transition-colors ${selectedPlan === 'monthly' ? 'text-white' : 'text-slate-300'}`}>
                    {t('upgrade.monthly')}
                </button>
                <button onClick={() => setSelectedPlan('annual')} className={`w-1/2 p-2 rounded-lg text-sm font-bold z-10 transition-colors ${selectedPlan === 'annual' ? 'text-white' : 'text-slate-300'}`}>
                    {t('upgrade.annual')}
                </button>
                <div className={`absolute top-1.5 h-[calc(100%-12px)] w-1/2 bg-teal-500 rounded-lg transition-transform duration-300 ease-in-out ${selectedPlan === 'annual' ? 'translate-x-full' : 'translate-x-0'}`}></div>
            </div>
            <div className="text-center mt-3 h-10 flex items-center justify-center">
                {selectedPlan === 'monthly' ? (
                    <p className="text-slate-50 text-xl"><span className="font-bold text-2xl">$4.99</span> {t('upgrade.monthlyPrice')}</p>
                ) : (
                    <p className="text-slate-50 text-xl"><span className="font-bold text-2xl">$49.99</span> {t('upgrade.annualPrice')} <span className="ml-2 bg-yellow-400/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">{t('upgrade.annualSave')}</span></p>
                )}
            </div>
        </div>


        <div className="p-6 bg-slate-900/50 rounded-b-2xl">
            <p className="text-center text-slate-400 text-sm mb-4">
               {t('upgrade.paymentInfo')}
            </p>
            <div className="flex flex-col gap-3">
                 <MainActionButton />
            </div>
            <button onClick={onClose} className="w-full text-center text-slate-400 mt-4 text-sm hover:text-white">
                {t('upgrade.maybeLater')}
            </button>
        </div>

      </div>
    </div>
  );
};