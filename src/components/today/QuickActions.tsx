"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function QuickActions() {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2">
      <div className="mx-auto flex max-w-lg gap-3">
        <Link href="/log/feed" className="flex-1">
          <motion.div
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-blue-500 py-3 text-sm font-medium text-white shadow-lg"
            whileTap={{ scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Log Feed
          </motion.div>
        </Link>
        <Link href="/log/nap" className="flex-1">
          <motion.div
            className="flex items-center justify-center gap-2 rounded-2xl bg-soft-teal-500 py-3 text-sm font-medium text-white shadow-lg"
            whileTap={{ scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Log Nap
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
