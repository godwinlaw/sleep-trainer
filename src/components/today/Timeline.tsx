"use client";

import { useMemo } from "react";
import type { FeedRecord, NapRecord } from "@/lib/types";
import { fromTimestamp } from "@/lib/date-utils";
import { DAY_START_HOUR, NIGHT_START_HOUR } from "@/lib/constants";

interface TimelineProps {
  dayFeeds: FeedRecord[];
  naps: NapRecord[];
  nextTargetTime?: Date | null;
}

const TOTAL_HOURS = NIGHT_START_HOUR - DAY_START_HOUR; // 12 hours

function hourToX(hour: number): number {
  return ((hour - DAY_START_HOUR) / TOTAL_HOURS) * 100;
}

export default function Timeline({ dayFeeds, naps, nextTargetTime }: TimelineProps) {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const nowX = hourToX(Math.min(Math.max(currentHour, DAY_START_HOUR), NIGHT_START_HOUR));
  const isInRange = currentHour >= DAY_START_HOUR && currentHour < NIGHT_START_HOUR;

  const feedDots = useMemo(
    () =>
      dayFeeds.map((f) => {
        const d = fromTimestamp(f.startTime);
        const h = d.getHours() + d.getMinutes() / 60;
        return { id: f.id, x: hourToX(h), feedNumber: f.feedNumber };
      }),
    [dayFeeds]
  );

  const napBars = useMemo(
    () =>
      naps.map((n) => {
        const d = fromTimestamp(n.startTime);
        const startH = d.getHours() + d.getMinutes() / 60;
        const endH = startH + n.durationMin / 60;
        return {
          id: n.id,
          x1: hourToX(Math.max(startH, DAY_START_HOUR)),
          x2: hourToX(Math.min(endH, NIGHT_START_HOUR)),
          napType: n.napType,
        };
      }),
    [naps]
  );

  const targetX = useMemo(() => {
    if (!nextTargetTime) return null;
    const h = nextTargetTime.getHours() + nextTargetTime.getMinutes() / 60;
    if (h < DAY_START_HOUR || h >= NIGHT_START_HOUR) return null;
    return hourToX(h);
  }, [nextTargetTime]);

  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START_HOUR + i);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-sm font-medium text-slate-blue-500">Today&apos;s Timeline</h3>
      <div className="relative" role="img" aria-label="Timeline showing today's feeds and naps from 8 AM to 8 PM">
        <svg viewBox="0 0 100 24" className="w-full" preserveAspectRatio="none">
          {/* Background track */}
          <rect x="0" y="10" width="100" height="4" rx="2" fill="var(--color-slate-blue-100)" />

          {/* Nap bars */}
          {napBars.map((bar) => (
            <rect
              key={bar.id}
              x={bar.x1}
              y="9"
              width={Math.max(bar.x2 - bar.x1, 0.5)}
              height="6"
              rx="3"
              fill={bar.napType === "morning" ? "var(--color-soft-teal-200)" : "var(--color-slate-blue-200)"}
            />
          ))}

          {/* Target marker */}
          {targetX !== null && (
            <line x1={targetX} y1="6" x2={targetX} y2="18" stroke="var(--color-warm-cream-500)" strokeWidth="0.5" strokeDasharray="1,1" />
          )}

          {/* Feed dots */}
          {feedDots.map((dot) => (
            <circle key={dot.id} cx={dot.x} cy="12" r="2.5" fill="var(--color-slate-blue-500)" />
          ))}

          {/* Current time indicator */}
          {isInRange && (
            <>
              <line x1={nowX} y1="4" x2={nowX} y2="20" stroke="var(--color-muted-rose-400)" strokeWidth="0.4" />
              <circle cx={nowX} cy="4" r="1.2" fill="var(--color-muted-rose-400)" />
            </>
          )}
        </svg>

        {/* Hour labels */}
        <div className="mt-1 flex justify-between">
          {hours.filter((_, i) => i % 2 === 0).map((h) => (
            <span key={h} className="text-[9px] text-slate-blue-400">
              {h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
