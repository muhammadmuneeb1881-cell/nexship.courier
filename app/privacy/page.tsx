import type { Metadata } from "next";
import PageShell from "../../components/shared/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | NexShip",
  description: "How NexShip collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy"
      highlight="Policy."
      description="Last updated: July 2026"
    >
      <div className="space-y-8 font-body text-sm leading-7 text-muted">
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Information we collect
          </h2>
          <p>
            When you book a delivery or submit an inquiry, we collect the
            details you provide — sender and receiver names, phone numbers,
            addresses, package information, and any message you send us.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            How we use it
          </h2>
          <p>
            We use this information solely to process your booking, provide
            tracking updates, respond to your inquiries, and improve our
            service. We do not sell your information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Data security
          </h2>
          <p>
            Access to customer data is restricted to authorized NexShip staff
            through a secured admin panel. Reasonable technical measures are
            in place to protect your information from unauthorized access.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-display text-base font-semibold text-white">
            Contact us
          </h2>
          <p>
            Questions about this policy? Email us at{" "}
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
