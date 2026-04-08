import type { ReactNode } from 'react';
import { AuthContext } from './auth-context';
import { useAuthProvider } from '../hooks/useAuthProvider';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useAuthProvider();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
