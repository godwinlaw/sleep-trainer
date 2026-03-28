"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import type { FeedRecord } from "@/lib/types";
import { fromTimestamp, formatTime } from "@/lib/date-utils";

interface FeedCardProps {
  feed: FeedRecord;
  index?: number;
  onClick?: () => void;
}

export default function FeedCard({ feed, index = 0, onClick }: FeedCardProps) {
  const time = formatTime(fromTimestamp(feed.startTime));

  return (
    <motion.div
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -1 }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-blue-50 text-sm font-semibold text-slate-blue-600">
        {feed.type === "day" && feed.feedNumber ? `#${feed.feedNumber}` : "N"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{time}</span>
          <Badge variant={feed.type === "day" ? "day" : "night"}>
            {feed.type}
          </Badge>
          <Badge variant="default">{feed.method}</Badge>
        </div>
        <p className="text-xs text-slate-blue-500">
          {feed.amountOz} oz
          {feed.durationMin ? ` · ${feed.durationMin} min` : ""}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-blue-300" aria-hidden="true">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}
