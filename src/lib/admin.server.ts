import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, getRequestIP, setCookie } from "@tanstack/react-start/server";

import { requireEnv } from "@/lib/checkout.server";

const COOKIE = "napkin_painel";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// A chave da sessão deriva da senha: trocar ADMIN_PASSWORD desconecta todas as sessões.
const sign = (expiresAt: string) =>
  createHmac("sha256", sha256(`napkin-painel:${requireEnv("ADMIN_PASSWORD")}`))
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

// Limite de tentativas. Sem banco de dados, os contadores ficam na memória do servidor:
// seguram ataques em sequência, mas zeram quando a Vercel reinicia a função.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_IP = 5;
const MAX_FAILURES_TOTAL = 20;
const failures = new Map<string, { count: number; resetAt: number }>();

function failureCount(key: string, now: number): number {
  const entry = failures.get(key);
  if (!entry || entry.resetAt < now) return 0;
  return entry.count;
}

function recordFailure(key: string, now: number): void {
  const entry = failures.get(key);
  if (!entry || entry.resetAt < now) failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count += 1;
}

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  const now = Date.now();
  const ip = getRequestIP({ xForwardedFor: true }) ?? "desconhecido";
  if (
    failureCount(ip, now) >= MAX_FAILURES_PER_IP ||
    failureCount("*", now) >= MAX_FAILURES_TOTAL
  ) {
    return { ok: false, error: "Muitas tentativas. Espere 15 minutos e tente de novo." };
  }

  if (!safeEqual(password, requireEnv("ADMIN_PASSWORD"))) {
    recordFailure(ip, now);
    recordFailure("*", now);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { ok: false, error: "Senha incorreta." };
  }

  failures.delete(ip);
  const expiresAt = String(now + SESSION_SECONDS * 1000);
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
