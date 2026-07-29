import type { Metadata } from "next";
import { Route, Recycle, Users, BatteryCharging, Mail } from "lucide-react";
import PageShell from "../../components/shared/PageShell";
import Card from "../../components/ui/Card";

export const metadata: Metadata = {
  title: "Sustainability | NexShip",
  description: "How NexShip is building a more sustainable courier network in Karachi.",
  alternates: { canonical: "/sustainability" },
};

const COMMITMENTS = [
  {
    icon: Route,
    title: "Route Optimization",
    desc: "Smart routing reduces unnecessary mileage on every delivery, cutting fuel use across our Karachi fleet.",
  },
  {
    icon: Recycle,
    title: "Sustainable Packaging",
    desc: "We're phasing in recyclable and reusable packaging materials across our warehousing operations.",
  },
  {
    icon: Users,
    title: "Local Employment",
    desc: "Every rider, dispatcher and warehouse team member we hire is based right here in Karachi.",
  },
  {
    icon: BatteryCharging,
    title: "Future EV Fleet",
    desc: "We're evaluating electric bikes and vans as we grow, to lower emissions per delivery over time.",
  },
];

export default function SustainabilityPage() {
  return (
    <PageShell
      eyebrow="Sustainability"
      title="Delivering"
      highlight="responsibly."
      description="Speed shouldn't come at the planet's expense. Here's what we're doing about it as we grow."
      wide
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {COMMITMENTS.map((c, i) => (
          <Card key={c.title} delay={i * 0.08} className="p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent/10">
              <c.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 font-display text-base font-semibold text-white">
              {c.title}
            </h3>
            <p className="mt-2 font-body text-xs leading-5 text-muted">{c.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-3 rounded-2xl border border-border bg-white/[0.03] px-6 py-8 text-center">
        <p className="font-body text-sm text-muted">
          Have a sustainability partnership idea?
        </p>
        <a
          href="mailto:nexship.courier@gmail.com?subject=Sustainability%20Partnership"
          className="inline-flex items-center gap-2 font-body text-sm font-semibold text-accent transition-colors hover:text-emerald-300"
        >
          <Mail className="h-4 w-4" />
          nexship.courier@gmail.com
        </a>
      </div>
    </PageShell>
  );
}
