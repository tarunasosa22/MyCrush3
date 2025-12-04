// File: screenNavigationContext.tsx

import { createContext, useContext, useState } from 'react';

type ScreenNavigationContextType = {
  currentScreen: number;
  setCurrentScreen: (id: number) => void;
};

const ScreenNavigationContext = createContext<ScreenNavigationContextType>({
  currentScreen: 1,
  setCurrentScreen: () => {},
});

export const ScreenNavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentScreen, setCurrentScreen] = useState(1);

  return (
    <ScreenNavigationContext.Provider
      value={{ currentScreen, setCurrentScreen }}
    >
      {children}
    </ScreenNavigationContext.Provider>
  );
};

export const useScreenNavigation = () => useContext(ScreenNavigationContext);
