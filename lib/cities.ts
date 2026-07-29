export type CityStatus = "live" | "coming-soon";

export interface City {
  slug: string;
  name: string;
  province: string;
  status: CityStatus;
}

// Single source of truth for service coverage across the entire site.
// Karachi is the only city currently live. Every other city stays listed
// (per business requirement) but is clearly flagged as "Coming Soon".
export const CITIES: City[] = [
  { slug: "karachi", name: "Karachi", province: "Sindh", status: "live" },
  { slug: "lahore", name: "Lahore", province: "Punjab", status: "coming-soon" },
  { slug: "islamabad", name: "Islamabad", province: "Federal", status: "coming-soon" },
  { slug: "rawalpindi", name: "Rawalpindi", province: "Punjab", status: "coming-soon" },
  { slug: "faisalabad", name: "Faisalabad", province: "Punjab", status: "coming-soon" },
  { slug: "multan", name: "Multan", province: "Punjab", status: "coming-soon" },
  { slug: "hyderabad", name: "Hyderabad", province: "Sindh", status: "coming-soon" },
  { slug: "peshawar", name: "Peshawar", province: "KPK", status: "coming-soon" },
  { slug: "quetta", name: "Quetta", province: "Balochistan", status: "coming-soon" },
  { slug: "sialkot", name: "Sialkot", province: "Punjab", status: "coming-soon" },
  { slug: "gujranwala", name: "Gujranwala", province: "Punjab", status: "coming-soon" },
  { slug: "sukkur", name: "Sukkur", province: "Sindh", status: "coming-soon" },
];

export const LIVE_CITY = CITIES.find((c) => c.status === "live")!;
export const COMING_SOON_CITIES = CITIES.filter((c) => c.status === "coming-soon");

export const KARACHI_NOTICE =
  "We currently provide courier services only within Karachi. Expansion to other cities across Pakistan is coming soon.";
