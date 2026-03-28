"use client";

import { motion } from "framer-motion";
import type { NightMilestone } from "@/lib/calculations";

interface MilestoneCardProps {
  milestone: NightMilestone;
  index?: number;
}

const icons: Record<NightMilestone["type"], string> = {
  "first-one-feed": "🌙",
  "first-zero-feed": "⭐",
  "stretch-record": "🏆",
};

export default function MilestoneCard({ milestone, index = 0 }: MilestoneCardProps) {
  return (
    <motion.div
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-card)]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02 }}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {icons[milestone.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-blue-800">{milestone.label}</p>
        <p className="text-xs text-slate-blue-400">{milestone.date}</p>
      </div>
    </motion.div>
  );
}
