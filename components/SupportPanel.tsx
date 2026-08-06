"use client";

import { useState } from "react";
import {
  LifeBuoy,
  X,
  MessageCircle,
  Ticket,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+923122347756";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "nexship.courier@gmail.com";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

type View = "menu" | "ticket" | "sent";

export default function SupportPanel() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");

  const close = () => {
    setOpen(false);
    setTimeout(() => setView("menu"), 200);
  };

  return (
    <>
      {/* Floating trigger — placed bottom-left so it never overlaps the WhatsApp button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support" : "Open support center"}
        className="fixed bottom-5 left-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface text-white shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" strokeWidth={2.5} /> : <LifeBuoy className="h-6 w-6" strokeWidth={2} />}
      </button>

      <div
        className={`fixed bottom-24 left-5 z-[60] w-[92vw] max-w-[360px] origin-bottom-left overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-200 ${
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-white">Support Center</h3>
          <p className="mt-0.5 font-body text-xs text-muted">How would you like to reach us?</p>
        </div>

        {view === "menu" && (
          <div className="space-y-1 p-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I need help with my shipment.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white transition-colors hover:bg-white/[0.06]"
            >
              <MessageCircle className="h-4 w-4 text-accent" strokeWidth={1.75} /> WhatsApp Support
            </a>
            <button
              onClick={() => setView("ticket")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-body text-sm text-white transition-colors hover:bg-white/[0.06]"
            >
              <Ticket className="h-4 w-4 text-accent" strokeWidth={1.75} /> Create Ticket
            </button>
            <ContactRow
              icon={<Phone className="h-4 w-4 text-accent" strokeWidth={1.75} />}
              label="Call Support"
              value={SUPPORT_PHONE}
              href={`tel:${SUPPORT_PHONE}`}
            />
            <ContactRow
              icon={<Mail className="h-4 w-4 text-accent" strokeWidth={1.75} />}
              label="Email Support"
              value={SUPPORT_EMAIL}
              href={`mailto:${SUPPORT_EMAIL}`}
            />
            <a
              href="/help"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white transition-colors hover:bg-white/[0.06]"
            >
              <HelpCircle className="h-4 w-4 text-accent" strokeWidth={1.75} /> FAQs
            </a>
          </div>
        )}

        {view === "ticket" && <TicketForm onSent={() => setView("sent")} onBack={() => setView("menu")} />}

        {view === "sent" && (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-accent" strokeWidth={1.5} />
            <p className="font-body text-sm text-white">Ticket submitted. Our team will get back to you shortly.</p>
            <button onClick={close} className="mt-2 font-body text-xs text-muted underline">
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * A support-menu row that both (a) tries to open the native phone/mail app
 * via the href, and (b) offers a copy button as a fallback for desktop /
 * Chromebook users who don't have a default phone or mail app configured —
 * on those devices tel:/mailto: links silently do nothing, so without this
 * the button can look "broken" even though it's working as designed.
 */
function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — fall back to letting the tel:/mailto: link work.
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.06]">
      <a href={href} className="flex flex-1 items-center gap-3 font-body text-sm text-white">
        {icon}
        <span className="flex flex-col">
          {label}
          <span className="font-body text-[11px] text-muted">{value}</span>
        </span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-white"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
      </button>
    </div>
  );
}

function TicketForm({ onSent, onBack }: { onSent: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit ticket.");
        return;
      }
      onSent();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 p-4">
      <input
        required
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-border bg-white/[0.04] px-3 py-2 font-body text-xs text-white outline-none focus:border-accent/40"
      />
      <input
        required
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-border bg-white/[0.04] px-3 py-2 font-body text-xs text-white outline-none focus:border-accent/40"
      />
      <input
        placeholder="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-border bg-white/[0.04] px-3 py-2 font-body text-xs text-white outline-none focus:border-accent/40"
      />
      <input
        required
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full rounded-lg border border-border bg-white/[0.04] px-3 py-2 font-body text-xs text-white outline-none focus:border-accent/40"
      />
      <textarea
        required
        placeholder="How can we help?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-white/[0.04] px-3 py-2 font-body text-xs text-white outline-none focus:border-accent/40"
      />
      {error && <p className="font-body text-[11px] text-red-300">{error}</p>}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border px-3 py-2 font-body text-xs text-muted transition-colors hover:text-white"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-accent px-3 py-2 font-display text-xs font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}
