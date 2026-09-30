import { z } from "zod";

import { BASE_PRICE, ENVELOPE_COLORS, EXTRAS, MAX_CHARS, SEAL_COLORS } from "@/lib/napkin";

const ids = <T extends { id: string }>(options: T[]) =>
  options.map((option) => option.id) as [string, ...string[]];

const required = (max: number) => z.string().trim().min(1).max(max);

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
  buyerName: required(120),
  email: z.string().trim().email().max(200),
  whatsapp: required(30),
});

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
