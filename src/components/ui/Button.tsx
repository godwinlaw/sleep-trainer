"use client";

import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-slate-blue-500 text-white hover:bg-slate-blue-600 active:bg-slate-blue-700",
  secondary: "bg-soft-teal-100 text-soft-teal-700 hover:bg-soft-teal-200 active:bg-soft-teal-300",
  danger: "bg-muted-rose-100 text-muted-rose-700 hover:bg-muted-rose-200 active:bg-muted-rose-300",
  ghost: "bg-transparent text-slate-blue-600 hover:bg-slate-blue-50 active:bg-slate-blue-100",
};

export default function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
