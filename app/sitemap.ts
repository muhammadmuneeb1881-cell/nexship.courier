import type { MetadataRoute } from "next";
import { CITIES } from "../lib/cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://nexship.pk";

  const staticRoutes = [
    "",
    "/booking",
    "/coverage",
    "/track",
    "/about",
    "/newsroom",
    "/sustainability",
    "/help",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // Every city stays indexed via the coverage page's query anchors,
  // keeping "coming soon" cities discoverable for SEO.
  const cityRoutes = CITIES.map((city) => ({
    url: `${base}/coverage#${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: city.status === "live" ? 0.9 : 0.5,
  }));

  return [...staticRoutes, ...cityRoutes];
}
