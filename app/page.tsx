import type { Metadata } from "next";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/home/Hero";
import Services from "../components/home/Services";
import Coverage from "../components/home/Coverage";
import Tracking from "../components/home/Tracking";
import Business from "../components/home/Business";
import Pricing from "../components/home/Pricing";
import Contact from "../components/home/Contact";

export const metadata: Metadata = {
  title: "NexShip | Premium Courier & Logistics in Karachi, Pakistan",
  description:
    "Fast, secure and reliable courier solutions — live now in Karachi with real-time tracking. Expansion to other cities across Pakistan is coming soon.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Coverage />
      <Tracking />
      <Business />
      <Pricing />
      <Contact />
      <Footer />
    </>
  );
}