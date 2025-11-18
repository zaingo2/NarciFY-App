import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

type UserStatus = 'free' | 'trial' | 'premium';

interface AuthContextType {
  status: UserStatus;
  isLoading: boolean;
  trialEndDate: string | null;
  startTrial: () => void;
  becomePremium: () => void;
  becomeFree: () => void;
  isDevMode: boolean;
  toggleDevMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<UserStatus>('free');
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    try {
      const storedPremiumStatus = localStorage.getItem('narciFyPremiumStatus');
      const storedTrialEndDate = localStorage.getItem('narciFyTrialEndDate');
      const devModeEnabled = sessionStorage.getItem('narciFyDevMode') === 'true';
      setIsDevMode(devModeEnabled);

      if (storedPremiumStatus === 'true') {
        setStatus('premium');
        setTrialEndDate(null); // Ensure no lingering trial date
      } else if (storedTrialEndDate) {
        const endDate = new Date(storedTrialEndDate).getTime();
        if (endDate > Date.now()) {
          setStatus('trial');
          setTrialEndDate(storedTrialEndDate);
        } else {
          // Trial has expired
          setStatus('free');
          localStorage.removeItem('narciFyTrialEndDate');
          setTrialEndDate(null);
        }
      } else {
        setStatus('free');
      }
    } catch (error) {
      console.error("Failed to read user status from localStorage", error);
      setStatus('free');
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const startTrial = useCallback(() => {
    try {
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const endDateString = endDate.toISOString();
        localStorage.setItem('narciFyTrialEndDate', endDateString);
        setTrialEndDate(endDateString);
        setStatus('trial');
    } catch (error) {
        console.error("Failed to save trial data to localStorage", error);
    }
  }, []);
  
  const becomePremium = useCallback(() => {
    try {
        localStorage.setItem('narciFyPremiumStatus', 'true');
        // Clean up any old trial data
        localStorage.removeItem('narciFyTrialEndDate');
        setStatus('premium');
        setTrialEndDate(null);
    } catch (error) {
         console.error("Failed to save premium status to localStorage", error);
    }
  }, []);

  const becomeFree = useCallback(() => {
    try {
        localStorage.removeItem('narciFyPremiumStatus');
        localStorage.removeItem('narciFyTrialEndDate');
        setStatus('free');
        setTrialEndDate(null);
    } catch (error) {
        console.error("Failed to remove user status from localStorage", error);
    }
  }, []);

  const toggleDevMode = useCallback(() => {
    setIsDevMode(prev => {
        const newMode = !prev;
        try {
            if (newMode) {
                sessionStorage.setItem('narciFyDevMode', 'true');
            } else {
                sessionStorage.removeItem('narciFyDevMode');
            }
        } catch (error) {
            console.error("Failed to save dev mode to sessionStorage", error);
        }
        return newMode;
    });
  }, []);


  const value = {
    status,
    isLoading,
    trialEndDate,
    startTrial,
    becomePremium,
    becomeFree,
    isDevMode,
    toggleDevMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};