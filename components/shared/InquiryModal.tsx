"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Button from "../ui/Button";

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  plan: string;
  defaultMessage?: string;
}

export default function InquiryModal({
  open,
  onClose,
  plan,
  defaultMessage = "",
}: InquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage);
      setSent(false);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, name, phone, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-[#0a0a0a] p-6 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {sent ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                  <CheckCircle2 className="h-6 w-6 text-accent" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  Thanks, we&apos;ve got it!
                </h3>
                <p className="mt-2 max-w-xs font-body text-sm leading-6 text-muted">
                  Our sales team will reach out to you shortly regarding the{" "}
                  <span className="text-accent">{plan}</span> plan.
                </p>
                <Button className="mt-6" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wider text-accent">
                  {plan}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">
                  Let&apos;s get you started
                </h3>
                <p className="mt-1.5 font-body text-sm text-muted">
                  Share your details and our team will contact you shortly.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <ModalInput
                    id="inq-name"
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    required
                  />
                  <ModalInput
                    id="inq-phone"
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    required
                  />
                  <ModalInput
                    id="inq-email"
                    label="Email (optional)"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <div className="relative">
                    <textarea
                      id="inq-message"
                      rows={3}
                      placeholder=" "
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="peer w-full resize-none rounded-2xl border border-border bg-white/[0.04] px-5 pb-3 pt-6 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40"
                    />
                    <label
                      htmlFor="inq-message"
                      className="pointer-events-none absolute left-5 top-4 font-body text-sm text-muted transition-all duration-200 peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[11px]"
                    >
                      Message
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-red-400/25 bg-red-400/[0.08] px-4 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" strokeWidth={1.75} />
                      <p className="font-body text-xs leading-5 text-red-200/90">{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Request"
                    )}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full rounded-2xl border border-border bg-white/[0.04] px-5 pb-3 pt-6 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-5 top-4 font-body text-sm text-muted transition-all duration-200 peer-focus:top-2.5 peer-focus:text-[11px] peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[11px]"
      >
        {label}
      </label>
    </div>
  );
}
