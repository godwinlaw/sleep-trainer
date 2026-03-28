"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import StepOverview from "@/components/progress/StepOverview";
import IntervalProgress from "@/components/progress/IntervalProgress";
import NightProgress from "@/components/progress/NightProgress";
import NapProgress from "@/components/progress/NapProgress";
import Celebration from "@/components/progress/Celebration";
import { useProgress } from "@/hooks/useProgress";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProgressPage() {
  const { days, milestones, napConsistency, loading } = useProgress(14);
  const [celebrationMsg, setCelebrationMsg] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const prevMilestoneCount = useRef(0);

  useEffect(() => {
    if (milestones.length > prevMilestoneCount.current && prevMilestoneCount.current > 0) {
      const latest = milestones[milestones.length - 1];
      setCelebrationMsg(latest.label);
      setShowCelebration(true);
    }
    prevMilestoneCount.current = milestones.length;
  }, [milestones]);

  if (loading) {
    return (
      <>
        <Header title="Progress" />
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-slate-blue-400">Loading progress...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Progress" />
      <div className="mx-auto max-w-lg space-y-4 p-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StepOverview days={days} napConsistency={napConsistency} />
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <IntervalProgress days={days} />
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <NightProgress days={days} milestones={milestones} />
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          <NapProgress days={days} napConsistency={napConsistency} />
        </motion.div>

        {days.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-white p-6 text-center shadow-[var(--shadow-card)]"
          >
            <p className="text-slate-blue-400">No data yet</p>
            <p className="mt-1 text-sm text-slate-blue-300">
              Start logging feeds and naps to see your progress
            </p>
          </motion.div>
        )}
      </div>

      <Celebration show={showCelebration} message={celebrationMsg} />
    </>
  );
}
