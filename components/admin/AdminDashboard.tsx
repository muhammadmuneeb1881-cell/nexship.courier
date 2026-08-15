"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Package,
  RefreshCw,
  Settings,
  Trash2,
  ClipboardList,
  Search,
  MessageSquare,
  Building2,
  Undo2,
  Wallet,
  LifeBuoy,
  ScrollText,
  Bell,
  Ban,
  KeyRound,
  Plus,
  X,
  Download,
} from "lucide-react";
import { openSlip } from "../../lib/slip";

interface Order {
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
  requiresPickup: boolean;
  pickupCharges: number;
  deliveryCharges: number;
  parcelValue: number;
  isCod: boolean;
  price: number;
  status: OrderStatus;
  merchantId: string | null;
  codStatus: CodStatus;
  codCollectedAt: string | null;
  codRemittedAt: string | null;
}

function handleSlip(o: Order) {
  openSlip({
    trackingId: o.trackingId,
    createdAt: o.createdAt,
    senderName: o.senderName,
    senderPhone: o.senderPhone,
    pickupAddress: o.pickupAddress,
    receiverName: o.receiverName,
    receiverPhone: o.receiverPhone,
    deliveryCity: o.deliveryCity,
    deliveryAddress: o.deliveryAddress,
    packageType: o.packageType,
    weightKg: o.weightKg,
    quantity: o.quantity,
    requiresPickup: o.requiresPickup,
    pickupCharges: o.pickupCharges,
    deliveryCharges: o.deliveryCharges,
    parcelValue: o.parcelValue,
    isCod: o.isCod,
    price: o.price,
  });
}

function PickupBadge({ requiresPickup }: { requiresPickup: boolean }) {
  return requiresPickup ? (
    <span className="rounded-lg border border-accent/25 bg-accent/10 px-2.5 py-1 font-body text-[11px] font-medium text-accent">
      Pickup
    </span>
  ) : (
    <span className="rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1 font-body text-[11px] font-medium text-muted">
      Drop-off
    </span>
  );
}

function DeliveryTypeBadge({ isCod }: { isCod: boolean }) {
  return isCod ? (
    <span className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-body text-[11px] font-medium text-amber-300">
      COD
    </span>
  ) : (
    <span className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-2.5 py-1 font-body text-[11px] font-medium text-sky-300">
      Normal
    </span>
  );
}

type CodStatus = "Pending" | "Collected" | "Remitted";
const COD_STATUSES: CodStatus[] = ["Pending", "Collected", "Remitted"];
const COD_STYLES: Record<CodStatus, string> = {
  Pending: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  Collected: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  Remitted: "bg-accent/10 text-accent border-accent/25",
};

type MerchantStatus = "Active" | "Suspended";
interface Merchant {
  id: string;
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  ntn: string | null;
  strn: string | null;
  pickupAddress: string | null;
  status: MerchantStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

type ReturnStatus = "Requested" | "Approved" | "In Transit" | "Received" | "Refunded" | "Rejected";
const RETURN_STATUSES: ReturnStatus[] = ["Requested", "Approved", "In Transit", "Received", "Refunded", "Rejected"];
interface ReturnRecord {
  id: string;
  orderId: string;
  merchantId: string | null;
  reason: string;
  status: ReturnStatus;
  redeliveryRequested: boolean;
  redeliveryAddress: string | null;
  timeline: { status: string; note?: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}

type TicketStatus = "Open" | "In Progress" | "Closed";
const TICKET_STATUSES: TicketStatus[] = ["Open", "In Progress", "Closed"];
interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
}

interface AuditLog {
  id: string;
  actorType: "admin" | "merchant";
  actorLabel: string;
  action: string;
  target: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface AppNotification {
  id: string;
  category: "order" | "pickup" | "cod" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

type OrderStatus = "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

interface PricingConfig {
  baseFee: number;
  perKgRate: number;
  packageTypeExtra: Record<string, number>;
  updatedAt: string;
}

type InquiryStatus = "New" | "Contacted" | "Closed";

interface Inquiry {
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

const INQUIRY_STATUSES: InquiryStatus[] = ["New", "Contacted", "Closed"];

const INQUIRY_STATUS_STYLES: Record<InquiryStatus, string> = {
  New: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  Contacted: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  Closed: "bg-accent/10 text-accent border-accent/25",
};

const STATUSES: OrderStatus[] = ["Pending", "Picked Up", "In Transit", "Delivered", "Cancelled"];
const PACKAGE_TYPES = ["Documents", "Parcel", "Fragile", "Electronics", "Food"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  "Picked Up": "bg-sky-400/10 text-sky-300 border-sky-400/25",
  "In Transit": "bg-violet-400/10 text-violet-300 border-violet-400/25",
  Delivered: "bg-accent/10 text-accent border-accent/25",
  Cancelled: "bg-red-400/10 text-red-300 border-red-400/25",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<
    "orders" | "inquiries" | "pricing" | "merchants" | "returns" | "cod" | "tickets" | "audit"
  >("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ordersRes,
        inquiriesRes,
        pricingRes,
        merchantsRes,
        returnsRes,
        ticketsRes,
        auditRes,
        notificationsRes,
      ] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/inquiries", { cache: "no-store" }),
        fetch("/api/pricing", { cache: "no-store" }),
        fetch("/api/admin/merchants", { cache: "no-store" }),
        fetch("/api/returns", { cache: "no-store" }),
        fetch("/api/admin/support-tickets", { cache: "no-store" }),
        fetch("/api/admin/audit-logs", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);

      if ([ordersRes, inquiriesRes, pricingRes].some((r) => r.status === 401)) {
        router.push("/admin/login");
        return;
      }

      const ordersData = await ordersRes.json();
      const inquiriesData = await inquiriesRes.json();
      const pricingData = await pricingRes.json();
      setOrders(ordersData.orders || []);
      setInquiries(inquiriesData.inquiries || []);
      setPricing(pricingData.pricing);

      if (merchantsRes.ok) setMerchants((await merchantsRes.json()).merchants || []);
      if (returnsRes.ok) setReturns((await returnsRes.json()).returns || []);

      if (ticketsRes.ok) {
        setTickets((await ticketsRes.json()).tickets || []);
      } else {
        const body = await ticketsRes.json().catch(() => null);
        console.error("[admin] failed to load support tickets:", ticketsRes.status, body?.error);
        setError(
          `Couldn't load support tickets (HTTP ${ticketsRes.status}). This usually means the ` +
            `"support_tickets" table/migration is missing in the database, or the request timed ` +
            `out — check the server logs for the real error.`
        );
      }

      if (auditRes.ok) setAuditLogs((await auditRes.json()).logs || []);
      if (notificationsRes.ok) setNotifications((await notificationsRes.json()).notifications || []);
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    });
  };

  // ---- Merchants ----
  const handleCreateMerchant = async (input: {
    companyName: string;
    ownerName: string;
    phone: string;
    email: string;
    ntn: string;
    strn: string;
    pickupAddress: string;
    password: string;
  }) => {
    const res = await fetch("/api/admin/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return data.error || "Failed to create merchant";
    setMerchants((prev) => [data.merchant, ...prev]);
    return null;
  };

  const handleMerchantAction = async (id: string, action: "suspend" | "activate" | "reset-password") => {
    const res = await fetch(`/api/admin/merchants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    if (data.merchant) {
      setMerchants((prev) => prev.map((m) => (m.id === id ? data.merchant : m)));
    }
    return data.tempPassword as string | undefined;
  };

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm("Delete this merchant permanently? This cannot be undone.")) return;
    const prev = merchants;
    setMerchants((m) => m.filter((x) => x.id !== id));
    const res = await fetch(`/api/admin/merchants/${id}`, { method: "DELETE" });
    if (!res.ok) setMerchants(prev);
  };

  // ---- Returns ----
  const handleReturnStatusChange = async (id: string, status: ReturnStatus) => {
    setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await fetch(`/api/returns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) loadData();
  };

  // ---- COD ----
  const handleCodChange = async (id: string, codStatus: CodStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, codStatus } : o)));
    const res = await fetch(`/api/admin/cod/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codStatus }),
    });
    if (!res.ok) loadData();
  };

  // ---- Support tickets ----
  const handleTicketStatusChange = async (id: string, status: TicketStatus) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    const res = await fetch(`/api/admin/support-tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) loadData();
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      loadData(); // revert on failure by refetching
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order permanently?")) return;
    const prev = orders;
    setOrders((o) => o.filter((x) => x.id !== id));
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (!res.ok) setOrders(prev);
  };

  const handleInquiryStatusChange = async (id: string, status: InquiryStatus) => {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    const res = await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) loadData();
  };

  const handleInquiryDelete = async (id: string) => {
    if (!confirm("Delete this inquiry permanently?")) return;
    const prev = inquiries;
    setInquiries((i) => i.filter((x) => x.id !== id));
    const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    if (!res.ok) setInquiries(prev);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.senderName.toLowerCase().includes(q) ||
        o.receiverName.toLowerCase().includes(q) ||
        o.senderPhone.includes(q) ||
        (o.senderEmail || "").toLowerCase().includes(q) ||
        o.receiverPhone.includes(q) ||
        o.deliveryCity.toLowerCase().includes(q) ||
        o.trackingId.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <main className="min-h-screen bg-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">NexShip Admin</h1>
            <p className="mt-1 font-body text-sm text-muted">
              Manage orders and pricing for your courier service.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllNotificationsRead}
            />
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 font-body text-sm text-white transition-colors hover:border-white/20"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-2.5 font-body text-sm text-red-200 transition-colors hover:bg-red-400/[0.12]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Logout
            </button>
          </div>
        </header>

        <div className="mt-8 flex gap-2 border-b border-border">
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={<ClipboardList className="h-4 w-4" strokeWidth={1.75} />}>
            Orders ({orders.length})
          </TabButton>
          <TabButton active={tab === "inquiries"} onClick={() => setTab("inquiries")} icon={<MessageSquare className="h-4 w-4" strokeWidth={1.75} />}>
            Inquiries ({inquiries.length})
          </TabButton>
          <TabButton active={tab === "pricing"} onClick={() => setTab("pricing")} icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}>
            Pricing Settings
          </TabButton>
          <TabButton active={tab === "merchants"} onClick={() => setTab("merchants")} icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />}>
            Merchants ({merchants.length})
          </TabButton>
          <TabButton active={tab === "returns"} onClick={() => setTab("returns")} icon={<Undo2 className="h-4 w-4" strokeWidth={1.75} />}>
            Returns ({returns.length})
          </TabButton>
          <TabButton active={tab === "cod"} onClick={() => setTab("cod")} icon={<Wallet className="h-4 w-4" strokeWidth={1.75} />}>
            COD
          </TabButton>
          <TabButton active={tab === "tickets"} onClick={() => setTab("tickets")} icon={<LifeBuoy className="h-4 w-4" strokeWidth={1.75} />}>
            Tickets ({tickets.length})
          </TabButton>
          <TabButton active={tab === "audit"} onClick={() => setTab("audit")} icon={<ScrollText className="h-4 w-4" strokeWidth={1.75} />}>
            Audit Log
          </TabButton>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-body text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-16 text-center font-body text-sm text-muted">Loading...</div>
        ) : tab === "orders" ? (
          <OrdersTab
            orders={filteredOrders}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ) : tab === "inquiries" ? (
          <InquiriesTab
            inquiries={inquiries}
            onStatusChange={handleInquiryStatusChange}
            onDelete={handleInquiryDelete}
          />
        ) : tab === "pricing" ? (
          pricing && <PricingTab pricing={pricing} onSaved={setPricing} />
        ) : tab === "merchants" ? (
          <MerchantsTab
            merchants={merchants}
            onCreate={handleCreateMerchant}
            onAction={handleMerchantAction}
            onDelete={handleDeleteMerchant}
          />
        ) : tab === "returns" ? (
          <ReturnsTab returns={returns} orders={orders} onStatusChange={handleReturnStatusChange} />
        ) : tab === "cod" ? (
          <CodTab orders={orders} onCodChange={handleCodChange} />
        ) : tab === "tickets" ? (
          <TicketsTab tickets={tickets} onStatusChange={handleTicketStatusChange} />
        ) : (
          <AuditLogTab logs={auditLogs} />
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 font-body text-sm font-medium transition-colors ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-muted hover:text-white"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function OrdersTab({
  orders,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onStatusChange,
  onDelete,
}: {
  orders: Order[];
  search: string;
  setSearch: (v: string) => void;
  statusFilter: "All" | OrderStatus;
  setStatusFilter: (v: "All" | OrderStatus) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking ID, name, phone, city..."
            className="w-full rounded-xl border border-border bg-white/[0.04] py-2.5 pl-10 pr-4 font-body text-sm text-white outline-none focus:border-accent/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 font-body text-sm text-white outline-none focus:border-accent/40"
        >
          <option value="All" className="bg-[#0a0a0a]">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-white/[0.03]">
              {[
                "Tracking ID",
                "Date",
                "Sender",
                "Pickup Address",
                "Pickup",
                "Receiver",
                "Delivery Address",
                "City",
                "Package",
                "Weight",
                "Qty",
                "Type",
                "Price",
                "Status",
                "Slip",
                "",
              ].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={16} className="px-4 py-10 text-center font-body text-sm text-muted">
                  <Package className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="align-top hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">
                    {o.trackingId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-white">
                    <div className="font-medium">{o.senderName}</div>
                    <div className="text-muted">{o.senderPhone}</div>
                    {o.senderEmail && <div className="text-muted">{o.senderEmail}</div>}
                  </td>
                  <td className="max-w-[180px] px-4 py-3 font-body text-xs text-muted">{o.pickupAddress}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <PickupBadge requiresPickup={o.requiresPickup} />
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-white">
                    <div className="font-medium">{o.receiverName}</div>
                    <div className="text-muted">{o.receiverPhone}</div>
                  </td>
                  <td className="max-w-[180px] px-4 py-3 font-body text-xs text-muted">{o.deliveryAddress}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs capitalize text-muted">{o.deliveryCity}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.packageType}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.weightKg} kg</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <DeliveryTypeBadge isCod={o.isCod} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">
                    Rs {o.price.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                      className={`rounded-lg border px-2.5 py-1.5 font-body text-[11px] font-medium outline-none ${STATUS_STYLES[o.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#0a0a0a] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => handleSlip(o)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-body text-[11px] text-white transition-colors hover:border-white/30"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> Slip
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => onDelete(o.id)}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-red-400/10 hover:text-red-300"
                      title="Delete order"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InquiriesTab({
  inquiries,
  onStatusChange,
  onDelete,
}: {
  inquiries: Inquiry[];
  onStatusChange: (id: string, status: InquiryStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-white/[0.03]">
              {["Date", "Plan", "Name", "Phone", "Email", "Message", "Emailed", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center font-body text-sm text-muted">
                  <MessageSquare className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              inquiries.map((i) => (
                <tr key={i.id} className="align-top hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                    {new Date(i.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">
                    {i.plan}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-medium text-white">
                    {i.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                    {i.phone}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                    {i.email || "—"}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 font-body text-xs text-muted">
                    {i.message || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs">
                    {i.emailSent ? (
                      <span className="text-accent">✓ Sent</span>
                    ) : (
                      <span className="text-amber-300">Not sent</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={i.status}
                      onChange={(e) =>
                        onStatusChange(i.id, e.target.value as InquiryStatus)
                      }
                      className={`rounded-lg border px-2.5 py-1.5 font-body text-[11px] font-medium outline-none ${INQUIRY_STATUS_STYLES[i.status]}`}
                    >
                      {INQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#0a0a0a] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => onDelete(i.id)}
                      className="rounded-lg p-2 text-muted transition-colors hover:bg-red-400/10 hover:text-red-300"
                      title="Delete inquiry"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingTab({
  pricing,
  onSaved,
}: {
  pricing: PricingConfig;
  onSaved: (p: PricingConfig) => void;
}) {
  // Fixed business rule (not admin-editable): flat Rs 300 for any shipment
  // up to and including 3kg, plus Rs 100 for every kg above 3kg. Base fee and
  // per-package-type extras stay locked to 0 — every shipment is priced the
  // same way regardless of package type.
  const WEIGHT_THRESHOLD_KG = 3;
  const FLAT_RATE_UPTO_THRESHOLD = 300;
  const EXTRA_RATE_PER_KG_ABOVE_THRESHOLD = 100;
  const LOCKED_BASE_FEE = 0;
  const LOCKED_PACKAGE_EXTRA: Record<string, number> = PACKAGE_TYPES.reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {}
  );

  // Make sure the backend always reflects this fixed rule, even if it was
  // previously saved with different numbers.
  useEffect(() => {
    const needsSync =
      pricing.baseFee !== LOCKED_BASE_FEE ||
      pricing.perKgRate !== EXTRA_RATE_PER_KG_ABOVE_THRESHOLD ||
      PACKAGE_TYPES.some((type) => (pricing.packageTypeExtra[type] || 0) !== 0);
    if (!needsSync) return;
    fetch("/api/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseFee: LOCKED_BASE_FEE,
        perKgRate: EXTRA_RATE_PER_KG_ABOVE_THRESHOLD,
        packageTypeExtra: LOCKED_PACKAGE_EXTRA,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.pricing && onSaved(data.pricing))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const example3kg = FLAT_RATE_UPTO_THRESHOLD;
  const example5kg =
    FLAT_RATE_UPTO_THRESHOLD + (5 - WEIGHT_THRESHOLD_KG) * EXTRA_RATE_PER_KG_ABOVE_THRESHOLD;

  return (
    <div className="mt-6 max-w-2xl">
      <div className="rounded-2xl border border-border bg-white/[0.04] p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Base Rate
        </h3>
        <p className="mt-1 font-body text-xs text-muted">
          Every shipment up to and including 3kg costs a flat Rs {FLAT_RATE_UPTO_THRESHOLD}.
          Above 3kg, every extra kg adds Rs {EXTRA_RATE_PER_KG_ABOVE_THRESHOLD} on top of that.
          This applies the same way regardless of package type — no base fee,
          no extra fee for package type.
        </p>

        <div className="mt-4 space-y-2 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 font-body text-xs text-white/90">
          <p>
            Example: a shipment of 3kg or less costs{" "}
            <span className="font-semibold text-accent">Rs {example3kg.toLocaleString()}</span>
          </p>
          <p>
            Example: a 5kg shipment costs Rs {FLAT_RATE_UPTO_THRESHOLD} + (2 × Rs{" "}
            {EXTRA_RATE_PER_KG_ABOVE_THRESHOLD}) ={" "}
            <span className="font-semibold text-accent">Rs {example5kg.toLocaleString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-xs text-muted">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 font-body text-sm text-white outline-none focus:border-accent/40"
      />
    </div>
  );
}

function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-3.5 py-2.5 font-body text-sm text-white transition-colors hover:border-white/20"
        title="Notification Center"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 font-display text-[10px] font-bold text-[#050505]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-[#0a0a0a] shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted">
              Notifications
            </span>
            <button onClick={onMarkAllRead} className="font-body text-[11px] text-accent hover:underline">
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center font-body text-xs text-muted">No notifications yet.</p>
          ) : (
            notifications.slice(0, 30).map((n) => (
              <div
                key={n.id}
                className={`border-b border-border px-4 py-3 ${n.read ? "" : "bg-accent/[0.04]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-body text-xs font-semibold text-white">{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                </div>
                <p className="mt-0.5 font-body text-[11px] text-muted">{n.message}</p>
                <p className="mt-1 font-body text-[10px] text-muted/70">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MerchantsTab({
  merchants,
  onCreate,
  onAction,
  onDelete,
}: {
  merchants: Merchant[];
  onCreate: (input: {
    companyName: string;
    ownerName: string;
    phone: string;
    email: string;
    ntn: string;
    strn: string;
    pickupAddress: string;
    password: string;
  }) => Promise<string | null>;
  onAction: (id: string, action: "suspend" | "activate" | "reset-password") => Promise<string | undefined>;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [tempPasswordFor, setTempPasswordFor] = useState<{ email: string; password: string } | null>(null);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-muted">Create and manage merchant (business client) accounts.</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-display text-xs font-semibold text-[#050505] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Create Merchant
        </button>
      </div>

      {showForm && (
        <MerchantForm
          onClose={() => setShowForm(false)}
          onCreate={async (input) => {
            const err = await onCreate(input);
            if (!err) setShowForm(false);
            return err;
          }}
        />
      )}

      {tempPasswordFor && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
          <p className="font-body text-xs text-white">
            New password for <b>{tempPasswordFor.email}</b>:{" "}
            <span className="font-mono text-accent">{tempPasswordFor.password}</span> — share this with the
            merchant securely, it will not be shown again.
          </p>
          <button onClick={() => setTempPasswordFor(null)} className="text-muted hover:text-white">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-white/[0.03]">
              {["Company", "Owner", "Contact", "Pickup Address", "Status", "Last Login", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {merchants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center font-body text-sm text-muted">
                  <Building2 className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                  No merchants yet.
                </td>
              </tr>
            ) : (
              merchants.map((m) => (
                <tr key={m.id} className="align-top hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-body text-xs font-semibold text-white">{m.companyName}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">{m.ownerName}</td>
                  <td className="px-4 py-3 font-body text-xs text-muted">
                    <div>{m.email}</div>
                    <div>{m.phone}</div>
                  </td>
                  <td className="max-w-[180px] px-4 py-3 font-body text-xs text-muted">{m.pickupAddress || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-lg border px-2.5 py-1 font-body text-[11px] font-medium ${
                        m.status === "Active"
                          ? "border-accent/25 bg-accent/10 text-accent"
                          : "border-red-400/25 bg-red-400/10 text-red-300"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                    {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        title={m.status === "Active" ? "Suspend merchant" : "Activate merchant"}
                        onClick={() => onAction(m.id, m.status === "Active" ? "suspend" : "activate")}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-amber-400/10 hover:text-amber-300"
                      >
                        <Ban className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        title="Reset password"
                        onClick={async () => {
                          const pw = await onAction(m.id, "reset-password");
                          if (pw) setTempPasswordFor({ email: m.email, password: pw });
                        }}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-sky-400/10 hover:text-sky-300"
                      >
                        <KeyRound className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                      <button
                        title="Delete merchant"
                        onClick={() => onDelete(m.id)}
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-red-400/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MerchantForm({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: {
    companyName: string;
    ownerName: string;
    phone: string;
    email: string;
    ntn: string;
    strn: string;
    pickupAddress: string;
    password: string;
  }) => Promise<string | null>;
}) {
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    phone: "",
    email: "",
    ntn: "",
    strn: "",
    pickupAddress: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onCreate(form);
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border border-border bg-white/[0.03] p-5 sm:grid-cols-2">
      <TextField label="Company Name" value={form.companyName} onChange={update("companyName")} required />
      <TextField label="Owner Name" value={form.ownerName} onChange={update("ownerName")} required />
      <TextField label="Phone" value={form.phone} onChange={update("phone")} required />
      <TextField label="Email" type="email" value={form.email} onChange={update("email")} required />
      <TextField label="NTN (optional)" value={form.ntn} onChange={update("ntn")} />
      <TextField label="STRN (optional)" value={form.strn} onChange={update("strn")} />
      <TextField label="Pickup Address" value={form.pickupAddress} onChange={update("pickupAddress")} />
      <TextField label="Temporary Password" type="password" value={form.password} onChange={update("password")} required />
      {error && <p className="sm:col-span-2 font-body text-xs text-red-300">{error}</p>}
      <div className="flex items-center gap-2 sm:col-span-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2.5 font-body text-sm text-muted transition-colors hover:text-white">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="rounded-xl bg-accent px-4 py-2.5 font-display text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:opacity-60">
          {saving ? "Creating..." : "Create Merchant"}
        </button>
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-xs text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 font-body text-sm text-white outline-none focus:border-accent/40"
      />
    </div>
  );
}

function ReturnsTab({
  returns,
  orders,
  onStatusChange,
}: {
  returns: ReturnRecord[];
  orders: Order[];
  onStatusChange: (id: string, status: ReturnStatus) => void;
}) {
  const trackingFor = (orderId: string) => orders.find((o) => o.id === orderId)?.trackingId || orderId;

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr className="bg-white/[0.03]">
            {["Order", "Reason", "Redelivery", "Status", "Timeline", "Requested"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {returns.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center font-body text-sm text-muted">
                <Undo2 className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                No returns yet.
              </td>
            </tr>
          ) : (
            returns.map((r) => (
              <tr key={r.id} className="align-top hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">
                  {trackingFor(r.orderId)}
                </td>
                <td className="max-w-[200px] px-4 py-3 font-body text-xs text-muted">{r.reason}</td>
                <td className="px-4 py-3 font-body text-xs text-muted">
                  {r.redeliveryRequested ? r.redeliveryAddress || "Requested" : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r.id, e.target.value as ReturnStatus)}
                    className="rounded-lg border border-border bg-white/[0.04] px-2.5 py-1.5 font-body text-[11px] font-medium text-white outline-none"
                  >
                    {RETURN_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="max-w-[220px] px-4 py-3 font-body text-[11px] text-muted">
                  {r.timeline.map((t, i) => (
                    <div key={i}>
                      {t.status} — {new Date(t.at).toLocaleDateString()}
                    </div>
                  ))}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function CodTab({
  orders,
  onCodChange,
}: {
  orders: Order[];
  onCodChange: (id: string, status: CodStatus) => void;
}) {
  const codOrders = orders.filter((o) => o.isCod);
  const totalPending = codOrders.filter((o) => o.codStatus === "Pending").reduce((sum, o) => sum + o.price, 0);
  const totalCollected = codOrders.filter((o) => o.codStatus === "Collected").reduce((sum, o) => sum + o.price, 0);
  const totalRemitted = codOrders.filter((o) => o.codStatus === "Remitted").reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Pending" value={`Rs ${totalPending.toLocaleString()}`} />
        <SummaryCard label="Collected" value={`Rs ${totalCollected.toLocaleString()}`} />
        <SummaryCard label="Remitted" value={`Rs ${totalRemitted.toLocaleString()}`} />
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="bg-white/[0.03]">
              {["Tracking ID", "Sender", "Delivery Charges", "COD Amount", "Total", "Order Status", "COD Status", "Slip"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {codOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center font-body text-sm text-muted">
                  <Wallet className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                  No COD orders yet.
                </td>
              </tr>
            ) : (
              codOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">{o.trackingId}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-white">{o.senderName}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-white">
                    Rs {o.deliveryCharges.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-white">
                    Rs {o.parcelValue.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">
                    Rs {o.price.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.status}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={o.codStatus}
                      onChange={(e) => onCodChange(o.id, e.target.value as CodStatus)}
                      className={`rounded-lg border px-2.5 py-1.5 font-body text-[11px] font-medium outline-none ${COD_STYLES[o.codStatus]}`}
                    >
                      {COD_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#0a0a0a] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => handleSlip(o)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-body text-[11px] text-white transition-colors hover:border-white/30"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.75} /> Slip
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/[0.04] p-5">
      <p className="font-body text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function TicketsTab({
  tickets,
  onStatusChange,
}: {
  tickets: SupportTicket[];
  onStatusChange: (id: string, status: TicketStatus) => void;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr className="bg-white/[0.03]">
            {["Date", "From", "Subject", "Message", "Status"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center font-body text-sm text-muted">
                <LifeBuoy className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                No support tickets yet.
              </td>
            </tr>
          ) : (
            tickets.map((t) => (
              <tr key={t.id} className="align-top hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-body text-xs text-white">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-muted">{t.email}</div>
                  {t.phone && <div className="text-muted">{t.phone}</div>}
                </td>
                <td className="px-4 py-3 font-body text-xs font-semibold text-accent">{t.subject}</td>
                <td className="max-w-[260px] px-4 py-3 font-body text-xs text-muted">{t.message}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    value={t.status}
                    onChange={(e) => onStatusChange(t.id, e.target.value as TicketStatus)}
                    className="rounded-lg border border-border bg-white/[0.04] px-2.5 py-1.5 font-body text-[11px] font-medium text-white outline-none"
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AuditLogTab({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr className="bg-white/[0.03]">
            {["Date", "Actor", "Action", "Target", "Details"].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center font-body text-sm text-muted">
                <ScrollText className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                No activity recorded yet.
              </td>
            </tr>
          ) : (
            logs.map((l) => (
              <tr key={l.id} className="hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-white">
                  {l.actorLabel} <span className="text-muted">({l.actorType})</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">{l.action}</td>
                <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{l.target || "—"}</td>
                <td className="max-w-[240px] px-4 py-3 font-body text-[11px] text-muted">
                  {l.details ? JSON.stringify(l.details) : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
