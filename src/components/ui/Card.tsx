"use client";

import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({ children, className = "", onClick, hoverable = false }: CardProps) {
  const base = "rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]";
  const hoverClass = hoverable
    ? "cursor-pointer transition-shadow hover:shadow-[var(--shadow-card-hover)]"
    : "";

  if (hoverable) {
    return (
      <motion.div
        className={`${base} ${hoverClass} ${className}`}
        onClick={onClick}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
