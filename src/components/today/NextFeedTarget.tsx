"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import type { FeedRecord } from "@/lib/types";
import { fromTimestamp, formatTime, formatDuration } from "@/lib/date-utils";

interface NextFeedTargetProps {
  dayFeeds: FeedRecord[];
  intervalGoalMin: number;
}

export default function NextFeedTarget({ dayFeeds, intervalGoalMin }: NextFeedTargetProps) {
  const { nextTime, lastFeedTime } = useMemo(() => {
    if (dayFeeds.length === 0) return { nextTime: null, lastFeedTime: null };
    const lastFeed = dayFeeds[dayFeeds.length - 1];
    const lastTime = fromTimestamp(lastFeed.startTime);
    const next = new Date(lastTime.getTime() + intervalGoalMin * 60000);
    return { nextTime: next, lastFeedTime: lastTime };
  }, [dayFeeds, intervalGoalMin]);

  if (!nextTime || dayFeeds.length >= 4) return null;

  const now = Date.now();
  const minutesUntil = Math.round((nextTime.getTime() - now) / 60000);
  const isUrgent = minutesUntil <= 30 && minutesUntil > 0;
  const isPast = minutesUntil <= 0;

  return (
    <Card className={isUrgent ? "border-2 border-warm-cream-400" : ""}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-blue-500">Next Feed Target</p>
          <p className="text-lg font-semibold text-slate-blue-800">{formatTime(nextTime)}</p>
          {lastFeedTime && (
            <p className="text-xs text-slate-blue-400">
              Last: {formatTime(lastFeedTime)} · Goal: {formatDuration(intervalGoalMin)}
            </p>
          )}
        </div>
        <div className="text-right">
          {isPast ? (
            <motion.span
              className="text-sm font-medium text-muted-rose-500"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Overdue
            </motion.span>
          ) : isUrgent ? (
            <motion.span
              className="text-sm font-medium text-warm-cream-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {minutesUntil}m away
            </motion.span>
          ) : (
            <span className="text-sm text-slate-blue-500">{formatDuration(minutesUntil)}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
