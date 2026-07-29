import { getSupabaseAdminClient } from "./supabase";

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

// ---- row <-> app object mappers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    trackingId: row.tracking_id,
    createdAt: row.created_at,
    senderName: row.sender_name,
    senderPhone: row.sender_phone,
    pickupAddress: row.pickup_address,
    receiverName: row.receiver_name,
    receiverPhone: row.receiver_phone,
    deliveryCity: row.delivery_city,
    deliveryAddress: row.delivery_address,
    packageType: row.package_type,
    weightKg: Number(row.weight_kg),
    quantity: Number(row.quantity),
    price: Number(row.price),
    status: row.status,
  };
}

function orderToRow(order: Order) {
  return {
    id: order.id,
    tracking_id: order.trackingId,
    created_at: order.createdAt,
    sender_name: order.senderName,
    sender_phone: order.senderPhone,
    pickup_address: order.pickupAddress,
    receiver_name: order.receiverName,
    receiver_phone: order.receiverPhone,
    delivery_city: order.deliveryCity,
    delivery_address: order.deliveryAddress,
    package_type: order.packageType,
    weight_kg: order.weightKg,
    quantity: order.quantity,
    price: order.price,
    status: order.status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToInquiry(row: any): Inquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    plan: row.plan,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    message: row.message || "",
    status: row.status,
    emailSent: row.email_sent,
  };
}

function inquiryToRow(inquiry: Inquiry) {
  return {
    id: inquiry.id,
    created_at: inquiry.createdAt,
    plan: inquiry.plan,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    message: inquiry.message,
    status: inquiry.status,
    email_sent: inquiry.emailSent,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPricing(row: any): PricingConfig {
  return {
    baseFee: Number(row.base_fee),
    perKgRate: Number(row.per_kg_rate),
    packageTypeExtra: row.package_type_extra || DEFAULT_PRICING.packageTypeExtra,
    updatedAt: row.updated_at,
  };
}

// ---- ORDERS ----

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToOrder);
}

const TRACKING_ID_CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomTrackingSuffix(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TRACKING_ID_CHARS[Math.floor(Math.random() * TRACKING_ID_CHARS.length)];
  }
  return out;
}

export async function generateTrackingId(): Promise<string> {
  const supabase = getSupabaseAdminClient();
  let candidate = `NS-${randomTrackingSuffix()}`;
  // Retry until we find one that isn't already taken.
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await supabase
      .from("orders")
      .select("id")
      .eq("tracking_id", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `NS-${randomTrackingSuffix()}`;
  }
  return candidate;
}

export async function findOrderByTrackingId(trackingId: string): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  const normalized = trackingId.trim().toUpperCase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("tracking_id", normalized)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : null;
}

export async function addOrder(order: Order): Promise<Order> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert(orderToRow(order))
    .select()
    .single();
  if (error) throw error;
  return rowToOrder(data);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count || 0) > 0;
}

// ---- PRICING ----

export async function getPricing(): Promise<PricingConfig> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("pricing").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data ? rowToPricing(data) : DEFAULT_PRICING;
}

export async function setPricing(config: PricingConfig): Promise<PricingConfig> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("pricing")
    .upsert({
      id: 1,
      base_fee: config.baseFee,
      per_kg_rate: config.perKgRate,
      package_type_extra: config.packageTypeExtra,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPricing(data);
}

export async function calculatePrice(params: {
  weightKg: number;
  quantity: number;
  packageType: string;
}): Promise<number> {
  const pricing = await getPricing();
  const extra = pricing.packageTypeExtra[params.packageType] ?? 0;
  const total =
    pricing.baseFee + pricing.perKgRate * params.weightKg * params.quantity + extra * params.quantity;
  return Math.round(total);
}

// ---- INQUIRIES ----

export async function getInquiries(): Promise<Inquiry[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToInquiry);
}

export async function addInquiry(inquiry: Inquiry): Promise<Inquiry> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .insert(inquiryToRow(inquiry))
    .select()
    .single();
  if (error) throw error;
  return rowToInquiry(data);
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToInquiry(data) : null;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { error, count } = await supabase
    .from("inquiries")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count || 0) > 0;
}
