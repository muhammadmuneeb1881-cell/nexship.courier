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
} from "lucide-react";

interface Order {
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
  const [tab, setTab] = useState<"orders" | "inquiries" | "pricing">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, inquiriesRes, pricingRes] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/inquiries", { cache: "no-store" }),
        fetch("/api/pricing", { cache: "no-store" }),
      ]);

      if (ordersRes.status === 401 || inquiriesRes.status === 401 || pricingRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const ordersData = await ordersRes.json();
      const inquiriesData = await inquiriesRes.json();
      const pricingData = await pricingRes.json();
      setOrders(ordersData.orders || []);
      setInquiries(inquiriesData.inquiries || []);
      setPricing(pricingData.pricing);
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
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
        ) : (
          pricing && <PricingTab pricing={pricing} onSaved={setPricing} />
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
                "Receiver",
                "Delivery Address",
                "City",
                "Package",
                "Weight",
                "Qty",
                "Price",
                "Status",
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
                <td colSpan={13} className="px-4 py-10 text-center font-body text-sm text-muted">
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
                  </td>
                  <td className="max-w-[180px] px-4 py-3 font-body text-xs text-muted">{o.pickupAddress}</td>
                  <td className="px-4 py-3 font-body text-xs text-white">
                    <div className="font-medium">{o.receiverName}</div>
                    <div className="text-muted">{o.receiverPhone}</div>
                  </td>
                  <td className="max-w-[180px] px-4 py-3 font-body text-xs text-muted">{o.deliveryAddress}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs capitalize text-muted">{o.deliveryCity}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.packageType}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.weightKg} kg</td>
                  <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.quantity}</td>
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
  const [perKgRate, setPerKgRate] = useState(pricing.perKgRate);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Base fee and per-package-type extras are locked to 0 so every shipment is
  // priced as a flat "Rs X per kg" amount, regardless of package type.
  const LOCKED_BASE_FEE = 0;
  const LOCKED_PACKAGE_EXTRA: Record<string, number> = PACKAGE_TYPES.reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {}
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseFee: LOCKED_BASE_FEE,
          perKgRate,
          packageTypeExtra: LOCKED_PACKAGE_EXTRA,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to save pricing");
      } else {
        onSaved(data.pricing);
        setMessage("Pricing updated successfully.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Live preview for a 1kg, qty 1 shipment (same for every package type,
  // since base fee and package-type extras are locked to 0).
  const previewWeight = 1;
  const preview = Math.round(perKgRate * previewWeight);

  return (
    <div className="mt-6 max-w-2xl">
      <div className="rounded-2xl border border-border bg-white/[0.04] p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
          Base Rate
        </h3>
        <p className="mt-1 font-body text-xs text-muted">
          Every shipment is priced as a flat rate per kg — no base fee, no extra
          fee for package type. Documents, Parcel, Fragile, Electronics, and
          Food all cost the same per kg.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <NumberField label="Rate per KG (Rs)" value={perKgRate} onChange={setPerKgRate} />
        </div>

        <div className="mt-6 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 font-body text-xs text-white/90">
          Example: a 1kg shipment of any package type would currently cost{" "}
          <span className="font-semibold text-accent">Rs {preview.toLocaleString()}</span>
        </div>

        {message && (
          <p className="mt-4 font-body text-xs text-muted">{message}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 font-display text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Pricing"}
        </button>
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
