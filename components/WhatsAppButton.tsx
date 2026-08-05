"use client";

import { useState } from "react";
import {
  MessageCircle,
  X,
  Ticket,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+923122347756";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "nexship.courier@gmail.com";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
const DEFAULT_MESSAGE = "Hello, I need help with my shipment.";

type View = "menu" | "ticket" | "sent";

// Single floating support button (bottom-right). Clicking it opens the
// Support Center menu — WhatsApp, Create Ticket, Call, Email, FAQs — all
// attached to this one button instead of two separate floating widgets.
export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("menu");

  const close = () => {
    setOpen(false);
    setTimeout(() => setView("menu"), 200);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support" : "Open support center"}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#050505] shadow-[0_0_0_4px_rgba(0,255,136,0.15),0_8px_24px_rgba(0,255,136,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 md:h-16 md:w-16"
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.5} />
        ) : (
          <>
            <MessageCircle className="h-7 w-7" strokeWidth={2.2} />
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-20" />
          </>
        )}
      </button>

      <div
        className={`absolute bottom-full right-0 z-[60] mb-3 w-[92vw] max-w-[360px] origin-bottom-right overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-200 ${
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
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`}
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
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white transition-colors hover:bg-white/[0.06]"
            >
              <Phone className="h-4 w-4 text-accent" strokeWidth={1.75} /> Call Support
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm text-white transition-colors hover:bg-white/[0.06]"
            >
              <Mail className="h-4 w-4 text-accent" strokeWidth={1.75} /> Email Support
            </a>
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
