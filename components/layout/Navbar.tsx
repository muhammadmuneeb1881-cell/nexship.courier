"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, X, Menu } from "lucide-react";
import Button from "../ui/Button";
import Container from "../ui/Container";
import { KARACHI_NOTICE } from "../../lib/cities";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Tracking", href: "/track" },
  { label: "Business", href: "/#business" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Coverage", href: "/coverage" },
  { label: "Booking", href: "/booking" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y > lastY.current && y > 120) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-transform duration-500 ease-out ${
        hidden ? "-translate-y-[140%]" : "translate-y-0"
      }`}
    >
      {/* Site-wide Karachi service announcement */}
      {bannerOpen && (
        <div className="w-full border-b border-accent/20 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-4 py-2 sm:px-6">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2} />
            <p className="text-balance text-center font-body text-[11px] leading-4 text-white/85 sm:text-[12.5px]">
              {KARACHI_NOTICE}
            </p>
            <button
              type="button"
              aria-label="Dismiss announcement"
              onClick={() => setBannerOpen(false)}
              className="ml-1 shrink-0 rounded-full p-1 text-muted transition-colors duration-300 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-4 sm:px-6">
        <Container>
          <div
            className={`mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-border bg-white/[0.04] px-6 backdrop-blur-2xl transition-all duration-500 ${
              scrolled ? "shadow-[0_8px_40px_rgba(0,0,0,0.5)]" : ""
            }`}
          >
            <a href="/" className="font-display text-xl font-bold tracking-tight text-white">
              Nex<span className="text-accent">Ship</span>
            </a>

            <nav className="hidden items-center gap-7 lg:flex">
              {LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="group relative py-1 font-body text-sm text-muted transition-colors duration-300 hover:text-white"
                >
                  {label}
                  <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button href="/booking" className="hidden sm:inline-flex">Get Quote</Button>
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/[0.04] text-white transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.08] lg:hidden"
              >
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={`mx-auto max-w-6xl overflow-hidden transition-all duration-400 ease-out lg:hidden ${
              menuOpen ? "mt-3 max-h-[420px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="flex flex-col gap-1 rounded-3xl border border-border bg-white/[0.05] p-4 backdrop-blur-2xl">
              {LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 font-body text-sm text-muted transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                >
                  {label}
                </a>
              ))}
              <div className="mt-2 px-1">
                <Button href="/booking" className="w-full sm:hidden" onClick={() => setMenuOpen(false)}>Get Quote</Button>
              </div>
            </nav>
          </div>
        </Container>
      </div>
    </header>
  );
}
