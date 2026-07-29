"use client";

import { CheckCircle2, Clock } from "lucide-react";
import type { CityStatus } from "../../lib/cities";

interface CityBadgeProps {
  status: CityStatus;
  size?: "sm" | "md";
  className?: string;
}

export default function CityBadge({
  status,
  size = "sm",
  className = "",
}: CityBadgeProps) {
  const isLive = status === "live";
  const sizing =
    size === "sm"
      ? "gap-1 px-2.5 py-1 text-[10px]"
      : "gap-1.5 px-3.5 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-body font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${sizing} ${
        isLive
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-amber-400/30 bg-amber-400/10 text-amber-300"
      } ${className}`}
    >
      {isLive ? (
        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
      ) : (
        <Clock className="h-3 w-3" strokeWidth={2} />
      )}
      {isLive ? "Available in Karachi" : "Coming Soon"}
    </span>
  );
}
