// Cabeçalhos de segurança aplicados a todas as respostas do servidor (páginas,
// /api e funções do painel).

const BASE_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  // Regras que não arriscam quebrar o site: ninguém abre o site dentro de outro
  // (clickjacking), nem troca a base dos links, nem carrega plugins.
  "Content-Security-Policy":
    "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
};

// Política completa, por enquanto só em modo de observação: o navegador avisa no
// console o que seria bloqueado. Depois de conferir que nada legítimo aparece,
// ela pode trocar de nome para "Content-Security-Policy" e passar a valer.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://viacep.com.br https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const isPrivate = (path: string) => path === "/painel" || path.startsWith("/painel/");
const isApi = (path: string) => path.startsWith("/api/") || path.startsWith("/_serverFn/");

export function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(BASE_HEADERS)) headers.set(name, value);
  // No `pnpm dev` o Vite usa recursos que a política completa apontaria à toa.
  if (import.meta.env.PROD) headers.set("Content-Security-Policy-Report-Only", CSP_REPORT_ONLY);

  const path = new URL(request.url).pathname;
  if (isPrivate(path) || isApi(path)) headers.set("Cache-Control", "no-store");
  if (isPrivate(path)) headers.set("X-Robots-Tag", "noindex, nofollow");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
