import type { Metadata } from "next";
import { Suspense } from "react";
import TrackClient from "../../components/track/TrackClient";

export const metadata: Metadata = {
  title: "Track Your Order | NexShip",
  description:
    "Track your NexShip courier order in real time using your NS- tracking ID.",
  alternates: {
    canonical: "/track",
  },
};

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackClient />
    </Suspense>
  );
}
