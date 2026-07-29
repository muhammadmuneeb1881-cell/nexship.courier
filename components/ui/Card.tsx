"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function Card({ children, className = "", delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-3xl border border-border bg-white/[0.04] p-8 backdrop-blur-xl transition-all duration-500 hover:border-accent/30 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_-15px_rgba(0,255,136,0.25)] ${className}`}
    >
      {/* gradient border glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(0,255,136,0.15),transparent_40%,transparent_60%,rgba(0,255,136,0.1))]" />
      </div>
      {/* corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
