import type { Metadata } from "next";
import { ChevronDown, Mail, Phone, PackageSearch, MapPinned } from "lucide-react";
import PageShell from "../../components/shared/PageShell";

export const metadata: Metadata = {
  title: "Help Center | NexShip",
  description: "Answers to common questions about booking, tracking and pricing with NexShip.",
  alternates: { canonical: "/help" },
};

const FAQS = [
  {
    q: "How do I track my order?",
    a: "Go to the Track page and enter the tracking ID (starts with NS-) you received after booking. You'll see the live status — Pending, Picked Up, In Transit or Delivered.",
  },
  {
    q: "How do I book a delivery?",
    a: "Use the Booking page. Fill in sender and receiver details, delivery city and package info, and confirm — you'll instantly get a tracking ID.",
  },
  {
    q: "What cities do you deliver to?",
    a: "We currently deliver only within Karachi. Other cities across Pakistan are marked \"Coming Soon\" on our Coverage page — you can join the waitlist there.",
  },
  {
    q: "How is delivery pricing calculated?",
    a: "Pricing is based on a base fee, weight, quantity and package type (Documents, Parcel, Fragile, Electronics, Food). You'll see the exact price before confirming your booking.",
  },
  {
    q: "Can I change my delivery status or cancel an order?",
    a: "Order status is managed by our operations team once booked. If you need to make a change, contact our support team with your tracking ID and we'll help right away.",
  },
  {
    q: "How do I contact support?",
    a: "Email us at nexship.courier@gmail.com or call +92 312 2347756. You can also use the Contact form on our homepage.",
  },
];

export default function HelpPage() {
  return (
    <PageShell
      eyebrow="Help Center"
      title="How can we"
      highlight="help?"
      description="Quick answers to the most common questions. Can't find what you need? Reach out to our team directly."
    >
      <div className="space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-white/[0.03] px-6 py-5 open:border-accent/30 open:bg-white/[0.05]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-semibold text-white marker:content-none">
              {item.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-accent" />
            </summary>
            <p className="mt-3 font-body text-sm leading-6 text-muted">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <a
          href="/track"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-white/[0.03] px-6 py-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.06]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-accent/10">
            <PackageSearch className="h-5 w-5 text-accent" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Track an order</p>
            <p className="font-body text-xs text-muted">Check your live delivery status</p>
          </div>
        </a>
        <a
          href="/coverage"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-white/[0.03] px-6 py-5 transition-all duration-300 hover:border-accent/30 hover:bg-white/[0.06]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-accent/10">
            <MapPinned className="h-5 w-5 text-accent" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Coverage areas</p>
            <p className="font-body text-xs text-muted">See where we deliver today</p>
          </div>
        </a>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-accent/25 bg-accent/[0.06] px-8 py-10 text-center backdrop-blur-xl">
        <h3 className="font-display text-lg font-semibold text-white">
          Still need help?
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:nexship.courier@gmail.com"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-display text-sm font-semibold text-[#050505] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(0,255,136,0.45)]"
          >
            <Mail className="h-4 w-4" />
            nexship.courier@gmail.com
          </a>
          <a
            href="tel:+923122347756"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-6 py-3 font-display text-sm font-semibold text-white transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.06]"
          >
            <Phone className="h-4 w-4" />
            +92 312 2347756
          </a>
        </div>
      </div>
    </PageShell>
  );
}
