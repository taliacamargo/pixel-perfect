// Formatos compartilhados pelas telas do painel.

// Fuso fixo: o servidor da Vercel roda em UTC e a tela precisa bater com o Brasil.
const TIME_ZONE = "America/Sao_Paulo";

export const formatDate = (ms: number) =>
  new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });

/** Chave "AAAA-MM" do mês no horário de Brasília. */
export const monthKey = (ms: number) =>
  new Date(ms)
    .toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", timeZone: TIME_ZONE })
    .slice(0, 7);

export const monthName = (ms: number) =>
  new Date(ms).toLocaleDateString("pt-BR", { month: "long", timeZone: TIME_ZONE });
