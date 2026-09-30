import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { z } from "zod";

import { isAuthenticated, login, logout, requireAdmin } from "@/lib/admin.server";
import { getStripe, metadataToOrder } from "@/lib/checkout.server";
import { orderStatusSchema, type Order, type OrderStatusId } from "@/lib/order";

export type AdminOrderSummary = {
  id: string;
  createdAt: number;
  recipient: string;
  city: string;
  uf: string;
  amount: number;
  status: OrderStatusId;
};

export type AdminOrder = AdminOrderSummary & { order: Order; tracking: string };

// Status e rastreio ficam nos metadados do PaymentIntent de cada pedido.
function toSummary(session: Stripe.Checkout.Session): AdminOrderSummary {
  const intent = session.payment_intent as Stripe.PaymentIntent;
  const metadata = session.metadata ?? {};
  return {
    id: session.id,
    createdAt: session.created * 1000,
    recipient: metadata["destinatario"] ?? "",
    city: metadata["cidade"] ?? "",
    uf: metadata["uf"] ?? "",
    amount: session.amount_total ?? 0,
    status: orderStatusSchema.catch("novo").parse(intent.metadata["status_pedido"]),
  };
}

function toAdminOrder(session: Stripe.Checkout.Session): AdminOrder {
  const intent = session.payment_intent as Stripe.PaymentIntent;
  return {
    ...toSummary(session),
    tracking: intent.metadata["rastreio"] ?? "",
    order: metadataToOrder(session.metadata ?? {}),
  };
}

const isPaidOrder = (session: Stripe.Checkout.Session) =>
  session.payment_status === "paid" &&
  typeof session.payment_intent === "object" &&
  session.payment_intent !== null &&
  Boolean(session.metadata?.["carta_partes"]);

async function getPaidSession(id: string): Promise<Stripe.Checkout.Session> {
  const session = await getStripe().checkout.sessions.retrieve(id, {
    expand: ["payment_intent"],
  });
  if (!isPaidOrder(session)) throw new Error("Pedido não encontrado.");
  return session;
}

const sessionId = z.string().regex(/^cs_[A-Za-z0-9_]+$/);

export const getAdminSession = createServerFn().handler(() => ({
  authenticated: isAuthenticated(),
}));

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().min(1).max(200) }))
  .handler(({ data }) => login(data.password));

export const adminLogout = createServerFn({ method: "POST" }).handler(() => logout());

export const listOrders = createServerFn().handler(async () => {
  requireAdmin();
  const orders: AdminOrderSummary[] = [];
  // A Stripe devolve do mais recente para o mais antigo.
  for await (const session of getStripe().checkout.sessions.list({
    status: "complete",
    limit: 100,
    expand: ["data.payment_intent"],
  })) {
    if (isPaidOrder(session)) orders.push(toSummary(session));
  }
  return orders;
});

export const getOrder = createServerFn()
  .inputValidator(z.object({ id: sessionId }))
  .handler(async ({ data }) => {
    requireAdmin();
    return toAdminOrder(await getPaidSession(data.id));
  });

async function updateOrderMetadata(id: string, metadata: Record<string, string>) {
  const session = await getPaidSession(id);
  const intent = session.payment_intent as Stripe.PaymentIntent;
  await getStripe().paymentIntents.update(intent.id, { metadata });
  return session;
}

export const setOrderStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: sessionId, status: orderStatusSchema }))
  .handler(async ({ data }) => {
    requireAdmin();
    await updateOrderMetadata(data.id, { status_pedido: data.status });
  });

export const saveTracking = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: sessionId,
      code: z
        .string()
        .transform((value) => value.replace(/\s/g, "").toUpperCase())
        .pipe(z.string().regex(/^[A-Z0-9]{8,30}$/, "Código de rastreio inválido.")),
    }),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    await updateOrderMetadata(data.id, { rastreio: data.code, status_pedido: "postada" });
  });
