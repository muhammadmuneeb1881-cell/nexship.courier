"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Container from "../ui/Container";
import CityBadge from "../shared/CityBadge";
import { MapPin } from "lucide-react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: (i * 37) % 100,
  left: (i * 53) % 100,
  size: 2 + (i % 3),
  delay: (i % 6) * 0.7,
  duration: 6 + (i % 5),
}));

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x, y });
    };

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-base pt-40 pb-20 sm:pt-44"
    >
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(0,255,136,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_60%,rgba(0,255,136,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />

        {/* Animated light beam sweeps */}
        <div className="absolute top-0 left-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-beam" />

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-accent/60 animate-floaty"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: "0 0 8px rgba(0,255,136,0.8)",
            }}
          />
        ))}
      </div>

      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div
            className="animate-fadeUp"
            style={{
              transform: `translate(${tilt.x * -8}px, ${tilt.y * -8}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-1.5 font-body text-xs font-medium tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Pakistan&apos;s Premium Courier Platform
            </span>

            <h1 className="text-balance mt-7 font-display text-6xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl">
              Delivering
              <br />
              Karachi{" "}
              <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">
                Faster.
              </span>
            </h1>

            <p className="mt-7 max-w-md font-body text-lg leading-8 text-muted">
              Fast, secure and reliable courier solutions for businesses and
              individuals — live now in Karachi, with services expanding
              across Pakistan soon.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-white/[0.03] px-4 py-3 backdrop-blur-md">
              <MapPin className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <p className="font-body text-xs leading-5 text-muted">
                We currently provide courier services only within Karachi.
                Expansion to other cities across Pakistan is coming soon.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button>Get Quote</Button>
              <a
                href="/track"
                className="rounded-full border border-border bg-white/[0.03] px-7 py-3.5 font-display text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98]"
              >
                Track Shipment
              </a>
            </div>

            <div className="mt-14 flex flex-wrap gap-10 border-t border-border pt-8">
              <div>
                <p className="font-display text-2xl font-bold text-white">50K+</p>
                <p className="mt-1 font-body text-xs text-muted">Deliveries / month</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-2xl font-bold text-white">120+</p>
                  <CityBadge status="coming-soon" />
                </div>
                <p className="mt-1 font-body text-xs text-muted">Cities in our national network</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-white">99.2%</p>
                <p className="mt-1 font-body text-xs text-muted">On-time rate</p>
              </div>
            </div>
          </div>

          {/* Signature visual: animated logistics network */}
          <div
            className="relative flex h-[460px] items-center justify-center sm:h-[520px]"
            style={{
              transform: `translate(${tilt.x * 14}px, ${tilt.y * 14}px)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            <div className="absolute h-72 w-72 rounded-full bg-accent/20 blur-[100px] animate-pulseGlow sm:h-96 sm:w-96" />

            <div className="relative h-full w-full rounded-[32px] border border-border bg-white/[0.03] backdrop-blur-xl">
              <svg
                viewBox="0 0 400 460"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                {/* grid dots */}
                {Array.from({ length: 8 }).map((_, r) =>
                  Array.from({ length: 7 }).map((_, c) => (
                    <circle
                      key={`${r}-${c}`}
                      cx={30 + c * 56}
                      cy={30 + r * 58}
                      r="1.4"
                      fill="rgba(255,255,255,0.12)"
                    />
                  ))
                )}

                {/* route lines connecting hub to nodes */}
                {[
                  "M200,230 L86,90",
                  "M200,230 L342,88",
                  "M200,230 L60,340",
                  "M200,230 L330,360",
                  "M200,230 L200,60",
                ].map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    stroke="rgba(0,255,136,0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="6 8"
                    className="animate-dashMove"
                  />
                ))}

                {/* hub node */}
                <circle cx="200" cy="230" r="10" fill="#00FF88" opacity="0.9" />
                <circle
                  cx="200"
                  cy="230"
                  r="22"
                  stroke="#00FF88"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                  fill="none"
                />

                {/* destination nodes */}
                {[
                  [86, 90],
                  [342, 88],
                  [60, 340],
                  [330, 360],
                  [200, 60],
                ].map(([cx, cy], i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="5" fill="#0A0A0A" stroke="#00FF88" strokeWidth="1.5" />
                    <circle cx={cx} cy={cy} r="5" fill="#00FF88" opacity="0.15" />
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl border border-border bg-white/[0.05] px-5 py-4 backdrop-blur-xl">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-wider text-muted">
                    Live shipment
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-white">
                    Within Karachi
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 font-body text-xs font-medium text-accent">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  In transit
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
