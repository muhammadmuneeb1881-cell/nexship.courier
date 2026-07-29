import type { Metadata } from "next";
import BookingForm from "../../components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Book a Courier | NexShip Karachi Delivery",
  description:
    "Book a courier pickup and delivery within Karachi with NexShip. Other cities across Pakistan are coming soon — join the waitlist today.",
  keywords: [
    "book courier Karachi",
    "NexShip booking",
    "courier pickup Karachi",
    "same day delivery Karachi",
  ],
  alternates: {
    canonical: "/booking",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Book a Courier | NexShip Karachi Delivery",
    description:
      "Schedule a Karachi courier pickup in minutes with NexShip's premium logistics platform.",
    url: "/booking",
    type: "website",
  },
};

export default function BookingPage() {
  return <BookingForm />;
}
