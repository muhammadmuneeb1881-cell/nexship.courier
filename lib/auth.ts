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
