"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Button from "@/components/ui/Button";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, login } = useAuth();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-slate-blue-400">Loading...</div>
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

  const handleGoogleSignIn = async () => {
    setError("");
    setSigningIn(true);
    try {
      await login();
      // On success, state changes in AuthContext and it will re-render returning children
    } catch (e: any) {
      if (e.code !== "auth/popup-closed-by-user") {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-blue-700">Sleep Trainer</h1>
          <p className="mt-1 text-sm text-slate-blue-400">Sign in to sync your data securely.</p>
        </div>

        {error && <p className="text-center text-sm text-muted-rose-500">{error}</p>}

        <Button 
          onClick={handleGoogleSignIn} 
          loading={signingIn} 
          className="flex w-full items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
