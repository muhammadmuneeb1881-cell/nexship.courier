// Client-side only. Builds a printable order slip (COD collection slip or
// Normal/Prepaid parcel slip) and opens it in a new tab where the browser's
// native "Print -> Save as PDF" lets the user download it.
//
// Kept dependency-free on purpose (no PDF library) so it works everywhere
// this project runs without extra build/runtime setup.

export interface SlipOrder {
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
  requiresPickup: boolean;
  pickupCharges: number;
  deliveryCharges: number;
  parcelValue: number;
  isCod: boolean;
  price: number;
}

function esc(v: string | number): string {
  return String(v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

function money(n: number): string {
  return `Rs ${Math.round(n).toLocaleString()}`;
}

export function buildSlipHtml(order: SlipOrder): string {
  const cod = order.isCod;
  const accent = cod ? "#00ff88" : "#3b82f6";
  const bannerText = cod ? "CASH ON DELIVERY — COLLECT FROM RECEIVER" : "PREPAID — NO CASH TO COLLECT";
  const created = new Date(order.createdAt);
  const dateStr = isNaN(created.getTime()) ? "" : created.toLocaleString();

  const pickupRow = order.requiresPickup
    ? `<div class="row"><span>Pickup Charges (Karachi)</span><strong>${money(order.pickupCharges)}</strong></div>`
    : "";

  const amountRows = cod
    ? `
      <div class="row"><span>Parcel / COD Amount</span><strong>${money(order.parcelValue)}</strong></div>
      <div class="row"><span>Delivery Charges${order.requiresPickup ? " (incl. pickup)" : ""}</span><strong>${money(order.deliveryCharges)}</strong></div>
      ${pickupRow}
      <div class="row total"><span>Total to Collect from Receiver</span><strong>${money(order.price)}</strong></div>
    `
    : `
      <div class="row"><span>Delivery Charges${order.requiresPickup ? " (incl. pickup)" : ""}</span><strong>${money(order.deliveryCharges)}</strong></div>
      ${pickupRow}
      <div class="row total"><span>Total (Prepaid)</span><strong>${money(order.price)}</strong></div>
    `;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Slip ${esc(order.trackingId)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f2f2f2; margin: 0; padding: 24px; color: #111; }
  .slip { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #ddd; }
  .head { background: #050505; color: #fff; padding: 20px 24px; }
  .head .brand { font-weight: 700; font-size: 18px; letter-spacing: 0.02em; }
  .head .brand span { color: ${accent}; }
  .head .tid { font-size: 26px; font-weight: 800; margin-top: 6px; letter-spacing: 0.03em; }
  .head .date { font-size: 12px; opacity: 0.7; margin-top: 4px; }
  .banner { background: ${accent}; color: #050505; text-align: center; font-weight: 700; font-size: 12px; letter-spacing: 0.05em; padding: 8px 12px; }
  .body { padding: 20px 24px; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 16px 0 6px; }
  .section-title:first-child { margin-top: 0; }
  .kv { font-size: 14px; line-height: 1.5; }
  .kv b { display: block; }
  .box { border: 1px solid #e5e5e5; border-radius: 10px; padding: 12px 14px; margin-top: 4px; }
  .amounts { margin-top: 18px; border-top: 2px dashed #ddd; padding-top: 14px; }
  .row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
  .row.total { font-size: 17px; font-weight: 800; border-top: 1px solid #eee; margin-top: 6px; padding-top: 10px; }
  .row.total strong { color: ${cod ? "#0a7a44" : "#1d4ed8"}; }
  .footer { padding: 14px 24px 22px; font-size: 11px; color: #999; text-align: center; }
  .print-btn { display: block; width: 100%; max-width: 480px; margin: 16px auto 0; padding: 12px; border: none; border-radius: 10px; background: #050505; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
  @media print {
    body { background: #fff; padding: 0; }
    .slip { border: none; border-radius: 0; max-width: 100%; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>
  <div class="slip">
    <div class="head">
      <div class="brand">Nex<span>Ship</span> Courier</div>
      <div class="tid">${esc(order.trackingId)}</div>
      <div class="date">${esc(dateStr)}</div>
    </div>
    <div class="banner">${bannerText}</div>
    <div class="body">
      <div class="section-title">Sender</div>
      <div class="box kv">
        <b>${esc(order.senderName)}</b>
        ${esc(order.senderPhone)}<br/>
        ${esc(order.pickupAddress)}
      </div>

      <div class="section-title">Receiver</div>
      <div class="box kv">
        <b>${esc(order.receiverName)}</b>
        ${esc(order.receiverPhone)}<br/>
        ${esc(order.deliveryAddress)}, ${esc(order.deliveryCity)}
      </div>

      <div class="section-title">Package</div>
      <div class="box kv">
        ${esc(order.packageType)} &middot; ${esc(order.weightKg)} kg &middot; Qty ${esc(order.quantity)}
        <br/>${order.requiresPickup ? `Pickup requested (+${money(order.pickupCharges)})` : "Customer will drop off (no pickup)"}
      </div>

      <div class="amounts">
        ${amountRows}
      </div>
    </div>
    <div class="footer">Keep this slip for your records &middot; nexship.courier</div>
  </div>
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</body>
</html>`;
}

export function openSlip(order: SlipOrder): void {
  const html = buildSlipHtml(order);
  const win = window.open("", "_blank", "width=560,height=760");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  // Give the new tab a moment to render before opening the print dialog.
  win.onload = () => {
    win.focus();
  };
}
