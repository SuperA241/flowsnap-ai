import crypto from "crypto";

import { env } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

// Derives a 32-byte AES-256 key from the ENCRYPTION_SECRET string.
// SHA-256 is used so the key length is correct regardless of secret length.
function deriveKey(): Buffer {
  return crypto.createHash("sha256").update(env.ENCRYPTION_SECRET).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a dot-separated base64 string: `iv.authTag.ciphertext`
 */
export function encrypt(plaintext: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

/**
 * Decrypts a ciphertext string produced by `encrypt`.
 * Throws if the format is invalid or the auth tag does not match.
 */
export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(".");

  if (parts.length !== 3) {
    throw new Error("[encrypt] Invalid ciphertext format — expected iv.authTag.ciphertext");
  }

  const [ivB64, authTagB64, encryptedB64] = parts;
  const key = deriveKey();
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
