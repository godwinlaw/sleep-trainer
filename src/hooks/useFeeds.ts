"use client";

import { useEffect, useState } from "react";
import type { FeedRecord } from "@/lib/types";
import { subscribeFeedsForDate, subscribeNightFeeds, assignFeedNumbers } from "@/lib/feeds";

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
  const [loadingDay, setLoadingDay] = useState(true);
  const [loadingNight, setLoadingNight] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset loading state for new subscription — valid for external system sync
    setLoadingDay(true);
    setLoadingNight(true);
    setError(null);

    const unsubDay = subscribeFeedsForDate(dateStr, (feeds) => {
      const day = feeds.filter((f) => f.type === "day");
      setDayFeeds(assignFeedNumbers(day));
      setLoadingDay(false);
    });

    const unsubNight = subscribeNightFeeds(dateStr, (feeds) => {
      setNightFeeds(feeds);
      setLoadingNight(false);
    });

    return () => {
      unsubDay();
      unsubNight();
    };
  }, [dateStr]);

  return {
    dayFeeds,
    nightFeeds,
    allFeeds: [...nightFeeds, ...dayFeeds],
    loading: loadingDay || loadingNight,
    error,
  };
}
