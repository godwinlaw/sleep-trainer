"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import type { NapRecord } from "@/lib/types";
import { fromTimestamp, formatTime, formatDuration } from "@/lib/date-utils";
import { MORNING_NAP_TARGET_MIN, AFTERNOON_NAP_TARGET_MIN } from "@/lib/constants";

interface NapCardProps {
  nap: NapRecord;
  index?: number;
  onClick?: () => void;
}

export default function NapCard({ nap, index = 0, onClick }: NapCardProps) {
  const time = formatTime(fromTimestamp(nap.startTime));
  const target = nap.napType === "morning" ? MORNING_NAP_TARGET_MIN : AFTERNOON_NAP_TARGET_MIN;
  const met = nap.durationMin >= target;

  return (
    <motion.div
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={{ y: -1 }}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${
        met ? "bg-soft-teal-100 text-soft-teal-700" : "bg-warm-cream-200 text-warm-cream-700"
      }`}>
        {nap.napType === "morning" ? "AM" : "PM"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{time}</span>
          <Badge variant={nap.napType === "morning" ? "morning" : "afternoon"}>
            {nap.napType}
          </Badge>
        </div>
        <p className="text-xs text-slate-blue-500">
          {formatDuration(nap.durationMin)} / {formatDuration(target)} target
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-blue-300" aria-hidden="true">
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}
