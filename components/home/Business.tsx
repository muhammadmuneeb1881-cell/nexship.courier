"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, Cpu, Globe2, Headset } from "lucide-react";
import Container from "../ui/Container";
import Card from "../ui/Card";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import InquiryModal from "../shared/InquiryModal";

const STEPS = [
  {
    icon: Boxes,
    title: "Book & Pack",
    desc: "Schedule a pickup in seconds through our dashboard or API.",
  },
  {
    icon: Cpu,
    title: "Smart Routing",
    desc: "Our engine picks the fastest, most reliable route automatically.",
  },
  {
    icon: Globe2,
    title: "Move & Track",
    desc: "Live GPS tracking across ground, air and sea legs of the journey.",
  },
  {
    icon: Headset,
    title: "Deliver & Support",
    desc: "Signed delivery confirmation with 24/7 dedicated support.",
  },
];

export default function Business() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="business" className="relative bg-base py-28 sm:py-36">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <SectionHeading
              align="left"
              eyebrow="For Business"
              title="Built to power your"
              highlight="entire supply chain."
              description="From startups shipping their first order to enterprises moving thousands of parcels a day — NexShip scales with you."
            />

            <ul className="mt-8 space-y-4">
              {[
                "Dedicated account manager & priority support",
                "REST API & webhook integrations",
                "Custom SLAs and volume-based pricing",
                "Automated customs & documentation",
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-center gap-3 font-body text-sm text-muted"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    ✓
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>

            <div className="mt-10">
              <Button onClick={() => setModalOpen(true)}>Talk to Sales</Button>
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Card key={s.title} delay={i * 0.1} className="p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent/10">
                  <s.icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                </div>
                <p className="mt-5 font-body text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Step 0{i + 1}
                </p>
                <h3 className="mt-1.5 font-display text-base font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 font-body text-xs leading-5 text-muted">
                  {s.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Container>

      <InquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plan="Business Sales"
        defaultMessage="I'd like to talk to sales about NexShip for my business."
      />
    </section>
  );
}
