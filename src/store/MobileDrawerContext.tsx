import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface MobileDrawerContextValue {
  drawerContent: ReactNode | null;
  setDrawerContent: (content: ReactNode | null) => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const MobileDrawerContext = createContext<MobileDrawerContextValue>({
  drawerContent: null,
  setDrawerContent: () => {},
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function MobileDrawerProvider({ children }: { children: ReactNode }) {
  const [drawerContent, setDrawerContent] = useState<ReactNode | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  return (
    <MobileDrawerContext.Provider value={{ drawerContent, setDrawerContent, isOpen, openDrawer, closeDrawer }}>
      {children}
    </MobileDrawerContext.Provider>
  );
}

export function useMobileDrawer() {
  return useContext(MobileDrawerContext);
}
