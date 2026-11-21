'use client';
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import type { DiscoverySession } from '@/lib/discovery';
const DiscoveryContext = createContext<{
  session: DiscoverySession | null;
  setSession: Dispatch<SetStateAction<DiscoverySession | null>>;
}>({ session: null, setSession: () => {} });
export const DiscoveryProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<DiscoverySession | null>(null);
  return (
    <DiscoveryContext.Provider value={{ session, setSession }}>
      {children}
    </DiscoveryContext.Provider>
  );
};
export const useDiscovery = () => useContext(DiscoveryContext);
