"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  children,
  className = "",
  variant = "solid",
  type = "button",
  onClick,
  disabled = false,
}: ButtonProps) {
  if (variant === "outline") {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`group relative inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/[0.03] px-7 py-3.5 font-display text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.03] hover:border-accent/40 hover:bg-white/[0.06] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-border disabled:hover:bg-white/[0.03] ${className}`}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-display text-sm font-semibold tracking-wide text-[#050505] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
