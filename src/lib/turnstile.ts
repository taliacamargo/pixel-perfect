/** Chave pública do Turnstile. Sem ela, o widget não aparece (e o servidor não exige o token). */
export const TURNSTILE_SITE_KEY: string = import.meta.env["VITE_TURNSTILE_SITE_KEY"] ?? "";
