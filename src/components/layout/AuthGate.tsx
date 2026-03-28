"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { authenticated, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // TODO: re-enable auth after testing
  return <>{children}</>;

  // eslint-disable-next-line no-unreachable
  if (authenticated) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(password)) {
      setError("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-blue-700">Sleep Trainer</h1>
          <p className="mt-1 text-sm text-slate-blue-400">Enter password to continue</p>
        </div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          error={error}
          autoFocus
        />
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}
