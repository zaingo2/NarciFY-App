import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onUpgradeClick: () => void;
}

const navItems = [
  { id: 'home', title: 'Home', icon: 'fa-solid fa-house', isPremium: false },
  { id: 'audios', title: 'Personalized 8D Audios', icon: 'fa-solid fa-heart', isPremium: true },
  { id: 'patternDetector', title: 'Pattern Detector', icon: 'fa-solid fa-magnifying-glass-chart', isPremium: true },
  { id: 'recommendations', title: 'Automatic Recommendations', icon: 'fa-solid fa-wand-magic-sparkles', isPremium: true },
  { id: 'sos', title: 'SOS Calm Down', icon: 'fa-solid fa-hand-holding-heart', isPremium: false },
];

export const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, onUpgradeClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isPremium } = useAuth();

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
              const isLocked = item.isPremium && !isPremium;
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
          <div className="p-3 bg-slate-900/50 rounded-lg text-center">
             <p className="text-sm font-bold text-slate-50">Status: <span className={isPremium ? 'text-teal-300' : 'text-amber-300'}>{isPremium ? 'Premium' : 'Free User'}</span></p>
          </div>
          {!isPremium && (
            <button onClick={onUpgradeClick} className="w-full bg-gradient-to-r from-teal-500 to-violet-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
                <i className="fa-solid fa-rocket mr-2"></i>
                Upgrade to Premium
            </button>
          )}
          <div className="text-center text-xs text-slate-500 pt-4">
            <p>&copy; {new Date().getFullYear()} NarciFY. All Rights Reserved.</p>
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
