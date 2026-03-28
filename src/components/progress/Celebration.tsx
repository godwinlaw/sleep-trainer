"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CelebrationProps {
  show: boolean;
  message?: string;
}

const PARTICLE_COUNT = 24;
const COLORS = [
  "var(--color-soft-teal-300)",
  "var(--color-warm-cream-400)",
  "var(--color-slate-blue-300)",
  "var(--color-muted-rose-300)",
  "var(--color-soft-teal-500)",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function Celebration({ show, message }: CelebrationProps) {
  const [visible, setVisible] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      color: COLORS[i % COLORS.length],
      delay: randomBetween(0, 0.3),
      size: randomBetween(4, 8),
    }))
  );

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (reducedMotion) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 top-16 z-50 mx-auto w-fit rounded-2xl bg-soft-teal-100 px-6 py-3 text-center shadow-lg"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-soft-teal-700">
              {message || "Milestone reached!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: -10,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
                opacity: [1, 1, 0],
                rotate: randomBetween(-360, 360),
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: randomBetween(1.5, 2.5),
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}

          <motion.div
            className="absolute inset-x-0 top-24 mx-auto w-fit rounded-2xl bg-white px-6 py-3 text-center shadow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-slate-blue-700">
              {message || "Milestone reached!"}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
