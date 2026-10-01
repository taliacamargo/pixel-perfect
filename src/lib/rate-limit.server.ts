import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getRequestIP } from "@tanstack/react-start/server";

// Limites de tentativas guardados no Upstash Redis, para valerem entre todas as
// cópias do servidor na Vercel. Sem Upstash configurado (ex.: no computador) ou
// se ele cair, os contadores ficam na memória, como proteção mínima.

type Window = `${number} m` | `${number} h`;

type LimitRule = { name: string; max: number; window: Window };

export const LIMITS = {
  loginPerIp: { name: "login-ip", max: 5, window: "15 m" },
  // Teto geral contra ataques vindos de muitos IPs. Alto o bastante para um ataque
  // não conseguir trancar a dona do painel por muito tempo.
  loginGlobal: { name: "login-total", max: 100, window: "1 h" },
  checkoutPerIp: { name: "checkout-ip", max: 10, window: "10 m" },
  checkoutGlobal: { name: "checkout-total", max: 300, window: "1 h" },
} satisfies Record<string, LimitRule>;

const hasUpstash = Boolean(
  (process.env["UPSTASH_REDIS_REST_URL"] || process.env["KV_REST_API_URL"]) &&
  (process.env["UPSTASH_REDIS_REST_TOKEN"] || process.env["KV_REST_API_TOKEN"]),
);

let redis: Redis | undefined;
const getRedis = () => (redis ??= Redis.fromEnv());

const limiters = new Map<string, Ratelimit>();
function getLimiter(rule: LimitRule): Ratelimit {
  let limiter = limiters.get(rule.name);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(rule.max, rule.window),
      prefix: `napkin:${rule.name}`,
      timeout: 3000,
    });
    limiters.set(rule.name, limiter);
  }
  return limiter;
}

const windowMs = (window: Window) => {
  const [amount, unit] = window.split(" ") as [string, "m" | "h"];
  return Number(amount) * (unit === "h" ? 3_600_000 : 60_000);
};

const memory = new Map<string, { count: number; resetAt: number }>();

function memoryHit(rule: LimitRule, id: string): boolean {
  const key = `${rule.name}:${id}`;
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs(rule.window) });
    return true;
  }
  entry.count += 1;
  return entry.count <= rule.max;
}

/** Conta uma tentativa. Devolve false se o limite já foi atingido. */
export async function hit(rule: LimitRule, id: string): Promise<boolean> {
  if (hasUpstash) {
    try {
      return (await getLimiter(rule).limit(id)).success;
    } catch (error) {
      console.error("Upstash indisponível, usando limite em memória", error);
    }
  }
  return memoryHit(rule, id);
}

/** Zera as tentativas (ex.: depois de um login certo). */
export async function reset(rule: LimitRule, id: string): Promise<void> {
  memory.delete(`${rule.name}:${id}`);
  if (!hasUpstash) return;
  try {
    await getLimiter(rule).resetUsedTokens(id);
  } catch (error) {
    console.error(error);
  }
}

const usedOnce = new Map<string, number>();

/** Marca uma chave como usada por `seconds`. Devolve false se já tinha sido usada. */
export async function claimOnce(key: string, seconds: number): Promise<boolean> {
  if (hasUpstash) {
    try {
      const result = await getRedis().set(`napkin:once:${key}`, "1", { nx: true, ex: seconds });
      return result === "OK";
    } catch (error) {
      console.error("Upstash indisponível, usando memória", error);
    }
  }
  const now = Date.now();
  for (const [k, expiresAt] of usedOnce) if (expiresAt < now) usedOnce.delete(k);
  if (usedOnce.has(key)) return false;
  usedOnce.set(key, now + seconds * 1000);
  return true;
}

/** IP de quem fez a requisição. Na Vercel, o x-forwarded-for é definido por ela e não pode ser forjado. */
export const clientIp = () => getRequestIP({ xForwardedFor: true }) ?? "desconhecido";
