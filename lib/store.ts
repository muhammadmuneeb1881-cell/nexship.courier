import { getSupabaseAdminClient } from "./supabase";
import { PICKUP_CHARGE } from "./cities";

export type OrderStatus = "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  trackingId: string;
  createdAt: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  pickupAddress: string;
  receiverName: string;
  receiverPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  packageType: string;
  weightKg: number;
  quantity: number;
  /** true = customer wants NexShip to collect the parcel from pickupAddress (+ pickupCharges). false = customer will drop it off themselves. */
  requiresPickup: boolean;
  /** Flat pickup fee (PICKUP_CHARGE) when requiresPickup is true, else 0. Already included inside deliveryCharges. */
  pickupCharges: number;
  /** Delivery service fee (weight/quantity/package-type based) + pickupCharges when requested. */
  deliveryCharges: number;
  /** Value of the parcel to collect from the receiver. 0 when isCod is false. */
  parcelValue: number;
  /** true = Cash on Delivery (amount collected from receiver on delivery). false = Normal/Prepaid. */
  isCod: boolean;
  /** Total amount = deliveryCharges + parcelValue. Kept for backwards compatibility. */
  price: number;
  status: OrderStatus;
  merchantId: string | null;
  codStatus: CodStatus;
  codCollectedAt: string | null;
  codRemittedAt: string | null;
}

export type CodStatus = "Pending" | "Collected" | "Remitted";

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
  baseFee: 0,
  perKgRate: 250,
  packageTypeExtra: {
    Documents: 0,
    Parcel: 0,
    Fragile: 0,
    Electronics: 0,
    Food: 0,
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
    senderEmail: row.sender_email || "",
    pickupAddress: row.pickup_address,
    receiverName: row.receiver_name,
    receiverPhone: row.receiver_phone,
    deliveryCity: row.delivery_city,
    deliveryAddress: row.delivery_address,
    packageType: row.package_type,
    weightKg: Number(row.weight_kg),
    quantity: Number(row.quantity),
    requiresPickup: row.requires_pickup != null ? Boolean(row.requires_pickup) : true,
    pickupCharges: row.pickup_charges != null ? Number(row.pickup_charges) : 0,
    deliveryCharges: row.delivery_charges != null ? Number(row.delivery_charges) : Number(row.price),
    parcelValue: row.parcel_value != null ? Number(row.parcel_value) : 0,
    isCod: row.is_cod != null ? Boolean(row.is_cod) : true,
    price: Number(row.price),
    status: row.status,
    merchantId: row.merchant_id ?? null,
    codStatus: (row.cod_status as CodStatus) ?? "Pending",
    codCollectedAt: row.cod_collected_at ?? null,
    codRemittedAt: row.cod_remitted_at ?? null,
  };
}

function orderToRow(order: Order) {
  return {
    id: order.id,
    tracking_id: order.trackingId,
    created_at: order.createdAt,
    sender_name: order.senderName,
    sender_phone: order.senderPhone,
    sender_email: order.senderEmail,
    pickup_address: order.pickupAddress,
    receiver_name: order.receiverName,
    receiver_phone: order.receiverPhone,
    delivery_city: order.deliveryCity,
    delivery_address: order.deliveryAddress,
    package_type: order.packageType,
    weight_kg: order.weightKg,
    quantity: order.quantity,
    requires_pickup: order.requiresPickup,
    pickup_charges: order.pickupCharges,
    delivery_charges: order.deliveryCharges,
    parcel_value: order.parcelValue,
    is_cod: order.isCod,
    price: order.price,
    status: order.status,
    merchant_id: order.merchantId,
    cod_status: order.codStatus,
    cod_collected_at: order.codCollectedAt,
    cod_remitted_at: order.codRemittedAt,
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

// Computes the delivery service fee only (based on weight/quantity/package
// type). Does NOT include the pickup fee — use calculateOrderAmounts for the
// full breakdown. Kept under its original name so existing callers keep
// working.
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

/**
 * Full price breakdown for a booking: delivery charges (service fee, which
 * includes the flat pickup fee when requested), parcel value (COD
 * collection amount, 0 for Normal/Prepaid bookings), the pickup fee itself,
 * and the total amount to be received from the customer.
 */
export async function calculateOrderAmounts(params: {
  weightKg: number;
  quantity: number;
  packageType: string;
  isCod: boolean;
  parcelValue: number;
  requiresPickup: boolean;
}): Promise<{ deliveryCharges: number; parcelValue: number; pickupCharges: number; total: number }> {
  const baseDeliveryCharges = await calculatePrice(params);
  const pickupCharges = params.requiresPickup ? PICKUP_CHARGE : 0;
  const deliveryCharges = baseDeliveryCharges + pickupCharges;
  const parcelValue = params.isCod ? Math.round(params.parcelValue) : 0;
  return { deliveryCharges, parcelValue, pickupCharges, total: deliveryCharges + parcelValue };
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

// ---- COD ----

export async function updateOrderCod(
  id: string,
  codStatus: CodStatus
): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  const patch: Record<string, unknown> = { cod_status: codStatus };
  if (codStatus === "Collected") patch.cod_collected_at = new Date().toISOString();
  if (codStatus === "Remitted") patch.cod_remitted_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : null;
}

export async function getOrdersByMerchant(merchantId: string): Promise<Order[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data) : null;
}

// ============================================================
// MERCHANTS
// ============================================================

export type MerchantStatus = "Active" | "Suspended";

export interface Merchant {
  id: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  ntn: string | null;
  strn: string | null;
  pickupAddress: string | null;
  passwordHash: string;
  status: MerchantStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export type MerchantPublic = Omit<Merchant, "passwordHash">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMerchant(row: any): Merchant {
  return {
    id: row.id,
    companyName: row.company_name,
    ownerName: row.owner_name,
    phone: row.phone,
    email: row.email,
    ntn: row.ntn ?? null,
    strn: row.strn ?? null,
    pickupAddress: row.pickup_address ?? null,
    passwordHash: row.password_hash,
    status: row.status,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at ?? null,
  };
}

export function toMerchantPublic(m: Merchant): MerchantPublic {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = m;
  return rest;
}

export async function getMerchants(): Promise<Merchant[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToMerchant);
}

export async function getMerchantById(id: string): Promise<Merchant | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("merchants").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToMerchant(data) : null;
}

export async function getMerchantByEmail(email: string): Promise<Merchant | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .ilike("email", email.trim())
    .maybeSingle();
  if (error) throw error;
  return data ? rowToMerchant(data) : null;
}

export async function createMerchant(input: {
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  ntn?: string;
  strn?: string;
  pickupAddress?: string;
  passwordHash: string;
}): Promise<Merchant> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .insert({
      company_name: input.companyName,
      owner_name: input.ownerName,
      phone: input.phone,
      email: input.email.trim().toLowerCase(),
      ntn: input.ntn || null,
      strn: input.strn || null,
      pickup_address: input.pickupAddress || null,
      password_hash: input.passwordHash,
      status: "Active",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToMerchant(data);
}

export async function updateMerchantStatus(
  id: string,
  status: MerchantStatus
): Promise<Merchant | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .update({ status })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToMerchant(data) : null;
}

export async function updateMerchantPassword(
  id: string,
  passwordHash: string
): Promise<Merchant | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .update({ password_hash: passwordHash })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToMerchant(data) : null;
}

export async function touchMerchantLogin(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase.from("merchants").update({ last_login_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteMerchant(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { error, count } = await supabase.from("merchants").delete({ count: "exact" }).eq("id", id);
  if (error) throw error;
  return (count || 0) > 0;
}

// ============================================================
// RETURNS
// ============================================================

export type ReturnStatus =
  | "Requested"
  | "Approved"
  | "In Transit"
  | "Received"
  | "Refunded"
  | "Rejected";

export interface ReturnTimelineEntry {
  status: string;
  note?: string;
  at: string;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  merchantId: string | null;
  reason: string;
  status: ReturnStatus;
  redeliveryRequested: boolean;
  redeliveryAddress: string | null;
  timeline: ReturnTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToReturn(row: any): ReturnRecord {
  return {
    id: row.id,
    orderId: row.order_id,
    merchantId: row.merchant_id ?? null,
    reason: row.reason,
    status: row.status,
    redeliveryRequested: row.redelivery_requested,
    redeliveryAddress: row.redelivery_address ?? null,
    timeline: row.timeline || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getReturns(merchantId?: string): Promise<ReturnRecord[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("returns").select("*").order("created_at", { ascending: false });
  if (merchantId) query = query.eq("merchant_id", merchantId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(rowToReturn);
}

export async function createReturn(input: {
  orderId: string;
  merchantId: string | null;
  reason: string;
  redeliveryRequested: boolean;
  redeliveryAddress?: string;
}): Promise<ReturnRecord> {
  const supabase = getSupabaseAdminClient();
  const timeline: ReturnTimelineEntry[] = [
    { status: "Requested", note: "Return requested", at: new Date().toISOString() },
  ];
  const { data, error } = await supabase
    .from("returns")
    .insert({
      order_id: input.orderId,
      merchant_id: input.merchantId,
      reason: input.reason,
      status: "Requested",
      redelivery_requested: input.redeliveryRequested,
      redelivery_address: input.redeliveryAddress || null,
      timeline,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToReturn(data);
}

export async function updateReturnStatus(
  id: string,
  status: ReturnStatus,
  note?: string
): Promise<ReturnRecord | null> {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("returns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!existing) return null;

  const timeline: ReturnTimelineEntry[] = [
    ...(existing.timeline || []),
    { status, note, at: new Date().toISOString() },
  ];

  const { data, error } = await supabase
    .from("returns")
    .update({ status, timeline, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToReturn(data) : null;
}

export async function setReturnRedelivery(
  id: string,
  redeliveryAddress: string
): Promise<ReturnRecord | null> {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: fetchErr } = await supabase
    .from("returns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  if (!existing) return null;

  const timeline: ReturnTimelineEntry[] = [
    ...(existing.timeline || []),
    { status: existing.status, note: "Redelivery requested", at: new Date().toISOString() },
  ];

  const { data, error } = await supabase
    .from("returns")
    .update({
      redelivery_requested: true,
      redelivery_address: redeliveryAddress,
      timeline,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToReturn(data) : null;
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export type NotificationCategory = "order" | "pickup" | "cod" | "system";
export type NotificationRecipient = "admin" | "merchant";

export interface AppNotification {
  id: string;
  recipientType: NotificationRecipient;
  merchantId: string | null;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToNotification(row: any): AppNotification {
  return {
    id: row.id,
    recipientType: row.recipient_type,
    merchantId: row.merchant_id ?? null,
    category: row.category,
    title: row.title,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function createNotification(input: {
  recipientType: NotificationRecipient;
  merchantId?: string | null;
  category: NotificationCategory;
  title: string;
  message: string;
}): Promise<AppNotification> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_type: input.recipientType,
      merchant_id: input.merchantId || null,
      category: input.category,
      title: input.title,
      message: input.message,
      read: false,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToNotification(data);
}

export async function getNotifications(
  recipient: { role: "admin" } | { role: "merchant"; merchantId: string }
): Promise<AppNotification[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  query =
    recipient.role === "admin"
      ? query.eq("recipient_type", "admin")
      : query.eq("recipient_type", "merchant").eq("merchant_id", recipient.merchantId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(rowToNotification);
}

export async function markNotificationRead(id: string): Promise<AppNotification | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToNotification(data) : null;
}

export async function markAllNotificationsRead(
  recipient: { role: "admin" } | { role: "merchant"; merchantId: string }
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("notifications").update({ read: true });
  query =
    recipient.role === "admin"
      ? query.eq("recipient_type", "admin")
      : query.eq("recipient_type", "merchant").eq("merchant_id", recipient.merchantId);
  const { error } = await query;
  if (error) throw error;
}

// ============================================================
// SUPPORT TICKETS (replaces the old AI chat widget)
// ============================================================

export type TicketStatus = "Open" | "In Progress" | "Closed";

export interface SupportTicket {
  id: string;
  merchantId: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTicket(row: any): SupportTicket {
  return {
    id: row.id,
    merchantId: row.merchant_id ?? null,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createSupportTicket(input: {
  merchantId?: string | null;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<SupportTicket> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      merchant_id: input.merchantId || null,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject,
      message: input.message,
      status: "Open",
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTicket(data);
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToTicket);
}

export async function updateSupportTicketStatus(
  id: string,
  status: TicketStatus
): Promise<SupportTicket | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToTicket(data) : null;
}

// ============================================================
// AUDIT LOGS
// ============================================================

export interface AuditLog {
  id: string;
  actorType: "admin" | "merchant";
  actorLabel: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    actorType: row.actor_type,
    actorLabel: row.actor_label,
    action: row.action,
    target: row.target ?? null,
    details: row.details ?? null,
    createdAt: row.created_at,
  };
}

export async function writeAuditLog(input: {
  actorType: "admin" | "merchant";
  actorLabel: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_type: input.actorType,
    actor_label: input.actorLabel,
    action: input.action,
    target: input.target || null,
    details: input.details || null,
  });
  if (error) console.error("[audit_logs] failed to write:", error.message);
}

export async function getAuditLogs(limit = 200): Promise<AuditLog[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(rowToAuditLog);
}
