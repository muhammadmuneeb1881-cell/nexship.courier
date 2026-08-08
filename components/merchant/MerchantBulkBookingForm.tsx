"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  UploadCloud,
  FileSpreadsheet,
  ArrowLeft,
} from "lucide-react";

const SAMPLE_HEADERS = [
  "senderName",
  "senderPhone",
  "senderEmail",
  "pickupAddress",
  "receiverName",
  "receiverPhone",
  "deliveryCity",
  "deliveryAddress",
  "packageType",
  "weightKg",
  "quantity",
  "isCod",
  "parcelValue",
  "requiresPickup",
];

const SAMPLE_ROW = [
  "Ali Raza",
  "03001234567",
  "ali@example.com",
  "Shop 4, Tariq Road, Karachi",
  "Sana Khan",
  "03007654321",
  "Karachi",
  "House 12, Block 5, Gulshan, Karachi",
  "Parcel",
  "2",
  "1",
  "COD",
  "1500",
  "Pickup",
];

// Minimal RFC4180-ish CSV parser — handles quoted fields with commas.
function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    lines.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushField();
    } else if (c === "\n") {
      pushField();
      pushRow();
    } else if (c === "\r") {
      // ignore
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }

  const filtered = lines.filter((l) => l.some((c) => c.trim() !== ""));
  const headers = (filtered[0] || []).map((h) => h.trim());
  const rows = filtered.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] || "").trim();
    });
    return obj;
  });
  return { headers, rows };
}

export default function MerchantBulkBookingForm() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [validated, setValidated] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/merchant/me", { cache: "no-store" }).then((res) => {
      if (res.status === 401) {
        router.push("/merchant/login");
        return;
      }
      setCheckingAuth(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadSample = () => {
    const csv = [
      SAMPLE_HEADERS.join(","),
      SAMPLE_ROW.map((v) => `"${v.replace(/"/g, '""')}"`).join(","),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexship-merchant-bulk-order-sample.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setValidated(false);
    setErrors([]);
    setImportedCount(null);
    setImportedIds([]);
    const text = await file.text();
    const { rows: parsedRows } = parseCsv(text);
    setRows(parsedRows);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const validateData = async () => {
    if (rows.length === 0) return;
    setValidating(true);
    setErrors([]);
    try {
      const res = await fetch("/api/merchant/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, dryRun: true }),
      });
      const data = await res.json();
      setErrors(data.errors || []);
      setValidated(true);
    } catch {
      setErrors(["Could not reach the server to validate."]);
    } finally {
      setValidating(false);
    }
  };

  const importOrders = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setErrors([]);
    try {
      const res = await fetch("/api/merchant/orders/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || [data.error || "Import failed"]);
        setImporting(false);
        return;
      }
      setImportedCount(data.created.length);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setImportedIds(data.created.map((o: any) => o.trackingId));
      setRows([]);
      setFileName(null);
      setValidated(false);
    } catch {
      setErrors(["Could not reach the server to import."]);
    } finally {
      setImporting(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-base px-4 py-10 text-center font-body text-sm text-muted">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/merchant")}
          className="mb-6 flex items-center gap-2 font-body text-xs text-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Back to Dashboard
        </button>

        <h1 className="font-display text-2xl font-semibold text-white">Bulk Order Booking</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Download the sample file, fill it with your shipments, preview and validate, then import
          all orders at once. Every imported order is automatically tagged to your account.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-white/[0.04] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-accent" strokeWidth={1.75} />
              <div>
                <p className="font-body text-sm font-semibold text-white">CSV Import</p>
                <p className="font-body text-xs text-muted">Up to 500 orders per file.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadSample}
              className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.04] px-4 py-2.5 font-body text-xs font-semibold text-white transition-colors hover:border-accent/40"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Download Sample File
            </button>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-6 py-12 text-center transition-colors hover:border-accent/40"
          >
            <UploadCloud className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="font-body text-sm text-white">
              {fileName ? fileName : "Click to upload or drag & drop your CSV file"}
            </p>
            <p className="font-body text-[11px] text-muted">.csv (Excel: save as CSV UTF-8 before uploading)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {rows.length > 0 && (
            <>
              <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-wider text-muted">
                Preview ({rows.length} record{rows.length === 1 ? "" : "s"})
              </h3>
              <div className="mt-3 max-h-64 overflow-auto rounded-2xl border border-border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      {["#", "Receiver", "Phone", "City", "Package", "Weight"].map((h) => (
                        <th
                          key={h}
                          className="whitespace-nowrap px-3 py-2 text-left font-body text-[11px] font-semibold uppercase tracking-wider text-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-body text-xs text-muted">{i + 2}</td>
                        <td className="px-3 py-2 font-body text-xs text-white">{r.receiverName || "—"}</td>
                        <td className="px-3 py-2 font-body text-xs text-muted">{r.receiverPhone || "—"}</td>
                        <td className="px-3 py-2 font-body text-xs text-muted">{r.deliveryCity || "—"}</td>
                        <td className="px-3 py-2 font-body text-xs text-muted">{r.packageType || "—"}</td>
                        <td className="px-3 py-2 font-body text-xs text-muted">{r.weightKg || "—"} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && (
                  <p className="px-3 py-2 font-body text-[11px] text-muted">
                    +{rows.length - 50} more rows not shown in preview.
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={validateData}
                  disabled={validating}
                  className="rounded-full bg-accent px-5 py-2.5 font-display text-sm font-semibold text-[#050505] transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {validating ? "Validating..." : "Validate Data"}
                </button>
                <button
                  type="button"
                  onClick={importOrders}
                  disabled={importing || (validated && errors.length > 0)}
                  className="rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 font-body text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {importing ? "Importing..." : "Import Orders"}
                </button>
              </div>

              {validated && errors.length === 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-3.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <p className="font-body text-xs text-white/90 sm:text-sm">
                    All {rows.length} rows look good. You can import now.
                  </p>
                </div>
              )}
            </>
          )}

          {errors.length > 0 && (
            <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-400/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-300" strokeWidth={1.75} />
                <p className="font-body text-sm font-semibold text-red-200">
                  {errors.length} error{errors.length === 1 ? "" : "s"} found — fix and re-upload
                </p>
              </div>
              <ul className="mt-3 max-h-40 list-disc space-y-1 overflow-auto pl-9 font-body text-xs text-red-200/90">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {importedCount !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                <p className="font-body text-sm text-white/90">
                  {importedCount} order{importedCount === 1 ? "" : "s"} imported successfully.
                </p>
              </div>
              <p className="mt-2 font-body text-xs leading-5 text-muted break-words">
                Tracking IDs: {importedIds.join(", ")}
              </p>
              <button
                onClick={() => router.push("/merchant")}
                className="mt-4 rounded-full bg-accent px-5 py-2 font-display text-xs font-semibold text-[#050505] transition-opacity hover:opacity-90"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
