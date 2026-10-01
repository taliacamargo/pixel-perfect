import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

import { requireEnv } from "@/lib/checkout.server";
import { LIMITS, clientIp, hit, reset, claimOnce } from "@/lib/rate-limit.server";
import { verifyTotp } from "@/lib/totp.server";

const COOKIE = "napkin_painel";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Segredo do segundo fator (app autenticador). Quando definido, o código é obrigatório. */
const totpSecret = () => process.env["ADMIN_TOTP_SECRET"] || "";

export const requiresCode = () => Boolean(totpSecret());

// A chave da sessão deriva da senha e do segredo do 2FA: trocar qualquer um dos
// dois desconecta todas as sessões abertas.
const sign = (expiresAt: string) =>
  createHmac("sha256", sha256(`napkin-painel:${requireEnv("ADMIN_PASSWORD")}:${totpSecret()}`))
    .update(expiresAt)
    .digest("base64url");

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

export function isAuthenticated(): boolean {
  const [expiresAt, signature] = (getCookie(COOKIE) ?? "").split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;
  return safeEqual(signature, sign(expiresAt));
}

export function requireAdmin(): void {
  if (!isAuthenticated()) throw new Error("Sessão expirada. Entre de novo.");
}

const TOO_MANY = "Muitas tentativas. Espere 15 minutos e tente de novo.";
const WRONG = "Senha ou código incorretos.";

export async function login(
  password: string,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const ip = clientIp();
  // Toda tentativa conta, certa ou errada; um login certo zera o contador do IP.
  const [ipAllowed, globalAllowed] = await Promise.all([
    hit(LIMITS.loginPerIp, ip),
    hit(LIMITS.loginGlobal, "todos"),
  ]);
  if (!ipAllowed || !globalAllowed) {
    console.warn(`[painel] login bloqueado por excesso de tentativas (ip ${ip})`);
    return { ok: false, error: TOO_MANY };
  }

  const passwordOk = safeEqual(password, requireEnv("ADMIN_PASSWORD"));
  const counter = requiresCode() ? verifyTotp(totpSecret(), code) : 0;
  // Cada código só vale uma vez, mesmo dentro dos seus 30 segundos.
  const codeOk =
    counter !== null &&
    (!requiresCode() || (passwordOk && (await claimOnce(`totp:${counter}`, 120))));

  if (!passwordOk || !codeOk) {
    console.warn(`[painel] login recusado (ip ${ip})`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { ok: false, error: WRONG };
  }

  await reset(LIMITS.loginPerIp, ip);
  console.info(`[painel] login feito (ip ${ip})`);
  const expiresAt = String(Date.now() + SESSION_SECONDS * 1000);
  setCookie(COOKIE, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return { ok: true };
}

export function logout(): void {
  deleteCookie(COOKIE, { httpOnly: true, secure: true, sameSite: "strict", path: "/" });
}
