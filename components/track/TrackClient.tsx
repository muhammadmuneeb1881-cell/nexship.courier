"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PackageSearch,
  CircleDot,
  Truck,
  PackageCheck,
  XCircle,
  Loader2,
  AlertCircle,
  MapPin,
  Copy,
  Check,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";

type OrderStatus = "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

interface TrackedOrder {
  trackingId: string;
  status: OrderStatus;
  createdAt: string;
  packageType: string;
  weightKg: number;
  quantity: number;
  deliveryCity: string;
  deliveryAddress: string;
  receiverName: string;
  price: number;
}

const STEPS: { status: OrderStatus; label: string; icon: typeof CircleDot }[] = [
  { status: "Pending", label: "Booked", icon: CircleDot },
  { status: "Picked Up", label: "Picked Up", icon: PackageSearch },
  { status: "In Transit", label: "In Transit", icon: Truck },
  { status: "Delivered", label: "Delivered", icon: PackageCheck },
];

const STEP_INDEX: Record<OrderStatus, number> = {
  Pending: 0,
  "Picked Up": 1,
  "In Transit": 2,
  Delivered: 3,
  Cancelled: -1,
};

export default function TrackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [input, setInput] = useState(initialId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runSearch = useCallback(async (trackingId: string) => {
    const id = trackingId.trim();
    if (!id) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No order found with this tracking ID.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) runSearch(initialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.replace(`/track?id=${encodeURIComponent(input.trim())}`, { scroll: false });
    runSearch(input);
  };

  const handleCopy = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const activeIndex = order ? STEP_INDEX[order.status] : -1;
  const isCancelled = order?.status === "Cancelled";

  return (
    <>
      <Navbar />

      <main className="relative bg-base pt-40 pb-24 sm:pt-48">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(0,255,136,0.1),transparent_60%)]" />
        </div>

        <Container>
          <SectionHeading
            eyebrow="Track Your Order"
            title="Where's my"
            highlight="shipment?"
            description="Enter the tracking ID you received after booking to see its live status."
          />

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="e.g. NS-7K2F9Q"
                className="w-full rounded-full border border-border bg-white/[0.04] py-3.5 pl-12 pr-5 font-body text-sm uppercase text-white placeholder:text-muted/70 outline-none backdrop-blur-md transition-colors focus:border-accent/40"
              />
            </div>
            <Button type="submit" disabled={loading} className="shrink-0">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Track Now"
              )}
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-8 flex max-w-lg items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.06] px-5 py-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" strokeWidth={1.75} />
                <p className="font-body text-sm leading-6 text-red-200">{error}</p>
              </motion.div>
            )}

            {order && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto mt-10 max-w-2xl rounded-3xl border border-border bg-white/[0.04] p-5 backdrop-blur-xl sm:p-10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-body text-xs uppercase tracking-wider text-muted">
                      Tracking ID
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-display text-2xl font-bold tracking-tight text-accent">
                        {order.trackingId}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copy tracking ID"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-accent" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isCancelled ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-red-400/25 bg-red-400/10 px-3.5 py-1.5 font-body text-xs font-semibold text-red-300">
                      <XCircle className="h-3.5 w-3.5" />
                      Cancelled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 font-body text-xs font-semibold text-accent">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                      {order.status}
                    </span>
                  )}
                </div>

                {/* Timeline */}
                {!isCancelled && (
                  <div className="mt-10">
                    <div className="relative flex items-center justify-between">
                      <div className="absolute left-0 right-0 top-4 h-[2px] bg-border" />
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${(activeIndex / (STEPS.length - 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-4 h-[2px] bg-accent"
                      />
                      {STEPS.map((step, i) => {
                        const done = i <= activeIndex;
                        return (
                          <div
                            key={step.status}
                            className="relative z-10 flex flex-col items-center gap-2.5"
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                done
                                  ? "border-accent bg-accent text-[#050505]"
                                  : "border-border bg-[#0a0a0a] text-muted"
                              }`}
                            >
                              <step.icon className="h-3.5 w-3.5" strokeWidth={2} />
                            </div>
                            <p
                              className={`max-w-[64px] text-center font-body text-[10px] font-medium leading-tight sm:max-w-none sm:text-[11px] ${
                                done ? "text-white" : "text-muted"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <p className="mt-8 font-body text-sm leading-6 text-red-200/80">
                    This order was cancelled. If you think this is a mistake,
                    please contact our support team.
                  </p>
                )}

                {/* Details grid */}
                <div className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
                  <Detail label="Receiver" value={order.receiverName} />
                  <Detail
                    label="Delivery City"
                    value={order.deliveryCity.charAt(0).toUpperCase() + order.deliveryCity.slice(1)}
                    icon={<MapPin className="h-3.5 w-3.5 text-accent" />}
                  />
                  <Detail label="Delivery Address" value={order.deliveryAddress} />
                  <Detail label="Package Type" value={order.packageType} />
                  <Detail label="Weight" value={`${order.weightKg} kg × ${order.quantity}`} />
                  <Detail label="Booked On" value={new Date(order.createdAt).toLocaleString()} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>

      <Footer />
    </>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-body text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        {icon}
        <p className="font-body text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
