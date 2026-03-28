"use client";

import { useEffect, useState, useCallback } from "react";
import type { AppSettings } from "@/lib/types";
import { subscribeSettings, updateSettings as updateSettingsDb, defaultSettings } from "@/lib/settings";

interface UseSettingsResult {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeSettings((s) => {
      setSettings(s);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const update = useCallback(async (updates: Partial<AppSettings>) => {
    await updateSettingsDb(updates);
  }, []);

  return { settings, updateSettings: update, loading };
}
