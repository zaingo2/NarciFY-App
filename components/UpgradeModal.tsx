


import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}

// Links de ClickBank
const PAYMENT_LINKS = {
    monthly: "https://zaingoplus.pay.clickbank.net/?cbitems=2",
    quarterly: "https://zaingoplus.pay.clickbank.net/?cbitems=3",
    lifetime: "https://zaingoplus.pay.clickbank.net/?cbitems=1"
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onStartTrial }) => {
  const { t } = useTranslation();
  const { status, becomePremium, isDevMode } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'lifetime'>('lifetime');
  
  const premiumFeatures = [
    { icon: 'fa-magnifying-glass-chart', title: t('upgrade.feature1Title') },
    { icon: 'fa-heart', title: t('upgrade.feature2Title') },
    { icon: 'fa-wand-magic-sparkles', title: t('upgrade.feature3Title') },
    { icon: 'fa-microphone', title: t('upgrade.feature4Title') }
  ];

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
      becomePremium();
      onClose();
  };

  const handleExternalPayment = () => {
      const link = PAYMENT_LINKS[selectedPlan];
      // Usar window.location.href mantiene la misma pestaña como solicitado
      window.location.href = link;
  };

  const PlanCard = ({ 
    id, 
    title, 
    price, 
    originalPrice, 
    period, 
    badge, 
    isBestValue 
  }: { 
    id: 'monthly' | 'quarterly' | 'lifetime', 
    title: string, 
    price: string, 
    originalPrice: string, 
    period: string, 
    badge?: string,
    isBestValue?: boolean
  }) => (
    <button
        onClick={() => setSelectedPlan(id)}
        className={`relative w-full p-4 rounded-xl border-2 transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 group text-left ${
            selectedPlan === id 
            ? 'bg-slate-700/50 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]' 
            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
        }`}
    >
        {badge && (
            <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                isBestValue 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' 
                : 'bg-teal-500 text-white'
            }`}>
                {badge}
            </div>
        )}
        
        <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedPlan === id ? 'border-teal-500' : 'border-slate-500'
            }`}>
                {selectedPlan === id && <div className="w-3 h-3 rounded-full bg-teal-500" />}
            </div>
            <div>
                <h3 className={`font-bold text-lg ${selectedPlan === id ? 'text-white' : 'text-slate-300'}`}>
                    {title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-sm line-through font-medium">{originalPrice}</span>
                    <span className="text-rose-400 text-xs font-bold bg-rose-400/10 px-2 py-0.5 rounded-md">
                        {t('upgrade.limitedOffer')}
                    </span>
                </div>
            </div>
        </div>

        <div className="text-right">
            <div className="flex flex-col items-end">
                <span className={`text-2xl font-bold ${selectedPlan === id ? 'text-white' : 'text-slate-200'}`}>
                    {price}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                    {period}
                </span>
            </div>
        </div>
    </button>
  );

  return (
    <div 
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 sm:p-6" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl my-auto transform transition-all border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-slate-800">
             <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <i className="fa fa-times fa-lg"></i>
            </button>
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 mb-4 shadow-lg shadow-teal-500/20">
                <i className="fa-solid fa-crown text-2xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('upgrade.modalTitle')}</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">{t('upgrade.modalDescription')}</p>
        </div>

        <div className="p-6 space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                {premiumFeatures.map(feature => (
                    <div key={feature.title} className="flex items-center gap-3 text-slate-300">
                        <i className="fa-solid fa-check text-teal-400"></i>
                        <span>{feature.title}</span>
                    </div>
                ))}
            </div>

            {/* Pricing Options */}
            <div className="space-y-3">
                <PlanCard 
                    id="monthly"
                    title={t('upgrade.monthly')}
                    price="$4.99"
                    originalPrice="$9.99"
                    period={t('upgrade.monthlyPrice')}
                />
                <PlanCard 
                    id="quarterly"
                    title={t('upgrade.quarterly')}
                    price="$14.99"
                    originalPrice="$29.99"
                    period={t('upgrade.per3Months')}
                    badge={t('upgrade.mostPopular')}
                />
                <PlanCard 
                    id="lifetime"
                    title={t('upgrade.lifetime')}
                    price="$97.99"
                    originalPrice="$195.99"
                    period={t('upgrade.oneTime')}
                    badge={t('upgrade.bestValue')}
                    isBestValue={true}
                />
            </div>
        </div>

        <div className="p-6 bg-slate-800/50 rounded-b-2xl border-t border-slate-800">
            <div className="flex flex-col gap-4">
                 {status === 'free' && (
                    <button
                        onClick={onStartTrial}
                        className="w-full text-teal-400 font-semibold py-2 px-4 hover:text-teal-300 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        {t('upgrade.startTrialButton')} <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                 )}

                 <button
                    onClick={handleExternalPayment}
                    className="w-full bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] text-white font-bold py-4 px-4 rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                 >
                    <span className="text-lg">{t('upgrade.upgradeButton')}</span>
                    <i className="fa-solid fa-arrow-right"></i>
                 </button>

                 {isDevMode && (
                    <button onClick={handleSimulateSuccess} className="text-xs text-amber-500/50 hover:text-amber-500 uppercase font-bold tracking-wider">
                        [DEV] Simulate Success
                    </button>
                )}
            </div>
            
             <div className="text-center mt-4 flex items-center justify-center gap-4 text-slate-500 text-xs">
                <span className="flex items-center gap-1"><i className="fa-solid fa-lock"></i> {t('upgrade.securePayment')}</span>
                <span>|</span>
                <span>{t('upgrade.cancelAnytime')}</span>
            </div>

            <p className="text-[10px] text-slate-600 mt-6 text-center leading-tight max-w-lg mx-auto">
                {t('upgrade.clickbankDisclaimer')}
            </p>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};