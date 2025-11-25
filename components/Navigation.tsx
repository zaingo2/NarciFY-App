
import React, { useState, useRef } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useUsage } from '../contexts/UsageContext';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onUpgradeClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, onUpgradeClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { status, trialEndDate, isDevMode, toggleDevMode } = useAuth();
  const { language, changeLanguage, t, languages } = useTranslation();
  const { creditsLeft, dailyLimit } = useUsage();
  const [devClickCount, setDevClickCount] = useState(0);
  const devClickTimeoutRef = useRef<number | null>(null);

  const navItems = [
    { id: 'home', title: t('navigation.home'), icon: 'fa-solid fa-house', isPremium: false },
    { id: 'audios', title: t('navigation.audios'), icon: 'fa-solid fa-heart', isPremium: true },
    { id: 'patternDetector', title: t('navigation.patternDetector'), icon: 'fa-solid fa-magnifying-glass-chart', isPremium: true },
    { id: 'recommendations', title: t('navigation.recommendations'), icon: 'fa-solid fa-wand-magic-sparkles', isPremium: true },
    { id: 'sos', title: t('navigation.sos'), icon: 'fa-solid fa-hand-holding-heart', isPremium: false },
  ];
  
  const getDaysLeftInTrial = () => {
      if (!trialEndDate) return 0;
      const endDate = new Date(trialEndDate).getTime();
      const now = Date.now();
      const diff = endDate - now;
      if (diff <= 0) return 0;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleDevModeToggle = () => {
    if (devClickTimeoutRef.current) {
        clearTimeout(devClickTimeoutRef.current);
    }

    const newCount = devClickCount + 1;
    setDevClickCount(newCount);

    if (newCount >= 7) {
        toggleDevMode();
        setDevClickCount(0);
    }

    devClickTimeoutRef.current = window.setTimeout(() => {
        setDevClickCount(0);
    }, 2000); // Reset after 2 seconds of inactivity
  };


  const NavContent = () => (
     <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 lg:p-3 xl:p-4 pt-6">
        <div className="flex items-center mb-6 pl-2">
            <Logo />
            <h2 className="text-xl lg:text-2xl font-bold ml-3 text-slate-50">
              <span className="text-slate-50">Narci</span>
              <span className="text-teal-300">FY</span>
            </h2>
        </div>
        <nav>
          <ul className="space-y-1">
            {navItems.map(item => {
              const isLocked = item.isPremium && status === 'free';
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (isLocked) {
                        onUpgradeClick();
                      } else {
                        setCurrentView(item.id);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left flex items-center p-2.5 lg:p-2 xl:p-3 rounded-lg transition-colors text-sm lg:text-base ${
                      currentView === item.id && !isLocked
                        ? 'bg-teal-500 text-white font-semibold shadow-md' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <i className={`${item.icon} w-6 text-center text-lg lg:text-base xl:text-lg`}></i>
                    <span className="ml-3 flex-1">{item.title}</span>
                    {isLocked && <i className="fa-solid fa-lock text-amber-300 text-xs"></i>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto p-4 lg:p-3 xl:p-4 space-y-3">
          {/* Status Box - Compacted */}
          <div className="p-3 bg-slate-900/50 rounded-lg text-center flex flex-col items-center justify-center min-h-[80px]">
             {status === 'premium' ? (
                <div className="flex flex-col items-center">
                    <i className="fa-solid fa-shield-halved text-amber-400 text-2xl mb-1" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }}></i>
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-300">{t('navigation.premium')}</p>
                </div>
              ) : status === 'trial' ? (
                 <div className="text-center">
                    <p className="text-xs font-bold text-slate-50">{t('navigation.trialStatus')}</p>
                    <p className="text-amber-300 text-xs mt-0.5">{t('navigation.trialDaysLeft', { count: getDaysLeftInTrial() })}</p>
                 </div>
              ) : (
                 <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>{t('navigation.status')}:</span>
                        <span className='text-amber-300 uppercase font-bold'>{t('navigation.freeUser')}</span>
                    </div>
                    {/* Usage Bar for Free Users */}
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1 relative">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${creditsLeft <= 2 ? 'bg-rose-500' : 'bg-teal-500'}`} 
                            style={{ width: `${(creditsLeft / dailyLimit) * 100}%` }}>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Daily Limit</span>
                        <span>{creditsLeft}/{dailyLimit}</span>
                    </div>
                    {creditsLeft <= 2 && creditsLeft > 0 && (
                        <p className="text-[10px] text-rose-400 animate-pulse text-center">Low energy!</p>
                    )}
                 </div>
              )}
          </div>

          {status !== 'premium' && (
            <button onClick={onUpgradeClick} className="w-full bg-gradient-to-r from-teal-500 to-violet-500 text-white font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center">
                <i className="fa-solid fa-rocket mr-2"></i>
                {t('navigation.upgrade')}
            </button>
          )}
          
          <div className="text-center text-[10px] lg:text-xs text-slate-400 pt-2 border-t border-slate-700/50">
            <div className="mb-3">
                <label htmlFor="language-select" className="sr-only">{t('navigation.languageSelectorLabel')}</label>
                <select
                    id="language-select"
                    value={language}
                    onChange={e => changeLanguage(e.target.value)}
                    className="w-full mx-auto p-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition appearance-none text-center cursor-pointer text-xs"
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>
            {status === 'premium' && (
                 <a href="https://zaingoapps.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition-colors block mb-1">
                    {t('navigation.manageSubscription')}
                 </a>
            )}
            {isDevMode && (
               <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider mb-1">
                   <i className="fa-solid fa-bug mr-1"></i>
                   Dev Mode
               </p>
           )}
            <p className="text-slate-600 cursor-pointer hover:text-slate-500 transition-colors" onClick={handleDevModeToggle}>&copy; {new Date().getFullYear()} NarciFY.</p>
          </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-md text-slate-50 shadow-md border border-slate-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Open navigation menu"
      >
        <i className="fa fa-bars fa-lg"></i>
      </button>

      {/* Mobile Menu (Sliding) */}
      <div className={`lg:hidden fixed inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative w-72 h-full bg-slate-800 shadow-2xl border-r border-slate-700">
           <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-slate-800 border-r border-slate-700/50 shadow-xl z-30">
        <NavContent />
      </div>
    </>
  );
};
