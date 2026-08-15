"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, PackageCheck, Copy, Check, Banknote, Truck, Download, MapPin, Store } from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import Button from "../ui/Button";
import CitySelect from "../shared/CitySelect";
import CityBadge from "../shared/CityBadge";
import { CITIES, LIVE_CITY, PICKUP_CHARGE } from "../../lib/cities";
import { openSlip } from "../../lib/slip";
import { computeWeightCharge } from "../../lib/pricing";

interface FormState {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  pickupAddress: string;
  receiverName: string;
  receiverPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  packageType: string;
  weightKg: string;
  quantity: string;
  parcelValue: string;
}

interface PricingConfig {
  baseFee: number;
  perKgRate: number;
  packageTypeExtra: Record<string, number>;
}

const INITIAL: FormState = {
  senderName: "",
  senderPhone: "",
  senderEmail: "",
  pickupAddress: "",
  receiverName: "",
  receiverPhone: "",
  deliveryCity: LIVE_CITY.slug,
  deliveryAddress: "",
  packageType: "Documents",
  weightKg: "1",
  quantity: "1",
  parcelValue: "",
};

export default function BookingForm() {
  const [orderType, setOrderType] = useState<"cod" | "normal">("cod");
  const [values, setValues] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [requiresPickup, setRequiresPickup] = useState(true);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    trackingId: string;
    createdAt: string;
    deliveryCharges: number;
    parcelValue: number;
    pickupCharges: number;
    requiresPickup: boolean;
    isCod: boolean;
    price: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);

  const selectedCity = CITIES.find((c) => c.slug === values.deliveryCity);
  const isBookable = selectedCity?.status === "live";
  const isCod = orderType === "cod";

  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => setPricing(data.pricing))
      .catch(() => setPricing(null));
  }, []);

  const weightNum = parseFloat(values.weightKg) || 0;
  const qtyNum = parseInt(values.quantity, 10) || 0;
  const parcelValueNum = parseFloat(values.parcelValue) || 0;
  const pickupCharges = requiresPickup ? PICKUP_CHARGE : 0;
  const deliveryCharges = pricing
    ? Math.round(
        pricing.baseFee +
          computeWeightCharge(weightNum) * qtyNum +
          (pricing.packageTypeExtra[values.packageType] || 0) * qtyNum
      ) + pickupCharges
    : null;
  const codAmount = isCod ? parcelValueNum : 0;
  const totalAmount = deliveryCharges !== null ? deliveryCharges + codAmount : null;

  const update = (field: keyof FormState, value: string) =>
    setValues((s) => ({ ...s, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (submitted) {
      setValues(INITIAL);
      setOrderType("cod");
      setRequiresPickup(true);
      setSubmitted(false);
      setConfirmedOrder(null);
      return;
    }

    if (!isBookable) return;
    if (isCod && (!values.parcelValue || parcelValueNum <= 0)) {
      setErrorMsg("Please enter the parcel price to collect from the receiver.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          weightKg: weightNum,
          quantity: qtyNum,
          isCod,
          parcelValue: isCod ? parcelValueNum : 0,
          requiresPickup,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setConfirmedOrder({
        trackingId: data.order.trackingId,
        createdAt: data.order.createdAt,
        deliveryCharges: data.order.deliveryCharges,
        parcelValue: data.order.parcelValue,
        pickupCharges: data.order.pickupCharges,
        requiresPickup: data.order.requiresPickup,
        isCod: data.order.isCod,
        price: data.order.price,
      });
      setSubmitted(true);
    } catch {
      setErrorMsg("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadSlip = () => {
    if (!confirmedOrder) return;
    openSlip({
      trackingId: confirmedOrder.trackingId,
      createdAt: confirmedOrder.createdAt,
      senderName: values.senderName,
      senderPhone: values.senderPhone,
      pickupAddress: values.pickupAddress,
      receiverName: values.receiverName,
      receiverPhone: values.receiverPhone,
      deliveryCity: selectedCity?.name || values.deliveryCity,
      deliveryAddress: values.deliveryAddress,
      packageType: values.packageType,
      weightKg: weightNum,
      quantity: qtyNum,
      requiresPickup: confirmedOrder.requiresPickup,
      pickupCharges: confirmedOrder.pickupCharges,
      deliveryCharges: confirmedOrder.deliveryCharges,
      parcelValue: confirmedOrder.parcelValue,
      isCod: confirmedOrder.isCod,
      price: confirmedOrder.price,
    });
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
            eyebrow="Book a Shipment"
            title="Schedule your"
            highlight="Karachi pickup."
            description="Fill in the details below. Pickup is available across Karachi; delivery within the city is confirmed instantly."
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-14 max-w-3xl rounded-3xl border border-border bg-white/[0.04] p-5 backdrop-blur-xl sm:p-10"
          >
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-3.5">
              <p className="font-body text-xs leading-5 text-white/90 sm:text-sm">
                Pickup city: <span className="font-semibold text-accent">Karachi</span>
              </p>
              <CityBadge status="live" />
            </div>

            <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Booking Type
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setOrderType("cod")}
                className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  isCod
                    ? "border-accent/50 bg-accent/[0.08]"
                    : "border-border bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <Banknote className={`mt-0.5 h-5 w-5 shrink-0 ${isCod ? "text-accent" : "text-muted"}`} strokeWidth={1.75} />
                <span>
                  <span className="block font-display text-sm font-semibold text-white">Cash on Delivery (COD)</span>
                  <span className="mt-0.5 block font-body text-xs leading-5 text-muted">
                    We collect the parcel price + delivery charges from the receiver on your behalf.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType("normal")}
                className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  !isCod
                    ? "border-sky-400/50 bg-sky-400/[0.08]"
                    : "border-border bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <Truck className={`mt-0.5 h-5 w-5 shrink-0 ${!isCod ? "text-sky-300" : "text-muted"}`} strokeWidth={1.75} />
                <span>
                  <span className="block font-display text-sm font-semibold text-white">Normal Delivery (Prepaid)</span>
                  <span className="mt-0.5 block font-body text-xs leading-5 text-muted">
                    You&apos;ve already been paid — nothing is collected from the receiver.
                  </span>
                </span>
              </button>
            </div>

            <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Pickup
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRequiresPickup(true)}
                className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  requiresPickup
                    ? "border-accent/50 bg-accent/[0.08]"
                    : "border-border bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <Truck className={`mt-0.5 h-5 w-5 shrink-0 ${requiresPickup ? "text-accent" : "text-muted"}`} strokeWidth={1.75} />
                <span>
                  <span className="block font-display text-sm font-semibold text-white">
                    Pickup from my address
                  </span>
                  <span className="mt-0.5 block font-body text-xs leading-5 text-muted">
                    Our rider collects the parcel from you. Rs {PICKUP_CHARGE} flat, anywhere in Karachi.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRequiresPickup(false)}
                className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  !requiresPickup
                    ? "border-sky-400/50 bg-sky-400/[0.08]"
                    : "border-border bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <Store className={`mt-0.5 h-5 w-5 shrink-0 ${!requiresPickup ? "text-sky-300" : "text-muted"}`} strokeWidth={1.75} />
                <span>
                  <span className="block font-display text-sm font-semibold text-white">
                    I&apos;ll drop it off myself
                  </span>
                  <span className="mt-0.5 block font-body text-xs leading-5 text-muted">
                    No pickup fee — bring the parcel to our office yourself.
                  </span>
                </span>
              </button>
            </div>

            <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Sender Details
            </h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <FloatingField
                id="senderName"
                label="Full Name"
                value={values.senderName}
                onChange={(v) => update("senderName", v)}
              />
              <FloatingField
                id="senderPhone"
                label="Phone Number"
                type="tel"
                value={values.senderPhone}
                onChange={(v) => update("senderPhone", v)}
              />
              <div className="sm:col-span-2">
                <FloatingField
                  id="senderEmail"
                  label="Email Address"
                  type="email"
                  value={values.senderEmail}
                  onChange={(v) => update("senderEmail", v)}
                />
              </div>
              <div className="sm:col-span-2">
                <FloatingField
                  id="pickupAddress"
                  label={requiresPickup ? "Pickup Address (Karachi)" : "Your Address (Karachi)"}
                  value={values.pickupAddress}
                  onChange={(v) => update("pickupAddress", v)}
                />
                <p className="mt-1.5 flex items-center gap-1.5 font-body text-[11px] leading-4 text-muted">
                  <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                  {requiresPickup
                    ? "Our rider will collect the parcel from this address."
                    : "For our records — you'll drop the parcel off at our office."}
                </p>
              </div>
            </div>

            <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Receiver Details
            </h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <FloatingField
                id="receiverName"
                label="Full Name"
                value={values.receiverName}
                onChange={(v) => update("receiverName", v)}
              />
              <FloatingField
                id="receiverPhone"
                label="Phone Number"
                type="tel"
                value={values.receiverPhone}
                onChange={(v) => update("receiverPhone", v)}
              />
              <div className="sm:col-span-2">
                <CitySelect
                  id="deliveryCity"
                  label="Delivery City"
                  value={values.deliveryCity}
                  onChange={(v) => update("deliveryCity", v)}
                />
              </div>
              <div className="sm:col-span-2">
                <FloatingField
                  id="deliveryAddress"
                  label="Delivery Address"
                  value={values.deliveryAddress}
                  onChange={(v) => update("deliveryAddress", v)}
                />
              </div>
            </div>

            <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Package
            </h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <div className="relative">
                <select
                  id="packageType"
                  value={values.packageType}
                  onChange={(e) => update("packageType", e.target.value)}
                  className="peer w-full appearance-none rounded-2xl border border-border bg-white/[0.04] px-5 pb-3 pt-6 font-body text-sm text-white outline-none backdrop-blur-md transition-colors focus:border-accent/40"
                >
                  {["Documents", "Parcel", "Fragile", "Electronics", "Food"].map((t) => (
                    <option key={t} value={t} className="bg-[#0a0a0a]">
                      {t}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="packageType"
                  className="pointer-events-none absolute left-5 top-2.5 font-body text-[11px] text-accent"
                >
                  Package Type
                </label>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted">
                  ▾
                </span>
              </div>

              <FloatingField
                id="weightKg"
                label="Weight (kg)"
                type="number"
                value={values.weightKg}
                onChange={(v) => update("weightKg", v)}
              />

              <FloatingField
                id="quantity"
                label="Quantity"
                type="number"
                value={values.quantity}
                onChange={(v) => update("quantity", v)}
              />

              {isCod && (
                <div className="sm:col-span-3">
                  <FloatingField
                    id="parcelValue"
                    label="Parcel Price (Rs) — amount to collect from receiver"
                    type="number"
                    value={values.parcelValue}
                    onChange={(v) => update("parcelValue", v)}
                  />
                </div>
              )}
            </div>

            {deliveryCharges !== null && (
              <div className="mt-5 space-y-2 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-4">
                {isCod && (
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs text-white/70 sm:text-sm">COD Amount (Parcel Price)</p>
                    <p className="font-body text-sm font-medium text-white">Rs {codAmount.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-white/70 sm:text-sm">Delivery Charges</p>
                  <p className="font-body text-sm font-medium text-white">Rs {deliveryCharges.toLocaleString()}</p>
                </div>
                {requiresPickup && (
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs text-white/70 sm:text-sm">— incl. Pickup Charges (Karachi)</p>
                    <p className="font-body text-sm font-medium text-white">Rs {pickupCharges.toLocaleString()}</p>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-accent/15 pt-2">
                  <p className="font-body text-xs text-white/90 sm:text-sm">
                    {isCod ? "Total to Collect from Receiver" : "Total (Prepaid)"}
                  </p>
                  <p className="font-display text-lg font-semibold text-accent">
                    Rs {(totalAmount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.06] px-5 py-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" strokeWidth={1.75} />
                <p className="font-body text-xs leading-5 text-red-200 sm:text-sm">{errorMsg}</p>
              </div>
            )}

            <div className="mt-8">
              {!isBookable ? (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" strokeWidth={1.75} />
                  <div>
                    <p className="font-body text-sm font-semibold text-amber-200">
                      Service in your city is coming soon.
                    </p>
                    <p className="mt-1 font-body text-xs leading-5 text-amber-200/80">
                      Booking is disabled for {selectedCity?.name}. We currently
                      deliver only within Karachi — choose Karachi above to
                      continue, or join the waitlist on our coverage page.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-4">
                  <PackageCheck className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <p className="font-body text-xs leading-5 text-white/90 sm:text-sm">
                    Great news — booking is open for Karachi deliveries.
                  </p>
                </div>
              )}
            </div>

            {submitted && confirmedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.06]"
              >
                <div className="flex items-center gap-3 border-b border-accent/15 px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <p className="font-body text-xs leading-5 text-white/90 sm:text-sm">
                    Booking confirmed! {confirmedOrder.isCod ? "Total to collect" : "Total (prepaid)"}:{" "}
                    <span className="font-semibold text-accent">
                      Rs {confirmedOrder.price.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-wider text-muted">
                      Your Tracking ID
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-display text-xl font-bold tracking-tight text-accent">
                        {confirmedOrder.trackingId}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(confirmedOrder.trackingId);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1800);
                        }}
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
                    <p className="mt-1.5 font-body text-[11px] leading-4 text-muted">
                      Save this ID to track your order anytime.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadSlip}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-white/[0.1]"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      {confirmedOrder.isCod ? "Download COD Slip" : "Download Slip"}
                    </button>
                    <a
                      href={`/track?id=${encodeURIComponent(confirmedOrder.trackingId)}`}
                      className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-body text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
                    >
                      Track this order →
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-7">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={!isBookable || submitting}
              >
                {submitting ? (
                  "Booking..."
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Book Another
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </motion.form>
        </Container>
      </main>

      <Footer />
    </>
  );
}

function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
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
