// Password hashing using Node's built-in crypto.scrypt — no extra dependency
// (bcrypt requires a native build step that often breaks on serverless
// hosts). scrypt is a well-vetted, memory-hard KDF suitable for password
// storage. Format stored in DB: "scrypt:<saltHex>:<hashHex>".

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(plain, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = await scrypt(plain, salt, expected.length);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Generates a random temporary password (e.g. for admin-triggered resets). */
export function generateTempPassword(): string {
  return randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
}
