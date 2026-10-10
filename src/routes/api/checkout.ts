import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";

import { getStripe, orderToMetadata } from "@/lib/checkout.server";
import { orderItems, orderSchema } from "@/lib/order";
import { LIMITS, clientIp, hit } from "@/lib/rate-limit.server";
import { verifyTurnstile } from "@/lib/turnstile.server";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Barreiras contra robôs testando cartões: limite por IP e geral, e Turnstile.
        const ip = clientIp();
        const [ipAllowed, globalAllowed] = await Promise.all([
          hit(LIMITS.checkoutPerIp, ip),
          hit(LIMITS.checkoutGlobal, "todos"),
        ]);
        if (!ipAllowed || !globalAllowed) {
          console.warn(`[checkout] bloqueado por excesso de tentativas (ip ${ip})`);
          return Response.json(
            { error: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." },
            { status: 429 },
          );
        }

        const body = (await request.json().catch(() => null)) as {
          turnstileToken?: unknown;
        } | null;
        const token = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
        if (!(await verifyTurnstile(token, ip))) {
          console.warn(`[checkout] Turnstile recusado (ip ${ip})`);
          return Response.json(
            {
              error:
                "Não conseguimos confirmar que você não é um robô. Recarregue a página e tente de novo.",
            },
            { status: 403 },
          );
        }

        const parsed = orderSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: "Confira os dados do pedido e tente novamente." },
            { status: 400 },
          );
        }
        const order = parsed.data;

        try {
          // Saving a payment method requires a Customer attached to this session.
          const customer = await getStripe().customers.create({
            email: order.email,
            name: order.buyerName,
            shipping: {
              name: order.recipient,
              address: {
                country: "BR",
                postal_code: order.cep,
                state: order.uf,
                city: order.city,
                line1: `${order.street}, ${order.number}`,
                line2: [order.complement, order.district].filter(Boolean).join(" — "),
              },
            },
          });
          // Preview fields are not yet included in the installed Stripe SDK types.
          const params: Omit<Stripe.Checkout.SessionCreateParams, "ui_mode"> & {
            ui_mode: "form";
            integration_identifier: string;
          } = {
            mode: "payment",
            customer: customer.id,
            ui_mode: "form",
            billing_address_collection: "required",
            submit_type: "auto",
            shipping_address_collection: {
              allowed_countries: [
                "AR",
                "BO",
                "BR",
                "BV",
                "CL",
                "CO",
                "EC",
                "FK",
                "GF",
                "GS",
                "GY",
                "PE",
                "PY",
                "SR",
                "UY",
                "VE",
              ],
            },
            integration_identifier: "custom_embedded_web_0001",
            saved_payment_method_options: { payment_method_save: "enabled" },
            // Sem payment_method_types: a Stripe mostra os métodos ativos no painel (cartão, Pix).
            line_items: orderItems(order).map((item) => ({
              quantity: 1,
              price_data: {
                currency: "brl",
                unit_amount: item.price * 100,
                product_data: { name: item.label },
              },
            })),
            metadata: orderToMetadata(order),
          };
          const session = await getStripe().checkout.sessions.create(
            params as Stripe.Checkout.SessionCreateParams,
          );
          if (!session.client_secret) {
            throw new Error("A sessão da Stripe não retornou o segredo do formulário.");
          }
          return Response.json({ client_secret: session.client_secret });
        } catch (error) {
          console.error(error);
          return Response.json(
            { error: "Não foi possível iniciar o pagamento. Tente novamente em instantes." },
            { status: 500 },
          );
        }
      },
    },
  },
});
