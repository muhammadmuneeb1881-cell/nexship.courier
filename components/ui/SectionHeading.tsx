"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto max-w-2xl ${isCenter ? "text-center" : "text-left"}`}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-1.5 font-body text-xs font-medium tracking-wide text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {eyebrow}
      </span>
      <h2 className="text-balance mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
        {title}{" "}
        {highlight && (
          <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>
      {description && (
        <p className="mt-5 font-body text-base leading-7 text-muted sm:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  );
}
