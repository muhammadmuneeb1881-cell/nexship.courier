"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Package, Bell, Undo2, X } from "lucide-react";

type OrderStatus = "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";
type CodStatus = "Pending" | "Collected" | "Remitted";

interface Order {
  id: string;
  trackingId: string;
  createdAt: string;
  receiverName: string;
  receiverPhone: string;
  deliveryCity: string;
  deliveryAddress: string;
  packageType: string;
  price: number;
  status: OrderStatus;
  codStatus: CodStatus;
}

interface AppNotification {
  id: string;
  category: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Merchant {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  Pending: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  "Picked Up": "bg-sky-400/10 text-sky-300 border-sky-400/25",
  "In Transit": "bg-violet-400/10 text-violet-300 border-violet-400/25",
  Delivered: "bg-accent/10 text-accent border-accent/25",
  Cancelled: "bg-red-400/10 text-red-300 border-red-400/25",
};

export default function MerchantDashboard() {
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnFor, setReturnFor] = useState<Order | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, ordersRes, notifRes] = await Promise.all([
        fetch("/api/merchant/me", { cache: "no-store" }),
        fetch("/api/merchant/orders", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);
      if (meRes.status === 401) {
        router.push("/merchant/login");
        return;
      }
      setMerchant((await meRes.json()).merchant);
      setOrders((await ordersRes.json()).orders || []);
      setNotifications((await notifRes.json()).notifications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/merchant/logout", { method: "POST" });
    router.push("/merchant/login");
    router.refresh();
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all-read" }),
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return <main className="min-h-screen bg-base px-4 py-10 text-center font-body text-sm text-muted">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">{merchant?.companyName}</h1>
            <p className="mt-1 font-body text-sm text-muted">Welcome back, {merchant?.ownerName}.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/booking"
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-display text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90"
            >
              + New Order
            </a>
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-3.5 py-2.5 text-white transition-colors hover:border-white/20"
              >
                <Bell className="h-4 w-4" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1 font-display text-[10px] font-bold text-[#050505]">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl border border-border bg-[#0a0a0a] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <span className="font-display text-xs font-semibold uppercase tracking-wider text-muted">
                      Notifications
                    </span>
                    <button onClick={markAllRead} className="font-body text-[11px] text-accent hover:underline">
                      Mark all read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center font-body text-xs text-muted">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`border-b border-border px-4 py-3 ${n.read ? "" : "bg-accent/[0.04]"}`}>
                        <span className="font-body text-xs font-semibold text-white">{n.title}</span>
                        <p className="mt-0.5 font-body text-[11px] text-muted">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 font-body text-sm text-white transition-colors hover:border-white/20"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-2.5 font-body text-sm text-red-200 transition-colors hover:bg-red-400/[0.12]"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} /> Logout
            </button>
          </div>
        </header>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-white/[0.03]">
                {["Tracking ID", "Date", "Receiver", "City", "Package", "Price", "Status", "COD", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-body text-xs font-semibold uppercase tracking-wider text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center font-body text-sm text-muted">
                    <Package className="mx-auto mb-2 h-6 w-6 text-muted" strokeWidth={1.5} />
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-accent">{o.trackingId}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-white">
                      <div>{o.receiverName}</div>
                      <div className="text-muted">{o.receiverPhone}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.deliveryCity}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.packageType}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-xs font-semibold text-white">
                      Rs {o.price.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-lg border px-2.5 py-1 font-body text-[11px] font-medium ${STATUS_STYLES[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-body text-xs text-muted">{o.codStatus}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {o.status === "Delivered" && (
                        <button
                          onClick={() => setReturnFor(o)}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-body text-[11px] text-muted transition-colors hover:text-white"
                        >
                          <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {returnFor && (
        <ReturnModal order={returnFor} onClose={() => setReturnFor(null)} onFiled={loadData} />
      )}
    </main>
  );
}

function ReturnModal({
  order,
  onClose,
  onFiled,
}: {
  order: Order;
  onClose: () => void;
  onFiled: () => void;
}) {
  const [reason, setReason] = useState("");
  const [redeliveryRequested, setRedeliveryRequested] = useState(false);
  const [redeliveryAddress, setRedeliveryAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, reason, redeliveryRequested, redeliveryAddress }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Failed to file return");
      return;
    }
    onFiled();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-[#0a0a0a] p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-white">Request Return — {order.trackingId}</h3>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block font-body text-xs text-muted">Reason for return</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-white/[0.04] px-3 py-2.5 font-body text-sm text-white outline-none focus:border-accent/40"
            />
          </div>
          <label className="flex items-center gap-2 font-body text-xs text-muted">
            <input
              type="checkbox"
              checked={redeliveryRequested}
              onChange={(e) => setRedeliveryRequested(e.target.checked)}
            />
            Request redelivery instead of a refund
          </label>
          {redeliveryRequested && (
            <input
              required
              placeholder="Redelivery address"
              value={redeliveryAddress}
              onChange={(e) => setRedeliveryAddress(e.target.value)}
              className="w-full rounded-xl border border-border bg-white/[0.04] px-3 py-2.5 font-body text-sm text-white outline-none focus:border-accent/40"
            />
          )}
          {error && <p className="font-body text-xs text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-accent px-4 py-2.5 font-display text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit Return Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
