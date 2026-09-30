import { z } from "zod";

import { BASE_PRICE, ENVELOPE_COLORS, EXTRAS, MAX_CHARS, SEAL_COLORS } from "@/lib/napkin";

const ids = <T extends { id: string }>(options: T[]) =>
  options.map((option) => option.id) as [string, ...string[]];

const required = (max: number) => z.string().trim().min(1).max(max);

// DDDs em uso no Brasil (Anatel).
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Só os números do celular (DDD + 9 dígitos), aceitando colar com +55 ou 0 na frente. */
export function whatsappDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  return digits.slice(0, 11);
}

/** Máscara progressiva: (11) 91234-5678. */
export function formatWhatsapp(value: string): string {
  const d = whatsappDigits(value);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const isSequence = (digits: string) =>
  [1, -1].some((step) =>
    [...digits].every((d, i) => i === 0 || Number(d) - Number(digits[i - 1]) === step),
  );

/** Celular brasileiro plausível: DDD válido, começa com 9 e não é número de mentira. */
export function isValidWhatsapp(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false;
  if (!VALID_DDDS.has(Number(digits.slice(0, 2))) || digits[2] !== "9") return false;
  const line = digits.slice(3);
  return !/^(\d)\1+$/.test(line) && !isSequence(line);
}

export const orderSchema = z.object({
  text: z.string().trim().min(20).max(MAX_CHARS),
  envelope: z.enum(ids(ENVELOPE_COLORS)),
  seal: z.enum(ids(SEAL_COLORS)),
  extras: z.array(z.enum(ids(EXTRAS))).max(EXTRAS.length),
  anonymous: z.boolean(),
  recipient: required(120),
  cep: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().length(8)),
  street: required(200),
  number: required(20),
  complement: z.string().trim().max(100),
  district: z.string().trim().max(120),
  city: required(120),
  uf: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/),
  buyerName: z.string().trim().min(2, "Informe seu nome.").max(120, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .email("Confira o e-mail: parece que falta algo.")
    .max(200, "E-mail muito longo."),
  whatsapp: z
    .string()
    .transform(whatsappDigits)
    .refine((digits) => digits.length > 0, "Informe seu WhatsApp.")
    .refine(
      (digits) => digits.length === 0 || isValidWhatsapp(digits),
      "Informe um celular válido com DDD, ex.: (11) 91234-5678.",
    ),
});

export const buyerSchema = orderSchema.pick({ buyerName: true, email: true, whatsapp: true });

export type Order = z.infer<typeof orderSchema>;

export const ORDER_STATUSES = [
  { id: "novo", label: "Novo" },
  { id: "escrevendo", label: "Escrevendo" },
  { id: "postada", label: "Postada" },
] as const;

export type OrderStatusId = (typeof ORDER_STATUSES)[number]["id"];

export const orderStatusSchema = z.enum(["novo", "escrevendo", "postada"]);

export const labelOf = (options: readonly { id: string; label: string }[], id: string) =>
  options.find((option) => option.id === id)?.label ?? id;

/** Destinatário no padrão dos Correios, pronto para copiar no envelope. */
export function envelopeLines(order: Order): string[] {
  const cep = order.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  return [
    order.recipient,
    [`${order.street}, ${order.number}`, order.complement].filter(Boolean).join(" - "),
    order.district,
    `${cep} ${order.city} - ${order.uf}`,
  ].filter(Boolean);
}

export type OrderItem = { label: string; price: number };

/** Itens cobrados, em reais. O preço vem sempre desta tabela, nunca do navegador. */
export function orderItems(order: Pick<Order, "envelope" | "extras">): OrderItem[] {
  const items: OrderItem[] = [{ label: "Carta escrita à mão + envio", price: BASE_PRICE }];
  const envelope = ENVELOPE_COLORS.find((color) => color.id === order.envelope);
  if (envelope?.price) {
    items.push({ label: `Envelope colorido (${envelope.label})`, price: envelope.price });
  }
  for (const extra of EXTRAS) {
    if (order.extras.includes(extra.id)) items.push({ label: extra.label, price: extra.price });
  }
  return items;
}
