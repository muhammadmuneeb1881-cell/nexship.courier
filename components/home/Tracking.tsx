"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Radar, Timer, ShieldCheck, Navigation } from "lucide-react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import CityBadge from "../shared/CityBadge";

const STATS = [
  { icon: Radar, label: "Live tracked shipments", value: "8,412" },
  { icon: Timer, label: "Avg. delivery time", value: "5.2 hrs" },
  { icon: ShieldCheck, label: "Damage-free rate", value: "99.6%" },
];

export default function Tracking() {
  const router = useRouter();
  const [quickId, setQuickId] = useState("");

  const handleQuickTrack = (e: FormEvent) => {
    e.preventDefault();
    const id = quickId.trim();
    if (!id) return;
    router.push(`/track?id=${encodeURIComponent(id)}`);
  };

  return (
    <section id="tracking" className="relative overflow-hidden bg-base py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_10%,rgba(0,255,136,0.08),transparent_60%)]" />
      </div>

      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Dashboard visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />

            <div className="relative overflow-hidden rounded-[28px] border border-border bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-sm font-semibold text-white">
                  Logistics Dashboard
                </p>
                <div className="flex items-center gap-2">
                  <CityBadge status="live" />
                  <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-body text-xs text-accent">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    Live
                  </span>
                </div>
              </div>

              {/* radar sweep map */}
              <div className="relative mt-6 h-64 overflow-hidden rounded-2xl border border-border bg-[#0a0a0a]">
                <svg viewBox="0 0 300 220" className="h-full w-full">
                  {Array.from({ length: 6 }).map((_, r) =>
                    Array.from({ length: 8 }).map((_, c) => (
                      <circle
                        key={`${r}-${c}`}
                        cx={20 + c * 36}
                        cy={20 + r * 36}
                        r="1.2"
                        fill="rgba(255,255,255,0.1)"
                      />
                    ))
                  )}
                  <path
                    d="M20,180 C80,120 120,160 160,90 S 260,40 280,20"
                    stroke="rgba(0,255,136,0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="5 7"
                    fill="none"
                    className="animate-dashMove"
                  />
                  {[
                    [20, 180],
                    [160, 90],
                    [280, 20],
                  ].map(([cx, cy], i) => (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={i === 1 ? 6 : 4}
                      fill={i === 1 ? "#00FF88" : "#0a0a0a"}
                      stroke="#00FF88"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>
                <motion.div
                  animate={{ opacity: [0.15, 0.4, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_53%_40%,rgba(0,255,136,0.25),transparent_55%)]"
                />
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-white/[0.05] px-5 py-4">
                <div className="flex items-center gap-3">
                  <Navigation className="h-4 w-4 text-accent" />
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-wider text-muted">
                      Shipment #NS-88234
                    </p>
                    <p className="font-display text-sm font-semibold text-white">
                      Karachi — Clifton to Gulshan
                    </p>
                  </div>
                </div>
                <span className="font-body text-xs font-medium text-accent">
                  On schedule
                </span>
              </div>
            </div>
          </motion.div>

          {/* Copy + stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-1.5 font-body text-xs font-medium tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Real-Time Tracking
            </span>
            <h2 className="text-balance mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Know exactly where
              <br />
              your package{" "}
              <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">
                is, always.
              </span>
            </h2>
            <p className="mt-5 max-w-md font-body text-base leading-7 text-muted">
              Every shipment is GPS-tagged from pickup to doorstep. Get live
              ETAs, route history and instant delay alerts — no guesswork.
            </p>
            <p className="mt-3 max-w-md font-body text-xs leading-5 text-muted">
              Real-time tracking is currently available for Karachi
              deliveries only. Tracking for other cities will activate as we
              expand.
            </p>

            <form onSubmit={handleQuickTrack} className="mt-8 flex flex-wrap gap-3">
              <input
                type="text"
                value={quickId}
                onChange={(e) => setQuickId(e.target.value.toUpperCase())}
                placeholder="Enter tracking ID (e.g. NS-7K2F9Q)"
                className="w-full max-w-[260px] rounded-full border border-border bg-white/[0.04] px-5 py-3.5 font-body text-sm uppercase text-white placeholder:text-muted/70 outline-none backdrop-blur-md transition-colors focus:border-accent/40"
              />
              <Button type="submit">Track Now</Button>
            </form>

            <div className="mt-12 grid grid-cols-1 gap-5 border-t border-border pt-8 xs:grid-cols-3 sm:gap-4">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex items-center gap-3 xs:block"
                >
                  <s.icon className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                  <div className="xs:mt-3">
                    <p className="font-display text-xl font-bold text-white">
                      {s.value}
                    </p>
                    <p className="mt-0.5 font-body text-[11px] leading-4 text-muted xs:mt-1">
                      {s.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
