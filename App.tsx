


import React, { useState, useEffect, useRef } from 'react';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Navigation } from './components/Navigation';
import { Disclaimer } from './components/Disclaimer';
import { LocalHelp } from './components/LocalHelp';
import { ChatWidget } from './components/ChatWidget';
import { PatternDetector } from './components/PatternDetector';
import { PersonalizedAudios } from './components/PersonalizedAudios';
import { SOSCalmDown } from './components/SOSCalmDown';
import { AutomaticRecommendations } from './components/AutomaticRecommendations';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { useTranslation } from './hooks/useTranslation';
import type { AnalysisResult, LocalHelpResult, UserLocation } from './types';
import { placeholderAnalysisHistory } from './utils/placeholders';
import { findLocalHelp } from './services/geminiService';

const MAX_HISTORY_LENGTH = 15;

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localHelpResults, setLocalHelpResults] = useState<LocalHelpResult[]>([]);
  const [isFindingHelp, setIsFindingHelp] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(false);
  
  const { status, becomePremium, startTrial } = useAuth();
  const { t, language } = useTranslation();

  // Ref to track previous status to detect trial expiration
  const prevStatusRef = useRef(status);
   useEffect(() => {
    if (prevStatusRef.current === 'trial' && status === 'free') {
        // The trial has just expired, show the upgrade modal
        setIsUpgradeModalOpen(true);
    }
    prevStatusRef.current = status;
  }, [status]);

  // Check session storage for disclaimer visibility on mount
  useEffect(() => {
    try {
        const disclaimerDismissed = sessionStorage.getItem('narciFyDisclaimerDismissed');
        if (disclaimerDismissed !== 'true') {
            setIsDisclaimerVisible(true);
        }
    } catch (error) {
        console.error("Could not read from sessionStorage", error);
        setIsDisclaimerVisible(true);
    }
  }, []);

  const handleDismissDisclaimer = () => {
    try {
        sessionStorage.setItem('narciFyDisclaimerDismissed', 'true');
        setIsDisclaimerVisible(false);
    } catch (error) {
        console.error("Could not write to sessionStorage", error);
        setIsDisclaimerVisible(false); // Still hide it visually
    }
  };


  // Handle successful payment redirect
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_success')) {
      console.log('Payment was successful!');
      becomePremium();
      // Optional: Show a success message to the user
    }
    if (query.get('payment_canceled')) {
      console.log('Payment was canceled.');
      // Optional: Show a message that the payment was canceled
    }
  }, [becomePremium]);


  // Load history from local storage or use placeholders
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        setAnalysisHistory(JSON.parse(storedHistory));
      } else {
        // Use placeholders if nothing is stored
        setAnalysisHistory(placeholderAnalysisHistory);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      setAnalysisHistory(placeholderAnalysisHistory);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    // Don't save the placeholder data
    if (analysisHistory.length > 0 && !analysisHistory[0].id.startsWith('placeholder-')) {
      try {
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
    } else if (analysisHistory.length === 0) {
        // If the user deletes all items, clear the storage
        try {
            localStorage.removeItem('analysisHistory');
        } catch (error) {
            console.error("Failed to clear history from localStorage", error);
        }
    }
  }, [analysisHistory]);
  
  const handleNewAnalysis = (result: AnalysisResult) => {
    setAnalysisHistory(prev => {
      // If the current history is placeholder data, replace it. Otherwise, prepend.
      const isPlaceholder = prev.length > 0 && prev[0].id.startsWith('placeholder-');
      const newHistory = isPlaceholder ? [result] : [result, ...prev];
      // Enforce a maximum history length
      return newHistory.slice(0, MAX_HISTORY_LENGTH);
    });
  };

  const handleDeleteAnalysis = (idToDelete: string) => {
    if (window.confirm(t('patternDetector.confirmDeleteOne'))) {
        setAnalysisHistory(prev => prev.filter(analysis => analysis.id !== idToDelete));
    }
  };

  const handleDeleteAllAnalyses = () => {
    if (window.confirm(t('patternDetector.confirmDeleteAll'))) {
        setAnalysisHistory([]);
    }
  };

  const handleFindHelp = () => {
    setIsFindingHelp(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        try {
          const results = await findLocalHelp(location, language);
          setLocalHelpResults(results);
        } catch (error) {
          console.error("Failed to find local help:", error);
          alert(t('localHelp.errors.findFailed'));
        } finally {
          setIsFindingHelp(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(t('localHelp.errors.locationDenied'));
        setIsFindingHelp(false);
      }
    );
  };
  
  const renderView = () => {
    switch(currentView) {
      case 'home':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
              <AnalysisPanel 
                latestAnalysis={analysisHistory[0] && !analysisHistory[0].id.startsWith('placeholder-') ? analysisHistory[0] : null}
                onNewAnalysis={handleNewAnalysis}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onStartTrial={() => {
                  startTrial();
                  // Optional: close any modals if open, or show a confirmation
                }}
                language={language}
              />
            </div>
            <div className="lg:col-span-1">
              <LocalHelp results={localHelpResults} onFindHelp={handleFindHelp} isLoading={isFindingHelp} />
            </div>
          </div>
        );
      case 'patternDetector':
        return <PatternDetector 
                    analysisHistory={analysisHistory} 
                    onDeleteAnalysis={handleDeleteAnalysis}
                    onDeleteAll={handleDeleteAllAnalyses}
                    onUpgrade={() => setIsUpgradeModalOpen(true)}
                />;
      case 'audios':
        return <PersonalizedAudios onUpgrade={() => setIsUpgradeModalOpen(true)} />;
      case 'recommendations':
         return <AutomaticRecommendations analysisHistory={analysisHistory} onUpgrade={() => setIsUpgradeModalOpen(true)} />;
      case 'sos':
         return <SOSCalmDown />;
      default:
        return <p>Page not found</p>;
    }
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-50 font-sans">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onUpgradeClick={() => setIsUpgradeModalOpen(true)}
      />
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        {isDisclaimerVisible && <Disclaimer onClose={handleDismissDisclaimer} />}
        {renderView()}
        
        <footer className="mt-16 border-t border-slate-800 pt-8 pb-4 text-center px-4">
            <p className="text-xs text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {t('upgrade.clickbankDisclaimer')}
            </p>
        </footer>
      </main>
      <ChatWidget />
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        onStartTrial={() => {
            startTrial();
            setIsUpgradeModalOpen(false);
        }}
      />
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <I18nProvider>
         <AppContent />
      </I18nProvider>
    </AuthProvider>
  );
}


export default App;