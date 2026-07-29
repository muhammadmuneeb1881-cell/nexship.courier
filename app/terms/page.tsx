import type { Metadata } from "next";
import PageShell from "../../components/shared/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service | NexShip",
  description: "Terms and conditions for using NexShip's courier services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of"
      highlight="Service."
      description="Last updated: July 2026"
    >
      <div className="space-y-8 font-body text-sm leading-7 text-muted">
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Service area
          </h2>
          <p>
            NexShip currently provides courier services only within Karachi,
            Pakistan. Bookings to other cities are not yet available and will
            be enabled as we expand.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Booking &amp; pricing
          </h2>
          <p>
            Prices are calculated at the time of booking based on weight,
            quantity and package type, and are shown to you before you confirm
            an order. Prices may be updated by NexShip at any time going
            forward.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Prohibited items
          </h2>
          <p>
            Customers may not ship illegal, hazardous, or restricted items
            through NexShip. We reserve the right to refuse or cancel any
            shipment that violates this policy.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Liability
          </h2>
          <p>
            NexShip takes reasonable care with every shipment, but is not
            liable for delays caused by circumstances outside our control
            (e.g. weather, road closures, incorrect address information).
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Contact us
          </h2>
          <p>
            Questions about these terms? Email us at{" "}
            <a href="mailto:nexship.courier@gmail.com" className="text-accent hover:text-emerald-300">
              nexship.courier@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
