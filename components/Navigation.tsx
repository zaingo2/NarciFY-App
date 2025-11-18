

import React, { useState, useRef } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onUpgradeClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, onUpgradeClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { status, trialEndDate, isDevMode, toggleDevMode } = useAuth();
  const { language, changeLanguage, t, languages } = useTranslation();
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
     <div className="flex flex-col h-full">
      <div className="p-4 pt-6">
        <div className="flex items-center mb-6 pl-2">
            <Logo />
            <h2 className="text-2xl font-bold ml-3 text-slate-50">
              <span className="text-slate-50">Narci</span>
              <span className="text-teal-300">FY</span>
            </h2>
        </div>
        <nav>
          <ul>
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
                    className={`w-full text-left flex items-center p-3 my-1 rounded-lg transition-colors ${
                      currentView === item.id && !isLocked
                        ? 'bg-teal-500 text-white font-semibold shadow-md' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } ${isLocked ? 'opacity-60' : ''}`}
                  >
                    <i className={`${item.icon} w-8 text-center text-lg`}></i>
                    <span className="ml-3 flex-1">{item.title}</span>
                    {isLocked && <i className="fa-solid fa-lock text-amber-300"></i>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto p-4 space-y-4">
          <div className="p-3 bg-slate-900/50 rounded-lg text-center h-28 flex items-center justify-center">
             {status === 'premium' ? (
                <div className="flex flex-col items-center">
                    <i className="fa-solid fa-shield-halved text-amber-400 text-4xl" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))' }}></i>
                    <p className="mt-2 text-sm font-bold uppercase tracking-widest text-amber-300">{t('navigation.premium')}</p>
                </div>
              ) : status === 'trial' ? (
                 <div className="text-center">
                    <p className="text-sm font-bold text-slate-50">{t('navigation.trialStatus')}</p>
                    <p className="text-amber-300 text-sm mt-1">{t('navigation.trialDaysLeft', { count: getDaysLeftInTrial() })}</p>
                 </div>
              ) : (
                 <p className="text-sm font-bold text-slate-50">
                    {t('navigation.status')}: <span className='text-amber-300'>{t('navigation.freeUser')}</span>
                 </p>
              )}
          </div>
          {status !== 'premium' && (
            <button onClick={onUpgradeClick} className="w-full bg-gradient-to-r from-teal-500 to-violet-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
                <i className="fa-solid fa-rocket mr-2"></i>
                {t('navigation.upgrade')}
            </button>
          )}
          <div className="text-center text-xs text-slate-400 pt-4">
            <div className="mb-4">
                <label htmlFor="language-select" className="sr-only">{t('navigation.languageSelectorLabel')}</label>
                <select
                    id="language-select"
                    value={language}
                    onChange={e => changeLanguage(e.target.value)}
                    className="w-auto mx-auto p-1 pr-8 bg-slate-800 border border-slate-700 text-slate-300 rounded-md focus:ring-1 focus:ring-pink-300 focus:border-pink-300 transition appearance-none bg-no-repeat"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.5em 1.5em'
                    }}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>
            {status === 'premium' && (
                 <a href="https://zaingoapps.lemonsqueezy.com/my-orders" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition-colors block mb-2">
                    {t('navigation.manageSubscription')}
                 </a>
            )}
            <a href="https://zaingoapps.lemonsqueezy.com/affiliates" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300 transition-colors block mb-2">
              {t('navigation.affiliateProgram')}
            </a>
            {isDevMode && (
               <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                   <i className="fa-solid fa-bug mr-1"></i>
                   Dev Mode Active
               </p>
           )}
            <p className="text-slate-500 cursor-pointer" onClick={handleDevModeToggle}>&copy; {new Date().getFullYear()} NarciFY. {t('navigation.copyright')}</p>
          </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-md text-slate-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Open navigation menu"
      >
        <i className="fa fa-bars fa-lg"></i>
      </button>

      {/* Mobile Menu (Sliding) */}
      <div className={`lg:hidden fixed inset-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative w-72 h-full bg-slate-800 shadow-xl">
           <NavContent />
        </div>
      </div>

      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden lg:block fixed top-0 left-0 w-64 h-full bg-slate-800 border-r border-slate-700/50">
        <NavContent />
      </div>
    </>
  );
};