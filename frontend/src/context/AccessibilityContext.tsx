import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  isEasyMode: boolean;
  toggleEasyMode: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (val: number) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEasyMode, setIsEasyMode] = useState<boolean>(() => {
    return localStorage.getItem('gc_easy_mode') === 'true';
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('gc_high_contrast') === 'true';
  });

  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1.0);

  useEffect(() => {
    localStorage.setItem('gc_easy_mode', String(isEasyMode));
    if (isEasyMode) {
      document.body.classList.add('accessibility-easy-mode');
    } else {
      document.body.classList.remove('accessibility-easy-mode');
    }
  }, [isEasyMode]);

  useEffect(() => {
    localStorage.setItem('gc_high_contrast', String(isHighContrast));
    if (isHighContrast) {
      document.body.classList.add('accessibility-high-contrast');
    } else {
      document.body.classList.remove('accessibility-high-contrast');
    }
  }, [isHighContrast]);

  const toggleEasyMode = () => setIsEasyMode((prev) => !prev);
  const toggleHighContrast = () => setIsHighContrast((prev) => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        isEasyMode,
        toggleEasyMode,
        isHighContrast,
        toggleHighContrast,
        fontSizeMultiplier,
        setFontSizeMultiplier
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
