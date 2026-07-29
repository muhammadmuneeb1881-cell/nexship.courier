import type { Metadata } from "next";
import { Zap, ShieldCheck, Cpu, Mail } from "lucide-react";
import PageShell from "../../components/shared/PageShell";
import Card from "../../components/ui/Card";

export const metadata: Metadata = {
  title: "About Us | NexShip",
  description:
    "NexShip is Pakistan's premium courier platform, currently live in Karachi with real-time tracking and dynamic pricing.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: Zap,
    title: "Speed",
    desc: "Every shipment is optimized for the fastest possible route across Karachi, with real-time GPS tracking on every run.",
  },
  {
    icon: ShieldCheck,
    title: "Trust",
    desc: "From pickup to doorstep, we treat every parcel like it's our own — transparent pricing, honest ETAs, no surprises.",
  },
  {
    icon: Cpu,
    title: "Technology",
    desc: "A modern booking, tracking and dashboard platform built to scale as we expand across Pakistan.",
  },
];

const STATS = [
  { value: "50K+", label: "Deliveries / month" },
  { value: "99.2%", label: "On-time rate" },
  { value: "1", label: "City live — Karachi" },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About NexShip"
      title="Built for Karachi,"
      highlight="built to move fast."
      description="We started NexShip with one goal: make courier delivery in Karachi faster, more transparent, and genuinely reliable — then take that same standard nationwide."
    >
      <p className="font-body text-base leading-8 text-muted">
        NexShip is Pakistan&apos;s premium courier and logistics platform.
        We&apos;re currently live and fully operational within Karachi,
        handling everything from single-parcel deliveries to enterprise
        fulfilment — with real-time tracking, transparent pricing, and a
        dashboard built for both customers and our own operations team.
        Expansion to other cities across Pakistan is on its way.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-white/[0.03] px-6 py-6 text-center"
          >
            <p className="font-display text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 font-body text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {VALUES.map((v, i) => (
          <Card key={v.title} delay={i * 0.1} className="p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent/10">
              <v.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 font-display text-base font-semibold text-white">
              {v.title}
            </h3>
            <p className="mt-2 font-body text-xs leading-5 text-muted">{v.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-border bg-white/[0.04] px-8 py-10 text-center backdrop-blur-xl">
        <h3 className="font-display text-xl font-semibold text-white">
          Want to work with us?
        </h3>
        <p className="max-w-md font-body text-sm leading-6 text-muted">
          Whether you&apos;re a business, a partner, or just curious about
          NexShip — we&apos;d love to hear from you.
        </p>
        <a
          href="mailto:nexship.courier@gmail.com"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-display text-sm font-semibold text-[#050505] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)]"
        >
          <Mail className="h-4 w-4" />
          nexship.courier@gmail.com
        </a>
      </div>
    </PageShell>
  );
}
