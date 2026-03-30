import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModeContextType {
  isLiveMarket: boolean;
  toggleMode: () => void;
  accentColor: string;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveMarket, setIsLiveMarket] = useState(() => {
    return localStorage.getItem('isLiveMarket') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isLiveMarket', String(isLiveMarket));
  }, [isLiveMarket]);

  const toggleMode = () => setIsLiveMarket(prev => !prev);
  
  const accentColor = isLiveMarket ? '#00a859' : '#e11d48'; // green vs red-600

  return (
    <ModeContext.Provider value={{ isLiveMarket, toggleMode, accentColor }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
