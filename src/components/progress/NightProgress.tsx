"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import TrendChart from "./TrendChart";
import MilestoneCard from "./MilestoneCard";
import type { NightMilestone } from "@/lib/calculations";
import { formatDuration } from "@/lib/date-utils";
import { NIGHT_TOTAL_MIN } from "@/lib/constants";

interface NightProgressProps {
  days: {
    date: string;
    nightFeedCount: number;
    nightTotalOz: number;
    longestNightStretch: number;
  }[];
  milestones: NightMilestone[];
}

export default function NightProgress({ days, milestones }: NightProgressProps) {
  const latest = days.length > 0 ? days[days.length - 1] : null;

  const feedCountData = useMemo(
    () => days.map((d) => ({ label: d.date.slice(5), value: d.nightFeedCount })),
    [days]
  );

  const nightOzData = useMemo(
    () => days.map((d) => ({ label: d.date.slice(5), value: d.nightTotalOz })),
    [days]
  );

  const stretchData = useMemo(
    () => days.map((d) => ({ label: d.date.slice(5), value: d.longestNightStretch })),
    [days]
  );

  return (
    <div className="space-y-3">
      <Card>
        <h3 className="mb-3 text-sm font-medium text-slate-blue-500">
          Step 2: Night Feeds
        </h3>

        {/* Current night stats */}
        {latest && (
          <div className="mb-4 flex gap-4">
            <div>
              <p className="text-2xl font-semibold text-slate-blue-800">{latest.nightFeedCount}</p>
              <p className="text-xs text-slate-blue-400">feeds</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-blue-800">{latest.nightTotalOz}</p>
              <p className="text-xs text-slate-blue-400">oz</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-blue-800">
                {formatDuration(latest.longestNightStretch)}
              </p>
              <p className="text-xs text-slate-blue-400">longest</p>
            </div>
          </div>
        )}

        {/* Feed count trend */}
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium text-slate-blue-500">Night feeds → 0</p>
          <TrendChart
            data={feedCountData}
            targetValue={0}
            targetLabel="Goal: 0"
            color="var(--color-muted-rose-400)"
            height={80}
          />
        </div>

        {/* Night oz trend */}
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium text-slate-blue-500">Night oz → 0</p>
          <TrendChart
            data={nightOzData}
            targetValue={0}
            targetLabel="Goal: 0 oz"
            unit=" oz"
            color="var(--color-warm-cream-600)"
            height={80}
          />
        </div>

        {/* Longest stretch trend */}
        <div>
          <p className="mb-1 text-xs font-medium text-slate-blue-500">
            Longest stretch → {formatDuration(NIGHT_TOTAL_MIN)}
          </p>
          <TrendChart
            data={stretchData}
            targetValue={NIGHT_TOTAL_MIN}
            targetLabel={`Goal: ${formatDuration(NIGHT_TOTAL_MIN)}`}
            unit=" min"
            color="var(--color-soft-teal-500)"
            height={80}
          />
        </div>
      </Card>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-slate-blue-500">Milestones</h4>
          {milestones.map((m, i) => (
            <MilestoneCard key={`${m.type}-${m.date}`} milestone={m} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
