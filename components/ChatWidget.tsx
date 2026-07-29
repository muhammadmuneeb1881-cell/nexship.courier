"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open NexShip chat support"}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#050505] shadow-[0_0_0_4px_rgba(0,255,136,0.15),0_8px_24px_rgba(0,255,136,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95 md:h-16 md:w-16"
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.5} />
        ) : (
          <MessageCircle className="h-7 w-7" strokeWidth={2.2} />
        )}
        {!open && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-20" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-5 z-[60] w-[92vw] max-w-[420px] origin-bottom-right overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-200 ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
        style={{ height: "min(78vh, 640px)" }}
      >
        <iframe
          src="/nexship-chatbot.html"
          title="NexShip AI Support"
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </>
  );
}
