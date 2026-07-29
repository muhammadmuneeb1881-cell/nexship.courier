import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PRICING_FILE = path.join(DATA_DIR, "pricing.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

export type OrderStatus = "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  trackingId: string;
  createdAt: string;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  receiverName: string;
  receiverPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  packageType: string;
  weightKg: number;
  quantity: number;
  price: number;
  status: OrderStatus;
}

export interface PricingConfig {
  baseFee: number;
  perKgRate: number;
  packageTypeExtra: Record<string, number>;
  updatedAt: string;
}

export type InquiryStatus = "New" | "Contacted" | "Closed";

export interface Inquiry {
  id: string;
  createdAt: string;
  plan: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: InquiryStatus;
  emailSent: boolean;
}

export const PACKAGE_TYPES = ["Documents", "Parcel", "Fragile", "Electronics", "Food"];

const DEFAULT_PRICING: PricingConfig = {
  baseFee: 150,
  perKgRate: 60,
  packageTypeExtra: {
    Documents: 0,
    Parcel: 50,
    Fragile: 150,
    Electronics: 200,
    Food: 100,
  },
  updatedAt: new Date().toISOString(),
};

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]", "utf-8");
  if (!fs.existsSync(INQUIRIES_FILE)) fs.writeFileSync(INQUIRIES_FILE, "[]", "utf-8");
  if (!fs.existsSync(PRICING_FILE)) {
    fs.writeFileSync(PRICING_FILE, JSON.stringify(DEFAULT_PRICING, null, 2), "utf-8");
  }
}

// Simple in-process write queue so concurrent requests don't corrupt the JSON files.
let writeChain: Promise<unknown> = Promise.resolve();
function queueWrite<T>(fn: () => T): Promise<T> {
  const result = writeChain.then(fn, fn);
  writeChain = result.catch(() => undefined);
  return result;
}

export function getOrders(): Order[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

// Generates a random, unique tracking ID like "NS-7K2F9Q".
// Excludes visually-ambiguous characters (0/O, 1/I/L) so customers can read it out easily.
const TRACKING_ID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomTrackingSuffix(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TRACKING_ID_CHARS[Math.floor(Math.random() * TRACKING_ID_CHARS.length)];
  }
  return out;
}

export function generateTrackingId(): string {
  const existing = new Set(getOrders().map((o) => o.trackingId));
  let candidate = `NS-${randomTrackingSuffix()}`;
  while (existing.has(candidate)) {
    candidate = `NS-${randomTrackingSuffix()}`;
  }
  return candidate;
}

export function findOrderByTrackingId(trackingId: string): Order | null {
  const normalized = trackingId.trim().toUpperCase();
  const orders = getOrders();
  return orders.find((o) => o.trackingId.toUpperCase() === normalized) || null;
}

export function addOrder(order: Order): Promise<Order> {
  ensureDataFiles();
  return queueWrite(() => {
    const orders = getOrders();
    orders.unshift(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    return order;
  });
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  ensureDataFiles();
  return queueWrite(() => {
    const orders = getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], status };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    return orders[idx];
  });
}

export function deleteOrder(id: string): Promise<boolean> {
  ensureDataFiles();
  return queueWrite(() => {
    const orders = getOrders();
    const next = orders.filter((o) => o.id !== id);
    const changed = next.length !== orders.length;
    if (changed) fs.writeFileSync(ORDERS_FILE, JSON.stringify(next, null, 2), "utf-8");
    return changed;
  });
}

export function getPricing(): PricingConfig {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(PRICING_FILE, "utf-8");
    return JSON.parse(raw) as PricingConfig;
  } catch {
    return DEFAULT_PRICING;
  }
}

export function setPricing(config: PricingConfig): Promise<PricingConfig> {
  ensureDataFiles();
  return queueWrite(() => {
    fs.writeFileSync(PRICING_FILE, JSON.stringify(config, null, 2), "utf-8");
    return config;
  });
}

export function calculatePrice(params: {
  weightKg: number;
  quantity: number;
  packageType: string;
}): number {
  const pricing = getPricing();
  const extra = pricing.packageTypeExtra[params.packageType] ?? 0;
  const total =
    pricing.baseFee + pricing.perKgRate * params.weightKg * params.quantity + extra * params.quantity;
  return Math.round(total);
}

export function getInquiries(): Inquiry[] {
  ensureDataFiles();
  try {
    const raw = fs.readFileSync(INQUIRIES_FILE, "utf-8");
    return JSON.parse(raw) as Inquiry[];
  } catch {
    return [];
  }
}

export function addInquiry(inquiry: Inquiry): Promise<Inquiry> {
  ensureDataFiles();
  return queueWrite(() => {
    const inquiries = getInquiries();
    inquiries.unshift(inquiry);
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
    return inquiry;
  });
}

export function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry | null> {
  ensureDataFiles();
  return queueWrite(() => {
    const inquiries = getInquiries();
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    inquiries[idx] = { ...inquiries[idx], status };
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), "utf-8");
    return inquiries[idx];
  });
}

export function deleteInquiry(id: string): Promise<boolean> {
  ensureDataFiles();
  return queueWrite(() => {
    const inquiries = getInquiries();
    const next = inquiries.filter((i) => i.id !== id);
    const changed = next.length !== inquiries.length;
    if (changed) fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(next, null, 2), "utf-8");
    return changed;
  });
}
