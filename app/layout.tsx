import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import WhatsAppButton from "../components/WhatsAppButton";
import SupportPanel from "../components/SupportPanel";
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "NexShip | Premium Courier & Logistics in Karachi, Pakistan",
    template: "%s | NexShip",
  },
  description:
    "NexShip is Pakistan's premium courier platform, currently delivering across Karachi with real-time tracking. Expansion to other cities is coming soon.",
  keywords: [
    "courier Karachi",
    "NexShip",
    "logistics Pakistan",
    "same day delivery Karachi",
    "parcel tracking Karachi",
    "courier service Pakistan",
  ],
  metadataBase: new URL("https://nexship.pk"),
  openGraph: {
    title: "NexShip | Premium Courier & Logistics in Karachi, Pakistan",
    description:
      "Fast, secure and reliable courier solutions — live now in Karachi, expanding across Pakistan soon.",
    url: "https://nexship.pk",
    siteName: "NexShip",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexShip | Premium Courier & Logistics in Karachi, Pakistan",
    description:
      "Fast, secure and reliable courier solutions — live now in Karachi, expanding across Pakistan soon.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "bmpFV10w0TM2PUk2bbDn8Uq8sbeGgPpis4iFPZrigZQ",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        {children}
        <WhatsAppButton />
        <SupportPanel />
      </body>
    </html>
  );
}
