// Estilos e formatos compartilhados pelas telas do painel.

export const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-[var(--wine)] px-5 py-2.5 text-sm font-semibold text-[oklch(0.98_0.005_40)] transition-colors hover:bg-[var(--wine-deep)] disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";

export const formatDate = (ms: number) =>
  new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
