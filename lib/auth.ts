// Lightweight session auth using Web Crypto (HMAC-SHA256).
// Works in both the Edge middleware runtime and Node.js API route runtime,
// so we avoid Node's `crypto` module here on purpose.

const SECRET = process.env.ADMIN_SESSION_SECRET || "nexship-dev-secret-change-me";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 hours

export const SESSION_COOKIE_NAME = "nexship_admin_session";
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

const encoder = new TextEncoder();

function base64UrlEncodeString(str: string): string {
  const bytes = encoder.encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeToString(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(padded);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function base64UrlEncodeBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeToBuffer(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS });
  const payloadB64 = base64UrlEncodeString(payload);
  const key = await getHmacKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sig = base64UrlEncodeBuffer(sigBuffer);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;

  try {
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecodeToBuffer(sig),
      encoder.encode(payloadB64)
    );
    if (!valid) return false;

    const payload = JSON.parse(base64UrlDecodeToString(payloadB64));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// Helper for API routes (Node.js runtime) to check the incoming request's cookie.
export async function requireAdmin(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const token = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
  return verifySessionToken(token);
}

// ---------------------------------------------------------------------------
// Role-based sessions (admin + merchant)
// ---------------------------------------------------------------------------
// Same signed-token mechanism as above (HMAC-SHA256, base64url payload.sig —
// functionally a compact JWT), extended with a `role` + optional `merchantId`
// claim so a single mechanism covers both the admin panel and merchant
// accounts. The original admin cookie/token above is left untouched for
// backwards compatibility with existing admin routes.

export type SessionRole = "admin" | "merchant";

export interface RoleSessionPayload {
  role: SessionRole;
  merchantId?: string; // present only when role === "merchant"
  exp: number;
}

export const MERCHANT_SESSION_COOKIE_NAME = "nexship_merchant_session";
export const ROLE_SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS;

export async function createRoleSessionToken(
  claims: Omit<RoleSessionPayload, "exp">
): Promise<string> {
  const payload: RoleSessionPayload = { ...claims, exp: Date.now() + SESSION_DURATION_MS };
  const payloadB64 = base64UrlEncodeString(JSON.stringify(payload));
  const key = await getHmacKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sig = base64UrlEncodeBuffer(sigBuffer);
  return `${payloadB64}.${sig}`;
}

export async function verifyRoleSessionToken(
  token?: string | null
): Promise<RoleSessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  try {
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecodeToBuffer(sig),
      encoder.encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecodeToString(payloadB64)) as RoleSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;
    if (payload.role !== "admin" && payload.role !== "merchant") return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookieValue(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

/**
 * Reads + verifies the merchant session cookie from an API route request.
 * Returns the session payload (role + merchantId) or null if absent/invalid.
 */
export async function requireMerchant(req: Request): Promise<RoleSessionPayload | null> {
  const token = getCookieValue(req, MERCHANT_SESSION_COOKIE_NAME);
  const payload = await verifyRoleSessionToken(token);
  if (!payload || payload.role !== "merchant" || !payload.merchantId) return null;
  return payload;
}

/**
 * Reads whichever session cookie is present (admin OR merchant) and returns
 * a normalized identity. Used by routes shared between both roles, like
 * notifications and returns, which are scoped differently per role.
 */
export async function requireAnySession(
  req: Request
): Promise<{ role: SessionRole; merchantId?: string } | null> {
  const isAdmin = await requireAdmin(req);
  if (isAdmin) return { role: "admin" };
  const merchant = await requireMerchant(req);
  if (merchant) return { role: "merchant", merchantId: merchant.merchantId };
  return null;
}
