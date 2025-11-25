
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const DAILY_LIMIT = 5;
const STORAGE_KEY_COUNT = 'narciFy_daily_usage_count';
const STORAGE_KEY_DATE = 'narciFy_daily_usage_date';

interface UsageContextType {
  creditsLeft: number;
  dailyLimit: number;
  consumeCredit: () => boolean; // Returns true if allowed, false if limit reached
  isLimitReached: boolean;
  showLimitModal: boolean;
  closeLimitModal: () => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const [count, setCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load usage from local storage on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
    const storedCount = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || '0');

    if (storedDate !== today) {
      // New day, reset
      setCount(0);
      localStorage.setItem(STORAGE_KEY_DATE, today);
      localStorage.setItem(STORAGE_KEY_COUNT, '0');
    } else {
      setCount(storedCount);
    }
  }, []);

  const consumeCredit = (): boolean => {
    // Premium users have unlimited credits
    if (status === 'premium') return true;

    if (count >= DAILY_LIMIT) {
      setShowLimitModal(true);
      return false;
    }

    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());
    localStorage.setItem(STORAGE_KEY_DATE, new Date().toDateString());
    
    return true;
  };

  const closeLimitModal = () => setShowLimitModal(false);

  const creditsLeft = Math.max(0, DAILY_LIMIT - count);
  const isLimitReached = status !== 'premium' && count >= DAILY_LIMIT;

  return (
    <UsageContext.Provider value={{ 
      creditsLeft: status === 'premium' ? 999 : creditsLeft, 
      dailyLimit: DAILY_LIMIT, 
      consumeCredit, 
      isLimitReached,
      showLimitModal,
      closeLimitModal
    }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
