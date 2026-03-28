"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useSettings } from "@/hooks/useSettings";
import { TARGET_INTERVAL_MIN } from "@/lib/constants";

interface StepOverviewProps {
  days: {
    nightFeedCount: number;
    morningNapMet: boolean;
    afternoonNapMet: boolean;
  }[];
  napConsistency: number;
}

type StepStatus = "active" | "complete" | "upcoming";

function getStepStatus(step: number, intervalGoal: number, recentNightFeeds: number[], napConsistency: number): StepStatus {
  if (step === 1) {
    if (intervalGoal >= TARGET_INTERVAL_MIN) return "complete";
    return "active";
  }
  if (step === 2) {
    const recent = recentNightFeeds.slice(-3);
    if (recent.length >= 3 && recent.every((f) => f === 0)) return "complete";
    if (recentNightFeeds.length > 0) return "active";
    return "upcoming";
  }
  if (step === 3) {
    if (napConsistency >= 80) return "complete";
    return "active";
  }
  return "upcoming";
}

const stepInfo = [
  { num: 1, label: "Feed Interval", desc: "3h → 4h" },
  { num: 2, label: "Night Feeds", desc: "→ 0 feeds" },
  { num: 3, label: "Naps", desc: "Hit targets" },
];

const statusStyles: Record<StepStatus, string> = {
  active: "bg-slate-blue-500",
  complete: "bg-soft-teal-400",
  upcoming: "bg-slate-blue-200",
};

const statusBadge: Record<StepStatus, { variant: "default" | "morning" | "afternoon"; text: string }> = {
  active: { variant: "default", text: "Active" },
  complete: { variant: "morning", text: "Done" },
  upcoming: { variant: "afternoon", text: "Upcoming" },
};

export default function StepOverview({ days, napConsistency }: StepOverviewProps) {
  const { settings } = useSettings();
  const recentNightFeeds = days.map((d) => d.nightFeedCount);

  const statuses = stepInfo.map((s) =>
    getStepStatus(s.num, settings.currentIntervalMin, recentNightFeeds, napConsistency)
  );

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-slate-blue-500">Training Steps</h3>
      <div className="flex gap-2">
        {stepInfo.map((step, i) => {
          const status = statuses[i];
          const badge = statusBadge[status];

          return (
            <motion.div
              key={step.num}
              className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-slate-blue-50 p-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${statusStyles[status]}`}
                animate={status === "active" ? { scale: [1, 1.1, 1] } : {}}
                transition={status === "active" ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
              >
                {step.num}
              </motion.div>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-blue-700">{step.label}</p>
                <p className="text-[10px] text-slate-blue-400">{step.desc}</p>
              </div>
              <Badge variant={badge.variant}>{badge.text}</Badge>
            </motion.div>
          );
        })}
      </div>
      {/* Connector line */}
      <div className="mx-auto mt-2 flex w-2/3 items-center">
        {statuses.map((s, i) => (
          <div key={i} className="flex flex-1 items-center">
            <div className={`h-1 flex-1 rounded-full ${s === "complete" ? "bg-soft-teal-300" : s === "active" ? "bg-slate-blue-300" : "bg-slate-blue-100"}`} />
            {i < statuses.length - 1 && (
              <div className={`h-1 w-2 ${statuses[i + 1] !== "upcoming" ? "bg-slate-blue-300" : "bg-slate-blue-100"}`} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
