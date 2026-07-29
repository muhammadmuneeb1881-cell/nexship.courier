"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, Twitter, ArrowRight, MapPin, Mail } from "lucide-react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import CityBadge from "../shared/CityBadge";
import { CITIES, KARACHI_NOTICE } from "../../lib/cities";

const LINK_GROUPS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Newsroom", href: "/newsroom" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Express Delivery", href: "/#services" },
      { label: "Air Freight", href: "/#services" },
      { label: "Sea Freight", href: "/#services" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Shipment", href: "/track" },
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/#contact" },
    ],
  },
];

const SOCIALS = [
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61591363003347", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/nexship.courier/", label: "Instagram" },
  { icon: Twitter, href: "https://x.com/nexshipcourier", label: "Twitter" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/nex-ship-068177420/", label: "LinkedIn" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer className="relative overflow-hidden bg-base pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,255,136,0.06),transparent_60%)]" />
      </div>

      <Container>
        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-white/[0.04] px-8 py-12 text-center backdrop-blur-xl sm:px-16"
        >
          <h3 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stay ahead of your{" "}
            <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">
              shipments.
            </span>
          </h3>
          <p className="max-w-md font-body text-sm text-muted">
            Subscribe for delivery updates, logistics tips and exclusive
            business offers.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-full border border-border bg-white/[0.05] px-5 py-3.5 font-body text-sm text-white placeholder:text-muted/70 outline-none backdrop-blur-md transition-colors focus:border-accent/40"
            />
            <Button type="submit" className="shrink-0">
              {subscribed ? "Subscribed ✓" : "Subscribe"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        </motion.div>

        {/* Karachi-only notice */}
        <div className="mt-12 flex flex-col items-center gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-6 py-4 text-center sm:flex-row sm:text-left">
          <MapPin className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={2} />
          <p className="font-body text-xs leading-5 text-amber-200/90">
            {KARACHI_NOTICE}
          </p>
        </div>

        {/* Animated divider */}
        <div className="relative my-12 h-px w-full overflow-hidden bg-border">
          <div className="absolute inset-0 h-px w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-accent/60 to-transparent animate-beam" />
        </div>

        {/* Links grid */}
        <div className="grid gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Nex<span className="text-accent">Ship</span>
            </h1>
            <p className="mt-4 max-w-xs font-body text-sm leading-6 text-muted">
              Pakistan&apos;s premium courier and logistics platform —
              delivering trust, speed and precision, starting in Karachi.
            </p>
            <a
              href="mailto:nexship.courier@gmail.com"
              className="mt-4 inline-flex items-center gap-2 font-body text-sm text-muted transition-colors duration-300 hover:text-accent"
            >
              <Mail className="h-3.5 w-3.5" />
              nexship.courier@gmail.com
            </a>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/[0.04] text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-[0_0_20px_rgba(0,255,136,0.25)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                {group.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 font-body text-sm text-muted transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* City coverage */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Coverage
            </h4>
            <ul className="mt-5 space-y-3">
              {CITIES.slice(0, 5).map((city) => (
                <li key={city.slug} className="flex items-center justify-between gap-2">
                  <a
                    href="/coverage"
                    className="font-body text-sm text-muted transition-colors duration-300 hover:text-white"
                  >
                    {city.name}
                  </a>
                  <CityBadge status={city.status} />
                </li>
              ))}
            </ul>
            <a
              href="/coverage"
              className="group mt-4 inline-flex items-center gap-1.5 font-body text-xs font-medium text-accent transition-colors duration-300 hover:text-emerald-300"
            >
              View all cities
              <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 sm:flex-row">
          <p className="font-body text-xs text-muted">
            © {new Date().getFullYear()} NexShip. All rights reserved.
          </p>
          <div className="flex gap-6 font-body text-xs text-muted">
            <a href="/privacy" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="/terms" className="transition-colors hover:text-white">Terms of Service</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
