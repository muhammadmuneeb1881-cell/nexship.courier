"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import CityBadge from "../shared/CityBadge";
import Button from "../ui/Button";
import { CITIES } from "../../lib/cities";

export default function Coverage() {
  return (
    <section id="coverage" className="relative bg-base py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_20%,rgba(0,255,136,0.06),transparent_60%)]" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="Delivery Coverage"
          title="Live in Karachi,"
          highlight="expanding nationwide."
          description="We're building city by city to make sure every delivery meets our quality bar before we launch there."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city, i) => (
            <motion.div
              key={city.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 backdrop-blur-xl transition-all duration-300 ${
                city.status === "live"
                  ? "border-accent/30 bg-accent/[0.06]"
                  : "border-border bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MapPin
                  className={`h-4 w-4 shrink-0 ${
                    city.status === "live" ? "text-accent" : "text-muted"
                  }`}
                />
                <div>
                  <p className="font-display text-sm font-semibold text-white">
                    {city.name}
                  </p>
                  <p className="font-body text-[11px] text-muted">{city.province}</p>
                </div>
              </div>
              <CityBadge status={city.status} />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="max-w-md font-body text-sm leading-6 text-muted">
            {"We currently provide courier services only within Karachi. Expansion to other cities across Pakistan is coming soon."}
          </p>
          <a href="/coverage">
            <Button variant="outline">
              View full coverage map
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </Container>
    </section>
  );
}
