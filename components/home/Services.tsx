"use client";

import { motion } from "framer-motion";
import {
  Truck,
  Plane,
  Ship,
  PackageSearch,
  Building2,
} from "lucide-react";
import Container from "../ui/Container";
import Card from "../ui/Card";
import SectionHeading from "../ui/SectionHeading";
import CityBadge from "../shared/CityBadge";

const SERVICES = [
  {
    icon: Truck,
    title: "Express Ground Delivery",
    desc: "Same-day and next-day courier network with real-time GPS tracking on every run, live now within Karachi.",
    status: "live" as const,
  },
  {
    icon: Plane,
    title: "Air Freight",
    desc: "Priority air cargo for time-critical shipments, connecting Pakistan's major hubs to the world.",
    status: "coming-soon" as const,
  },
  {
    icon: Ship,
    title: "Sea & Container Freight",
    desc: "Cost-efficient container shipping for bulk and international consignments, door to port.",
    status: "coming-soon" as const,
  },
  {
    icon: PackageSearch,
    title: "Smart Package Handling",
    desc: "AI-assisted sorting and damage-proof handling protocols for fragile and high-value goods.",
    status: "live" as const,
  },
  {
    icon: Building2,
    title: "Enterprise Logistics",
    desc: "Dedicated account management, API integrations and custom SLAs for growing businesses nationwide.",
    status: "coming-soon" as const,
  },
];

export default function Services() {
  return (
    <section id="services" className="relative bg-base py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_20%,rgba(0,255,136,0.06),transparent_60%)]" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="What We Offer"
          title="Logistics built for"
          highlight="every scale."
          description="From a single parcel to enterprise supply chains — our infrastructure is designed to move it faster, safer and smarter."
        />

        <p className="mx-auto mt-6 max-w-2xl text-center font-body text-xs leading-5 text-muted">
          All services below are fully operational within Karachi. Coverage
          for other cities across Pakistan is coming soon.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Card key={s.title} delay={i * 0.08}>
              <div className="flex items-start justify-between gap-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 + 0.15 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-accent/10"
                >
                  <s.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                </motion.div>
                <CityBadge status={s.status} />
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-3 font-body text-sm leading-6 text-muted">
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
