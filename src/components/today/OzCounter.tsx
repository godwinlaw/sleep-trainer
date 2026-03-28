"use client";

import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { getOzWarningLevel } from "@/lib/calculations";
import { TARGET_DAY_FEEDS } from "@/lib/constants";

interface OzCounterProps {
  totalOz: number;
  dailyMinimum: number;
  dayFeedCount: number;
}

export default function OzCounter({ totalOz, dailyMinimum, dayFeedCount }: OzCounterProps) {
  const level = getOzWarningLevel(totalOz, dailyMinimum);
  const variant = level === "ok" ? "success" : level === "caution" ? "caution" : "danger";
  const allFeedsLogged = dayFeedCount >= TARGET_DAY_FEEDS;
  const showWarning = allFeedsLogged && totalOz < dailyMinimum;

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-slate-blue-500">Daily Intake</h3>
        <span className="text-lg font-semibold text-slate-blue-800" role="meter" aria-valuenow={totalOz} aria-valuemin={0} aria-valuemax={dailyMinimum} aria-label="Daily ounce intake">
          {totalOz} / {dailyMinimum} oz
        </span>
      </div>
      <ProgressBar value={totalOz} max={dailyMinimum} variant={variant} className="mt-2" />

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-xl bg-muted-rose-50 px-3 py-2 text-sm text-muted-rose-700"
            role="alert"
          >
            Total intake is {totalOz} oz — below the {dailyMinimum} oz daily minimum.
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
