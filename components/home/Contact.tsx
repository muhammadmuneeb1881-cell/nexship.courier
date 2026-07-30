"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Loader2, AlertCircle } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";

const FIELDS: { name: "name" | "email" | "phone"; label: string; type: string }[] = [
  { name: "name", label: "Full Name", type: "text" },
  { name: "email", label: "Email Address", type: "email" },
  { name: "phone", label: "Phone Number", type: "tel" },
];

function FloatingInput({
  name,
  label,
  type,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full rounded-2xl border border-border bg-white/[0.04] px-5 pb-3 pt-6 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40"
      />
      <label
        htmlFor={name}
        className="pointer-events-none absolute left-5 top-4 font-body text-sm text-muted transition-all duration-200 peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[11px]"
      >
        {label}
      </label>
    </div>
  );
}

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.name.trim() || !values.phone.trim()) {
      setError("Please fill in your name and phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "General Inquiry",
          name: values.name,
          phone: values.phone,
          email: values.email,
          message: values.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
      setValues({ name: "", email: "", phone: "", message: "" });
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-base py-28 sm:py-36">
      {/* interactive-style map background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
        <svg className="h-full w-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 24 }).map((_, r) =>
            Array.from({ length: 40 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={c * 32}
                cy={r * 32}
                r="1"
                fill="rgba(255,255,255,0.08)"
              />
            ))
          )}
          <path
            d="M100,600 C300,500 400,400 500,350 S 800,150 1100,100"
            stroke="rgba(0,255,136,0.35)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            fill="none"
            className="animate-dashMove"
          />
          {[
            [100, 600],
            [500, 350],
            [1100, 100],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="#00FF88" opacity="0.7" />
          ))}
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-base via-transparent to-base" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="Get In Touch"
          title="Let's move your"
          highlight="business forward."
          description="Have a shipment to plan or a partnership to discuss? Our team replies within one business hour."
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-5">
          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-border bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8 lg:col-span-2"
          >
            <h3 className="font-display text-lg font-semibold text-white">
              Contact Details
            </h3>
            <div className="mt-8 space-y-6">
              {[
                { icon: Phone, label: "Phone", value: "+92 312 2347756" },
                { icon: Mail, label: "Email", value: "nexship.courier@gmail.com" },
                { icon: MapPin, label: "Head Office", value: "Shahrah-e-Faisal, Karachi, Pakistan" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/10">
                    <c.icon className="h-4 w-4 text-accent" />
                  </span>
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-wider text-muted">
                      {c.label}
                    </p>
                    <p className="mt-1 font-body text-sm text-white">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3">
              <p className="font-body text-xs leading-5 text-amber-200/90">
                We currently serve Karachi only. If you&apos;re reaching out
                from another city, we&apos;ll notify you as soon as we launch
                there.
              </p>
            </div>
          </motion.div>

          {/* Glass form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-border bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8 lg:col-span-3"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.name} className={f.name === "phone" ? "sm:col-span-2" : ""}>
                  <FloatingInput
                    name={f.name}
                    label={f.label}
                    type={f.type}
                    value={values[f.name]}
                    onChange={(v) => setValues((s) => ({ ...s, [f.name]: v }))}
                  />
                </div>
              ))}
            </div>

            <div className="relative mt-5">
              <textarea
                id="message"
                rows={4}
                placeholder=" "
                value={values.message}
                onChange={(e) => setValues((s) => ({ ...s, message: e.target.value }))}
                className="peer w-full resize-none rounded-2xl border border-border bg-white/[0.04] px-5 pb-3 pt-6 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40"
              />
              <label
                htmlFor="message"
                className="pointer-events-none absolute left-5 top-4 font-body text-sm text-muted transition-all duration-200 peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[11px]"
              >
                Your Message
              </label>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-400/25 bg-red-400/[0.08] px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" strokeWidth={1.75} />
                <p className="font-body text-xs leading-5 text-red-200/90">{error}</p>
              </div>
            )}

            <div className="mt-6">
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : sent ? (
                  "Message Sent ✓"
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </motion.form>
        </div>
      </Container>
    </section>
  );
}
