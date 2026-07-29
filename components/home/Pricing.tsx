"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import InquiryModal from "../shared/InquiryModal";

const PLANS = [
  {
    name: "Starter",
    price: "Rs 299",
    period: "/ shipment",
    desc: "For individuals & small sellers shipping occasionally.",
    features: ["Up to 50 shipments/mo", "Standard delivery (2-3 days)", "Basic tracking", "Email support"],
    featured: false,
  },
  {
    name: "Business",
    price: "Rs 249",
    period: "/ shipment",
    desc: "For growing businesses with regular shipping needs.",
    features: [
      "Up to 1,000 shipments/mo",
      "Express delivery (same/next day)",
      "Real-time GPS tracking",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For high-volume operations & national supply chains.",
    features: [
      "Unlimited shipments",
      "Dedicated fleet & fulfilment",
      "Custom SLAs",
      "Dedicated account manager",
      "24/7 phone support",
    ],
    featured: false,
  },
];

export default function Pricing() {
  const [modalPlan, setModalPlan] = useState<string | null>(null);

  return (
    <section id="pricing" className="relative bg-base py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,255,136,0.07),transparent_60%)]" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing,"
          highlight="no surprises."
          description="Pay per shipment with transparent rates, or scale into a custom enterprise plan."
        />

        <p className="mx-auto mt-6 max-w-2xl text-center font-body text-xs leading-5 text-muted">
          Pricing shown applies to deliveries within Karachi. Rates for other
          cities across Pakistan will be announced closer to launch.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl border p-8 backdrop-blur-xl transition-all duration-500 ${
                plan.featured
                  ? "border-accent/40 bg-gradient-to-b from-accent/[0.08] to-white/[0.03] shadow-[0_20px_60px_-15px_rgba(0,255,136,0.3)]"
                  : "border-border bg-white/[0.04] hover:border-white/20"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-[#050505]">
                  Most Popular
                </span>
              )}

              <h3 className="font-display text-lg font-semibold text-white">
                {plan.name}
              </h3>
              <p className="mt-2 font-body text-sm text-muted">{plan.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="font-body text-sm text-muted">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 font-body text-sm text-muted">
                    <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  variant={plan.featured ? "solid" : "outline"}
                  className="w-full"
                  onClick={() => setModalPlan(plan.name)}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>

      <InquiryModal
        open={modalPlan !== null}
        onClose={() => setModalPlan(null)}
        plan={modalPlan || ""}
        defaultMessage={
          modalPlan ? `I'm interested in the ${modalPlan} plan.` : ""
        }
      />
    </section>
  );
}
