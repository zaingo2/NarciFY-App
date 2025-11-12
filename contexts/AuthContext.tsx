import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isPremium: boolean;
  isLoading: boolean;
  becomePremium: () => void;
  becomeFree: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedStatus = localStorage.getItem('narciFyPremiumStatus');
      if (storedStatus) {
        setIsPremium(JSON.parse(storedStatus));
      }
    } catch (error) {
      console.error("Failed to read premium status from localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const becomePremium = () => {
    // In a real app, this would be the result of a successful payment callback
    // which would give you a token or confirmation.
    try {
        localStorage.setItem('narciFyPremiumStatus', 'true');
        setIsPremium(true);
    } catch (error) {
         console.error("Failed to save premium status to localStorage", error);
    }
  };

  const becomeFree = () => {
    try {
        localStorage.removeItem('narciFyPremiumStatus');
        setIsPremium(false);
    } catch (error) {
        console.error("Failed to remove premium status from localStorage", error);
    }
  };


  const value = {
    isPremium,
    isLoading,
    becomePremium,
    becomeFree,
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
