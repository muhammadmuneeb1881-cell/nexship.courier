"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export default function Button({
  children,
  className = "",
  variant = "solid",
  type = "button",
  onClick,
  disabled = false,
  href,
  target,
  rel,
}: ButtonProps) {
  const solidClasses = `group relative inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-display text-sm font-semibold tracking-wide text-[#050505] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none ${className}`;
  const outlineClasses = `group relative inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/[0.03] px-7 py-3.5 font-display text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.03] hover:border-accent/40 hover:bg-white/[0.06] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-border disabled:hover:bg-white/[0.03] ${className}`;
  const classes = variant === "outline" ? outlineClasses : solidClasses;

  // Renders as a real link when `href` is provided, so it navigates like a
  // normal anchor (works without JS, supports target/rel, ctrl/cmd-click, etc).
  if (href && !disabled) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
