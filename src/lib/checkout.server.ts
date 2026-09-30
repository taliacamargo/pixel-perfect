import Stripe from "stripe";

import type { Order } from "@/lib/order";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada`);
  return value;
}

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  stripe ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return stripe;
}

// Cada valor de metadados da Stripe aceita até 500 caracteres; o texto da carta
// vai em pedaços menores (sem partir emojis ao meio) e é remontado no painel.
const TEXT_CHUNK = 450;

function splitText(text: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (const char of text) {
    if (current.length + char.length > TEXT_CHUNK) {
      parts.push(current);
      current = "";
    }
    current += char;
  }
  if (current) parts.push(current);
  return parts;
}

export function orderToMetadata(order: Order): Record<string, string> {
  const parts = splitText(order.text);
  const metadata: Record<string, string> = {
    envelope: order.envelope,
    lacre: order.seal,
    adicionais: order.extras.join(","),
    anonima: order.anonymous ? "sim" : "nao",
    destinatario: order.recipient,
    cep: order.cep,
    rua: order.street,
    numero: order.number,
    complemento: order.complement,
    bairro: order.district,
    cidade: order.city,
    uf: order.uf,
    compradora_nome: order.buyerName,
    compradora_email: order.email,
    compradora_whatsapp: order.whatsapp,
    carta_partes: String(parts.length),
  };
  parts.forEach((part, index) => {
    metadata[`carta_${index + 1}`] = part;
  });
  return metadata;
}

export function metadataToOrder(metadata: Record<string, string>): Order {
  const get = (key: string) => metadata[key] ?? "";
  const partCount = Number(get("carta_partes"));
  const text = Array.from({ length: partCount }, (_, i) => get(`carta_${i + 1}`)).join("");
  const extras = get("adicionais");
  return {
    text,
    envelope: get("envelope"),
    seal: get("lacre"),
    extras: extras ? extras.split(",") : [],
    anonymous: get("anonima") === "sim",
    recipient: get("destinatario"),
    cep: get("cep"),
    street: get("rua"),
    number: get("numero"),
    complement: get("complemento"),
    district: get("bairro"),
    city: get("cidade"),
    uf: get("uf"),
    buyerName: get("compradora_nome"),
    email: get("compradora_email"),
    whatsapp: get("compradora_whatsapp"),
  };
}
