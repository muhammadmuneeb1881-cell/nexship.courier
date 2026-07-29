import type { Metadata } from "next";
import CoveragePageClient from "../../components/coverage/CoveragePageClient";

export const metadata: Metadata = {
  title: "Delivery Coverage Areas | NexShip Courier Pakistan",
  description:
    "NexShip currently delivers within Karachi, Pakistan. Explore our full city coverage map and see which cities are coming soon across Pakistan.",
  keywords: [
    "NexShip coverage",
    "courier Karachi",
    "delivery cities Pakistan",
    "courier service Pakistan",
    "coming soon courier cities",
  ],
  alternates: {
    canonical: "/coverage",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Delivery Coverage Areas | NexShip Courier Pakistan",
    description:
      "See where NexShip delivers today and which cities across Pakistan are coming soon.",
    url: "/coverage",
    type: "website",
  },
};

export default function CoveragePage() {
  return <CoveragePageClient />;
}
