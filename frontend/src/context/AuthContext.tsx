import React, { createContext, useState, type ReactNode } from 'react';

// Define the shape of the context data
interface AuthContextType {
  // Replace 'any' with your actual user type later
  user: any | null; 
  // Add login/logout functions here later
  // login: (userData: any) => void;
  // logout: () => void;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);

  // Add login/logout logic here
  
  const value = {
    user,
    // login,
    // logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};