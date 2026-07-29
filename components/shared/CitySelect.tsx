"use client";

import { AlertCircle } from "lucide-react";
import { CITIES } from "../../lib/cities";

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
}

export default function CitySelect({
  value,
  onChange,
  label = "Delivery City",
  id = "city-select",
}: CitySelectProps) {
  const selected = CITIES.find((c) => c.slug === value);
  const isComingSoon = selected?.status === "coming-soon";

  return (
    <div className="w-full">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="peer w-full appearance-none rounded-2xl border border-border bg-white/[0.04] px-5 pb-3 pt-6 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40"
        >
          <option value="" disabled hidden />
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug} className="bg-[#0a0a0a] text-white">
              {c.name} {c.status === "coming-soon" ? "— Coming Soon" : "— Available"}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-5 top-2.5 font-body text-[11px] text-accent"
        >
          {label}
        </label>
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
          ▾
        </span>
      </div>

      {isComingSoon && (
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" strokeWidth={1.75} />
          <p className="font-body text-xs leading-5 text-amber-200/90">
            Service in your city is coming soon. Booking is currently available
            for Karachi deliveries only.
          </p>
        </div>
      )}
    </div>
  );
}
