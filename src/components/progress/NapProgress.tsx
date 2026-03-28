"use client";

import { useMemo } from "react";
import Card from "@/components/ui/Card";
import TrendChart from "./TrendChart";
import { MORNING_NAP_TARGET_MIN, AFTERNOON_NAP_TARGET_MIN } from "@/lib/constants";

interface NapDay {
  date: string;
  morningNapMet: boolean;
  afternoonNapMet: boolean;
}

interface NapProgressProps {
  days: NapDay[];
  napConsistency: number;
}

export default function NapProgress({ days, napConsistency }: NapProgressProps) {
  // Show last 7 days for weekly grid
  const weekDays = days.slice(-7);

  const barData = useMemo(
    () =>
      days.map((d) => {
        let score = 0;
        if (d.morningNapMet) score += 1;
        if (d.afternoonNapMet) score += 1;
        return { label: d.date.slice(5), value: score };
      }),
    [days]
  );

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-slate-blue-500">
        Step 3: Naps
      </h3>

      {/* Consistency stat */}
      <div className="mb-4">
        <p className="text-2xl font-semibold text-slate-blue-800">{napConsistency}%</p>
        <p className="text-xs text-slate-blue-400">weekly consistency (both naps hit targets)</p>
      </div>

      {/* 7-day grid */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-slate-blue-500">Last 7 Days</p>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((d) => {
            const both = d.morningNapMet && d.afternoonNapMet;
            const one = d.morningNapMet || d.afternoonNapMet;
            const dayLabel = new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "narrow" });

            return (
              <div key={d.date} className="flex flex-col items-center gap-1">
                <div
                  className={`h-8 w-full rounded-lg ${
                    both
                      ? "bg-soft-teal-300"
                      : one
                      ? "bg-warm-cream-300"
                      : "bg-slate-blue-100"
                  }`}
                  title={`${d.date}: ${both ? "Both targets met" : one ? "One target met" : "Targets not met"}`}
                  role="img"
                  aria-label={`${dayLabel}: ${both ? "Both nap targets met" : one ? "One nap target met" : "Nap targets not met"}`}
                />
                <span className="text-[9px] text-slate-blue-400">{dayLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-3 text-[9px] text-slate-blue-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-soft-teal-300" /> Both
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-warm-cream-300" /> One
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-slate-blue-100" /> None
          </span>
        </div>
      </div>

      {/* Trend */}
      <p className="mb-1 text-xs font-medium text-slate-blue-500">Nap Score (0–2)</p>
      <TrendChart
        data={barData}
        targetValue={2}
        targetLabel="Goal: 2/2"
        color="var(--color-soft-teal-500)"
        height={80}
      />

      {/* Targets reminder */}
      <div className="mt-3 flex gap-4 text-xs text-slate-blue-400">
        <span>AM target: {MORNING_NAP_TARGET_MIN}m</span>
        <span>PM target: {AFTERNOON_NAP_TARGET_MIN}m</span>
      </div>
    </Card>
  );
}
