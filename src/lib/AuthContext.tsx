"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AuthContextType {
  authenticated: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Firebase auth failed:", e);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase signOut failed:", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
