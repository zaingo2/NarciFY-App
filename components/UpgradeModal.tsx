
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
}

// Links de ClickBank - Verified & Updated IDs
const PAYMENT_LINKS = {
    monthly: "https://zaingoplus.pay.clickbank.net/?cbitems=5",   // $4.99
    quarterly: "https://zaingoplus.pay.clickbank.net/?cbitems=4", // $14.99
    lifetime: "https://zaingoplus.pay.clickbank.net/?cbitems=6"   // $97.99
};

// Hardcoded valid license keys for the MVP
// Complex keys mimicking secure passwords
const VALID_LICENSE_KEYS = [
    "Xy#9Lm@2Q!!",      // Complex Key 1
    "K9$mP-x7Lz&4",     // Complex Key 2
    "N@rc1#Fy-88$",     // Complex Key 3
    "VIP-ACCESS-77",    // Backup Simple Key
    "Z$9-Pv#Lr2!m"      // Complex Key 4
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onStartTrial }) => {
  const { t } = useTranslation();
  const { status, becomePremium, isDevMode } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'lifetime'>('lifetime');
  const [viewMode, setViewMode] = useState<'sales' | 'license'>('sales');
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
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
      // Use standard window.location to navigate securely
      window.location.href = link;
  };

  const handleValidateLicense = () => {
      setLicenseError(null);
      setIsValidating(true);

      // Simulate network delay for realism
      setTimeout(() => {
          // Check exact match (case sensitive for security feeling, though we could normalize)
          if (VALID_LICENSE_KEYS.includes(licenseKey.trim())) {
              becomePremium();
              onClose();
              // Reset state for next time
              setLicenseKey('');
              setViewMode('sales');
          } else {
              setLicenseError(t('upgrade.invalidLicense') || "Invalid license key. Please check your email.");
          }
          setIsValidating(false);
      }, 1500);
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
                {viewMode === 'sales' ? <i className="fa-solid fa-crown text-xl text-white"></i> : <i className="fa-solid fa-key text-xl text-white"></i>}
            </div>
            <h2 className="text-xl font-bold text-white mb-1 leading-tight">
                {viewMode === 'sales' ? t('upgrade.modalTitle') : t('upgrade.enterLicenseTitle') || "Activate License"}
            </h2>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-snug">
                {viewMode === 'sales' ? t('upgrade.modalDescription') : t('upgrade.enterLicenseDesc') || "Enter the code sent to your email after purchase."}
            </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
            {viewMode === 'sales' ? (
                <>
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
                    
                    {/* Instructions for Clarity */}
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-[10px] text-slate-400 text-center">
                        <i className="fa-solid fa-envelope-open-text mr-1 text-teal-400"></i>
                        {t('upgrade.paymentInstruction')}
                    </div>
                </>
            ) : (
                <div className="py-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t('upgrade.licenseKeyLabel') || "License Key"}
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={licenseKey}
                            onChange={(e) => {
                                setLicenseKey(e.target.value);
                                setLicenseError(null);
                            }}
                            // Use a generic example that DOES NOT work, to prevent copy-paste bypass
                            placeholder="Ex: K#9pL-m@7Q!"
                            className={`w-full bg-slate-800 border ${licenseError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-600 focus:border-teal-500'} rounded-xl p-4 text-white text-center font-mono tracking-widest outline-none transition-colors placeholder-slate-600`}
                        />
                        {isValidating && (
                            <div className="absolute right-4 top-4">
                                <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>
                    {licenseError && (
                        <p className="text-rose-400 text-xs mt-2 text-center flex items-center justify-center gap-1">
                            <i className="fa-solid fa-circle-exclamation"></i> {licenseError}
                        </p>
                    )}
                    <div className="mt-6 bg-violet-500/10 border border-violet-500/30 p-3 rounded-lg">
                        <p className="text-violet-200 text-xs text-center leading-relaxed">
                            <i className="fa-solid fa-circle-info mr-1"></i>
                            {t('upgrade.findKeyHelp') || "Please check your inbox (and Spam/Promotions folder) for the email from NarciFY containing your code."}
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-800/50 rounded-b-2xl border-t border-slate-800 shrink-0">
            <div className="flex flex-col gap-3">
                 {viewMode === 'sales' ? (
                     <>
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
                        
                        <button 
                            onClick={() => setViewMode('license')}
                            className="text-slate-400 text-xs hover:text-white transition-colors underline decoration-dotted"
                        >
                            {t('upgrade.haveLicenseKey') || "I already have a license key"}
                        </button>
                     </>
                 ) : (
                     <>
                        <button
                            onClick={handleValidateLicense}
                            disabled={!licenseKey || isValidating}
                            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <span>{t('upgrade.activateButton') || "Activate"}</span>
                        </button>
                        <button 
                            onClick={() => {
                                setViewMode('sales');
                                setLicenseError(null);
                            }}
                            className="text-slate-400 text-xs hover:text-white transition-colors"
                        >
                            {t('upgrade.backToPlans') || "Back to Plans"}
                        </button>
                     </>
                 )}

                 {isDevMode && viewMode === 'sales' && (
                    <button onClick={handleSimulateSuccess} className="text-[10px] text-amber-500/50 hover:text-amber-500 uppercase font-bold tracking-wider">
                        [DEV] Simulate Success
                    </button>
                )}
            </div>
            
            {viewMode === 'sales' && (
                 <div className="text-center mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1 whitespace-nowrap"><i className="fa-solid fa-lock text-[9px]"></i> {t('upgrade.securePayment')}</span>
                    <span className="hidden sm:inline opacity-50">|</span>
                    <span className="whitespace-nowrap">{t('upgrade.cancelAnytime')}</span>
                </div>
            )}

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
