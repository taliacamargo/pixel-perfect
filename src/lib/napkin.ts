export const BASE_PRICE = 49;
export const MAX_CHARS = 1800;
export const ENVELOPE_COLOR_PRICE = 6;
export const SEAL_PRICE = 9;

export type ColorOption = { id: string; label: string; hex: string; price?: number };

export const ENVELOPE_COLORS: ColorOption[] = [
  { id: "branco", label: "Branco", hex: "#FFFFFF" },
  { id: "vinho", label: "Vinho", hex: "#6B1E2E", price: ENVELOPE_COLOR_PRICE },
  { id: "creme", label: "Creme", hex: "#EFE3D0", price: ENVELOPE_COLOR_PRICE },
];

export const SEAL_COLORS: ColorOption[] = [
  { id: "perola", label: "Pérola", hex: "#D9D4DC" },
  { id: "dourado", label: "Dourado", hex: "#C9A227" },
];

export type Extra = { id: string; label: string; description: string; price: number };

export const EXTRAS: Extra[] = [
  {
    id: "raminho",
    label: "Raminho seco no lacre",
    description: "capim-dos-pampas preso na cera",
    price: 5,
  },
  {
    id: "rastreio",
    label: "Envio com rastreio",
    description: "carta registrada dos Correios",
    price: 19,
  },
];

export const TEMPLATES: { id: string; label: string; text: string }[] = [
  {
    id: "saudade",
    label: "Saudade",
    text: "Meu amor, hoje a saudade apertou e eu quis te escrever do jeito antigo, com tempo e papel. Sinto falta de [algo que vocês fazem juntos]. Às vezes eu lembro de [uma memória especial] e fico sorrindo sozinho(a). Falta pouco para [próximo encontro]. Até lá, guarda esta carta como um abraço meu. Com todo o meu amor, [seu nome]",
  },
  {
    id: "namoro",
    label: "Aniversário de namoro",
    text: "Meu amor, hoje faz [tempo] que a gente escolheu dividir a vida. Lembro de [como vocês se conheceram] como se fosse ontem. De lá para cá, você me ensinou [algo que aprendeu com a pessoa]. Obrigado(a) por cada dia, inclusive os difíceis. Eu escolheria você de novo. Feliz aniversário de namoro. [seu nome]",
  },
  {
    id: "amor",
    label: "Só porque te amo",
    text: "Meu amor, não tem data especial nenhuma hoje. Só quis te lembrar que eu te amo. Amo quando você [algo que a pessoa faz]. Amo o jeito que você [outro detalhe]. E amo que, perto de você, [como você se sente]. Guarda esta carta para os dias em que você duvidar disso. Sempre seu (sua), [seu nome]",
  },
];

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
