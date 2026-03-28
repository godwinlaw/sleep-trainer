"use client";

import { useEffect, useState } from "react";
import type { NapRecord } from "@/lib/types";
import { subscribeNapsForDate } from "@/lib/naps";

interface UseNapsResult {
  naps: NapRecord[];
  morningNap: NapRecord | null;
  afternoonNap: NapRecord | null;
  loading: boolean;
  error: string | null;
}

export function useNaps(dateStr: string): UseNapsResult {
  const [naps, setNaps] = useState<NapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = subscribeNapsForDate(dateStr, (result) => {
      setNaps(result);
      setLoading(false);
    });

    return () => unsub();
  }, [dateStr]);

  const morningNap = naps.find((n) => n.napType === "morning") ?? null;
  const afternoonNap = naps.find((n) => n.napType === "afternoon") ?? null;

  return { naps, morningNap, afternoonNap, loading, error };
}
