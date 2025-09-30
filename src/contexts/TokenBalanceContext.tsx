import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TokenBalanceContextType {
  tokenBalance: number;
  setTokenBalance: React.Dispatch<React.SetStateAction<number>>;
  isLoadingTokens: boolean;
  setIsLoadingTokens: React.Dispatch<React.SetStateAction<boolean>>;
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(undefined);

export const TokenBalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(false);

  return (
    <TokenBalanceContext.Provider value={{ 
      tokenBalance, 
      setTokenBalance, 
      isLoadingTokens, 
      setIsLoadingTokens 
    }}>
      {children}
    </TokenBalanceContext.Provider>
  );
};

export const useTokenBalance = (): TokenBalanceContextType => {
  const context = useContext(TokenBalanceContext);
  if (context === undefined) {
    throw new Error('useTokenBalance must be used within a TokenBalanceProvider');
  }
  return context;
};
