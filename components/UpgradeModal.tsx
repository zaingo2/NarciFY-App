
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
        className={`relative w-full p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 group text-left ${
            selectedPlan === id 
            ? 'bg-slate-700/50 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
        }`}
    >
        {badge && (
            <div className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg tracking-wide uppercase ${
                isBestValue 
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' 
                : 'bg-teal-500 text-white'
            }`}>
                {badge}
            </div>
        )}
        
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedPlan === id ? 'border-teal-500 bg-teal-500/10' : 'border-slate-500'
            }`}>
                {selectedPlan === id && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
            </div>
            <div>
                <h3 className={`font-bold text-sm sm:text-base ${selectedPlan === id ? 'text-white' : 'text-slate-300'}`}>
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs line-through font-medium">{originalPrice}</span>
                    <span className="text-rose-400 text-[10px] font-bold bg-rose-400/10 px-1.5 py-0.5 rounded">
                        {t('upgrade.limitedOffer')}
                    </span>
                </div>
            </div>
        </div>

        <div className="text-right">
            <div className="flex flex-col items-end">
                <span className={`text-xl font-bold ${selectedPlan === id ? 'text-white' : 'text-slate-200'}`}>
                    {price}
                </span>
                <span className="text-slate-400 text-[10px] sm:text-xs font-medium">
                    {period}
                </span>
            </div>
        </div>
    </button>
  );

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all border border-slate-700 flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 text-center border-b border-slate-800 relative shrink-0">
             <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
                <i className="fa fa-times text-lg"></i>
            </button>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-violet-500 mb-3 shadow-lg shadow-teal-500/20">
                <i className="fa-solid fa-crown text-xl text-white"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-1 leading-tight">{t('upgrade.modalTitle')}</h2>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-snug">{t('upgrade.modalDescription')}</p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs sm:text-sm">
                {premiumFeatures.map(feature => (
                    <div key={feature.title} className="flex items-center gap-2 text-slate-300">
                        <i className="fa-solid fa-check text-teal-400 text-xs"></i>
                        <span className="leading-tight">{feature.title}</span>
                    </div>
                ))}
            </div>

            {/* Pricing Options */}
            <div className="space-y-2">
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

        {/* Footer Actions */}
        <div className="p-5 bg-slate-800/50 rounded-b-2xl border-t border-slate-800 shrink-0">
            <div className="flex flex-col gap-3">
                 {status === 'free' && (
                    <button
                        onClick={onStartTrial}
                        className="w-full text-teal-400 hover:text-teal-300 transition-colors text-xs font-semibold flex items-center justify-center gap-1 py-1"
                    >
                        {t('upgrade.startTrialButton')} <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                 )}

                 <button
                    onClick={handleExternalPayment}
                    className="w-full bg-gradient-to-r from-teal-500 via-teal-400 to-teal-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                 >
                    <span className="text-base">{t('upgrade.upgradeButton')}</span>
                    <i className="fa-solid fa-arrow-right text-sm"></i>
                 </button>

                 {isDevMode && (
                    <button onClick={handleSimulateSuccess} className="text-[10px] text-amber-500/50 hover:text-amber-500 uppercase font-bold tracking-wider">
                        [DEV] Simulate Success
                    </button>
                )}
            </div>
            
             <div className="text-center mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-500 text-[10px]">
                <span className="flex items-center gap-1 whitespace-nowrap"><i className="fa-solid fa-lock text-[9px]"></i> {t('upgrade.securePayment')}</span>
                <span className="hidden sm:inline opacity-50">|</span>
                <span className="whitespace-nowrap">{t('upgrade.cancelAnytime')}</span>
            </div>

            <p className="text-[9px] text-slate-600 mt-3 text-center leading-tight max-w-md mx-auto">
                {t('upgrade.clickbankDisclaimer')}
            </p>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};
