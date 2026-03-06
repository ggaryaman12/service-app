import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash.startsWith("scrypt:")) return false;

  const [, salt, hashHex] = passwordHash.split(":");
  if (!salt || !hashHex) return false;

  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

