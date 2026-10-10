// Microsoft Clarity (mapas de calor e gravação de sessões). Só carrega em produção,
// fora do localhost, quando VITE_CLARITY_ID existe, e nunca no /painel.

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

const CLARITY_ID: string = import.meta.env["VITE_CLARITY_ID"] ?? "";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]);

export const isPainelPath = (path: string) => path === "/painel" || path.startsWith("/painel/");

let loaded = false;
let stopped = false;

/** Carrega o script do Clarity uma única vez, se as condições permitirem. */
export function loadClarity(path: string) {
  if (loaded || typeof window === "undefined") return;
  if (!import.meta.env.PROD || !/^[a-z0-9]+$/i.test(CLARITY_ID)) return;
  if (LOCAL_HOSTS.has(window.location.hostname) || isPainelPath(path)) return;
  loaded = true;

  // Fila que guarda as chamadas feitas antes de o script terminar de baixar.
  const queue: unknown[][] = [];
  window.clarity ??= Object.assign((...args: unknown[]) => void queue.push(args), { q: queue });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(script);
}

/** Para a gravação ao entrar no painel por navegação interna (o script já estava carregado). */
export function stopClarity() {
  if (!loaded || stopped) return;
  stopped = true;
  window.clarity?.("stop");
}

/** Retoma a gravação ao sair do painel. */
export function startClarity() {
  if (!stopped) return;
  stopped = false;
  window.clarity?.("start");
}
