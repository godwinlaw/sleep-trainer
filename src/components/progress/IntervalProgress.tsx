"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TrendChart from "./TrendChart";
import { useSettings } from "@/hooks/useSettings";
import { shouldSuggestIntervalAdvance } from "@/lib/calculations";
import { formatDuration } from "@/lib/date-utils";
import {
  INITIAL_INTERVAL_MIN,
  TARGET_INTERVAL_MIN,
  INTERVAL_STEP_MIN,
} from "@/lib/constants";

interface IntervalProgressProps {
  days: { date: string; avgInterval: number | null }[];
}

const STEPS = [180, 195, 210, 225, 240];

export default function IntervalProgress({ days }: IntervalProgressProps) {
  const { settings, updateSettings } = useSettings();
  const currentGoal = settings.currentIntervalMin;

  const todayAvg = days.length > 0 ? days[days.length - 1]?.avgInterval : null;

  const recentAvgs = useMemo(
    () => days.map((d) => d.avgInterval).filter((v): v is number => v !== null),
    [days]
  );

  const suggestAdvance = useMemo(
    () =>
      currentGoal < TARGET_INTERVAL_MIN &&
      shouldSuggestIntervalAdvance(recentAvgs, currentGoal),
    [recentAvgs, currentGoal]
  );

  const chartData = useMemo(
    () =>
      days
        .filter((d) => d.avgInterval !== null)
        .map((d) => ({
          label: d.date.slice(5), // MM-DD
          value: d.avgInterval!,
        })),
    [days]
  );

  const canAdvance = currentGoal < TARGET_INTERVAL_MIN;
  const canRevert = currentGoal > INITIAL_INTERVAL_MIN;

  const advance = () => {
    if (canAdvance) {
      updateSettings({ currentIntervalMin: currentGoal + INTERVAL_STEP_MIN });
    }
  };

  const revert = () => {
    if (canRevert) {
      updateSettings({ currentIntervalMin: currentGoal - INTERVAL_STEP_MIN });
    }
  };

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-slate-blue-500">
        Step 1: Feed Interval
      </h3>

      {/* Step indicator */}
      <div className="mb-4 flex items-center gap-1">
        {STEPS.map((step) => {
          const isActive = step === currentGoal;
          const isComplete = step < currentGoal;
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                className={`h-2 w-full rounded-full ${
                  isComplete
                    ? "bg-soft-teal-400"
                    : isActive
                    ? "bg-slate-blue-500"
                    : "bg-slate-blue-100"
                }`}
                initial={false}
                animate={{
                  scale: isActive ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              />
              <span
                className={`text-[9px] ${
                  isActive ? "font-semibold text-slate-blue-700" : "text-slate-blue-400"
                }`}
              >
                {formatDuration(step)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current status */}
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-xs text-slate-blue-400">Current goal</p>
          <p className="text-xl font-semibold text-slate-blue-800">
            {formatDuration(currentGoal)}
          </p>
        </div>
        {todayAvg !== null && (
          <div className="text-right">
            <p className="text-xs text-slate-blue-400">Today&apos;s avg</p>
            <p className="text-xl font-semibold text-slate-blue-800">
              {formatDuration(Math.round(todayAvg))}
            </p>
          </div>
        )}
      </div>

      {/* Suggest advance banner */}
      {suggestAdvance && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-3 rounded-xl bg-soft-teal-50 px-3 py-2 text-sm text-soft-teal-700"
        >
          Great consistency! Ready to advance to{" "}
          <strong>{formatDuration(currentGoal + INTERVAL_STEP_MIN)}</strong>?
        </motion.div>
      )}

      {/* Trend chart */}
      <TrendChart
        data={chartData}
        targetValue={currentGoal}
        targetLabel={`Goal: ${formatDuration(currentGoal)}`}
        unit=" min"
        color="var(--color-slate-blue-500)"
        height={100}
      />

      {/* Adjust buttons */}
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" onClick={revert} disabled={!canRevert} className="flex-1 text-xs">
          - 15 min
        </Button>
        <Button variant="secondary" onClick={advance} disabled={!canAdvance} className="flex-1 text-xs">
          + 15 min
        </Button>
      </div>
    </Card>
  );
}
