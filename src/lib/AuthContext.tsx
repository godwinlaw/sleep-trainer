"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AuthContextType {
  authenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("st-auth");
    if (stored === "1") setAuthenticated(true);
  }, []);

  const login = useCallback((password: string) => {
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem("st-auth", "1");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
    sessionStorage.removeItem("st-auth");
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
