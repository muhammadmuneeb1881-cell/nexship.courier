"use client";

import { motion } from "framer-motion";
import { MapPin, Bell, CheckCircle2 } from "lucide-react";
import { useState, FormEvent } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import CityBadge from "../shared/CityBadge";
import { CITIES, KARACHI_NOTICE } from "../../lib/cities";

export default function CoveragePageClient() {
  const [email, setEmail] = useState("");
  const [notifyCity, setNotifyCity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !notifyCity) return;
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <main className="relative bg-base pt-40 pb-24 sm:pt-48">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(0,255,136,0.1),transparent_60%)]" />
        </div>

        <Container>
          <SectionHeading
            eyebrow="Delivery Coverage"
            title="Where NexShip"
            highlight="delivers today."
            description="A transparent look at our national rollout — live in Karachi now, with every future city listed and tracked."
          />

          <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
            <p className="font-body text-sm leading-6 text-white/90">{KARACHI_NOTICE}</p>
          </div>

          {/* City grid */}
          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((city, i) => (
              <motion.div
                key={city.slug}
                id={city.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-500 ${
                  city.status === "live"
                    ? "border-accent/40 bg-gradient-to-b from-accent/[0.08] to-white/[0.03] shadow-[0_20px_60px_-15px_rgba(0,255,136,0.25)]"
                    : "border-border bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {city.name}
                    </h3>
                    <p className="mt-1 font-body text-xs text-muted">{city.province}</p>
                  </div>
                  <CityBadge status={city.status} />
                </div>

                <p className="mt-5 font-body text-sm leading-6 text-muted">
                  {city.status === "live"
                    ? "Full courier operations are active — booking, live tracking and support are all available now."
                    : "Not yet live. Join the waitlist below to be notified the moment we launch here."}
                </p>

                {city.status === "live" && (
                  <div className="mt-5 flex items-center gap-2 font-body text-xs font-medium text-accent">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Booking open
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Notify me */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-20 max-w-2xl rounded-3xl border border-border bg-white/[0.04] px-8 py-10 text-center backdrop-blur-xl sm:px-12"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-1.5 font-body text-xs font-medium tracking-wide text-accent">
              <Bell className="h-3 w-3" />
              Get notified
            </span>
            <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              We&apos;ll tell you the moment we launch near you.
            </h3>

            <form
              onSubmit={handleNotify}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <select
                value={notifyCity}
                onChange={(e) => setNotifyCity(e.target.value)}
                required
                className="w-full rounded-full border border-border bg-white/[0.05] px-5 py-3.5 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40 sm:w-auto"
              >
                <option value="" disabled className="bg-[#0a0a0a]">
                  Your city
                </option>
                {CITIES.filter((c) => c.status === "coming-soon").map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-[#0a0a0a]">
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-full border border-border bg-white/[0.05] px-5 py-3.5 font-body text-sm text-white placeholder:text-muted/70 outline-none backdrop-blur-md transition-colors focus:border-accent/40"
              />
              <Button type="submit" className="shrink-0">
                {submitted ? "You're on the list ✓" : "Notify Me"}
              </Button>
            </form>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
