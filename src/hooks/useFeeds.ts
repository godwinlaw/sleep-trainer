"use client";

import { useEffect, useState, useMemo } from "react";
import type { FeedRecord } from "@/lib/types";
import { subscribeDayWindow, assignFeedNumbers } from "@/lib/feeds";

interface UseFeedsResult {
  dayFeeds: FeedRecord[];
  nightFeeds: FeedRecord[];
  allFeeds: FeedRecord[];
  loading: boolean;
  error: string | null;
}

export function useFeeds(dateStr: string): UseFeedsResult {
  const [dayFeeds, setDayFeeds] = useState<FeedRecord[]>([]);
  const [nightFeeds, setNightFeeds] = useState<FeedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = subscribeDayWindow(dateStr, (day, night) => {
      setDayFeeds(assignFeedNumbers(day));
      setNightFeeds(night);
      setLoading(false);
    });

    return () => unsub();
  }, [dateStr]);

  const allFeeds = useMemo(() => [...nightFeeds, ...dayFeeds], [nightFeeds, dayFeeds]);

  return { dayFeeds, nightFeeds, allFeeds, loading, error };
}
