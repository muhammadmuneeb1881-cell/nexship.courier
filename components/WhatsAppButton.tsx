"use client";

import { MessageCircle } from "lucide-react";

const DEFAULT_MESSAGE = "Hello, I need help with my shipment.";

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div className="group fixed bottom-5 right-5 z-[60]">
      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-1/2 right-full mr-3 translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-1.5 font-body text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
      >
        Chat with us on WhatsApp
      </span>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#050505] shadow-[0_0_0_4px_rgba(0,255,136,0.15),0_8px_24px_rgba(0,255,136,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 md:h-16 md:w-16"
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2.2} />
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-20" />
      </a>
    </div>
  );
}
