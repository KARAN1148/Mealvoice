import React, { createContext, useContext, useState } from 'react';

interface IncomingCallData {
  phoneNumber: string;
  customerName?: string;
  isExisting: boolean;
}

interface DemoModeContextType {
  activeCall: IncomingCallData | null;
  triggerIncomingCall: (phone?: string, name?: string) => void;
  endIncomingCall: () => void;
  lastNotification: string | null;
  showNotification: (msg: string) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCall, setActiveCall] = useState<IncomingCallData | null>(null);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const triggerIncomingCall = (phone = '+91 98765 43210', name = 'Ramesh Kumar') => {
    setActiveCall({
      phoneNumber: phone,
      customerName: name,
      isExisting: true
    });
  };

  const endIncomingCall = () => setActiveCall(null);

  const showNotification = (msg: string) => {
    setLastNotification(msg);
    setTimeout(() => {
      setLastNotification(null);
    }, 6000);
  };

  return (
    <DemoModeContext.Provider
      value={{
        activeCall,
        triggerIncomingCall,
        endIncomingCall,
        lastNotification,
        showNotification
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
};
