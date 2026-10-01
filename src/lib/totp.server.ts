import { createHmac, timingSafeEqual } from "node:crypto";

// Códigos de 6 dígitos que mudam a cada 30 segundos (TOTP, RFC 6238), os mesmos
// do Google Authenticator, Authy, 1Password etc.

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;

function base32Decode(secret: string): Buffer {
  const clean = secret.toUpperCase().replace(/[\s=-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1)
      throw new Error("ADMIN_TOTP_SECRET inválido (use o gerado por pnpm gerar-2fa)");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function totpCode(key: Buffer, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(message).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const number = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(number).padStart(6, "0");
}

/**
 * Confere o código aceitando 30 s de diferença no relógio do celular.
 * Devolve o contador que bateu (para impedir reuso do mesmo código) ou null.
 */
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secret);
  const current = Math.floor(now / 1000 / STEP_SECONDS);
  let matched: number | null = null;
  for (const counter of [current - 1, current, current + 1]) {
    // Compara todos, sem parar no primeiro, para não vazar informação pelo tempo.
    if (timingSafeEqual(Buffer.from(totpCode(key, counter)), Buffer.from(code))) matched = counter;
  }
  return matched;
}
