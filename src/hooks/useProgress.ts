"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FeedRecord, NapRecord } from "@/lib/types";
import {
  computeAverageInterval,
  computeTotalOz,
  computeLongestNightStretch,
  detectNightMilestones,
  napMeetsTarget,
  type NightMilestone,
} from "@/lib/calculations";
import { getDateString } from "@/lib/date-utils";

interface DayProgress {
  date: string;
  avgInterval: number | null;
  dayFeedCount: number;
  nightFeedCount: number;
  nightTotalOz: number;
  longestNightStretch: number;
  totalDailyOz: number;
  morningNapMet: boolean;
  afternoonNapMet: boolean;
}

interface UseProgressResult {
  days: DayProgress[];
  milestones: NightMilestone[];
  napConsistency: number;
  loading: boolean;
}

export function useProgress(numDays: number = 14): UseProgressResult {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProgress() {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - numDays + 1);
      const startStr = getDateString(startDate);
      const endStr = getDateString(today);

      const dates: string[] = [];
      const d = new Date(startDate);
      while (d <= today) {
        dates.push(getDateString(d));
        d.setDate(d.getDate() + 1);
      }

      const feedsSnap = await getDocs(
        query(
          collection(db, "feeds"),
          where("date", ">=", startStr),
          where("date", "<=", endStr),
          orderBy("date"),
          orderBy("startTime", "asc")
        )
      );
      const allFeeds = feedsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeedRecord[];

      const napsSnap = await getDocs(
        query(
          collection(db, "naps"),
          where("date", ">=", startStr),
          where("date", "<=", endStr),
          orderBy("date"),
          orderBy("startTime", "asc")
        )
      );
      const allNaps = napsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as NapRecord[];

      // Also fetch night feeds (previous night 8PM to 8AM for each date)
      const nightFeedsSnap = await getDocs(
        query(
          collection(db, "feeds"),
          where("type", "==", "night"),
          where("date", ">=", getDateString(new Date(startDate.getTime() - 86400000))),
          where("date", "<=", endStr),
          orderBy("date"),
          orderBy("startTime", "asc")
        )
      );
      const allNightFeeds = nightFeedsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as FeedRecord[];

      if (cancelled) return;

      const result: DayProgress[] = dates.map((dateStr) => {
        const dayFeeds = allFeeds.filter((f) => f.date === dateStr && f.type === "day");
        const nightFeeds = allNightFeeds.filter((f) => {
          // Night feeds for this date: feeds on the previous day after 8PM or on this day before 8AM
          // Simplified: use the date field and type
          return f.date === dateStr && f.type === "night";
        });
        const naps = allNaps.filter((n) => n.date === dateStr);
        const morningNap = naps.find((n) => n.napType === "morning");
        const afternoonNap = naps.find((n) => n.napType === "afternoon");

        return {
          date: dateStr,
          avgInterval: computeAverageInterval(dayFeeds),
          dayFeedCount: dayFeeds.length,
          nightFeedCount: nightFeeds.length,
          nightTotalOz: computeTotalOz(nightFeeds),
          longestNightStretch: computeLongestNightStretch(nightFeeds, dateStr),
          totalDailyOz: computeTotalOz([...dayFeeds, ...nightFeeds]),
          morningNapMet: morningNap ? napMeetsTarget("morning", morningNap.durationMin) : false,
          afternoonNapMet: afternoonNap ? napMeetsTarget("afternoon", afternoonNap.durationMin) : false,
        };
      });

      setDays(result);
      setLoading(false);
    }

    fetchProgress();
    return () => { cancelled = true; };
  }, [numDays]);

  const milestones = detectNightMilestones(
    days.map((d) => ({
      date: d.date,
      feedCount: d.nightFeedCount,
      longestStretch: d.longestNightStretch,
    }))
  );

  const daysWithNaps = days.filter((d) => d.morningNapMet || d.afternoonNapMet);
  const napConsistency = days.length > 0
    ? Math.round((daysWithNaps.filter((d) => d.morningNapMet && d.afternoonNapMet).length / days.length) * 100)
    : 0;

  return { days, milestones, napConsistency, loading };
}
