import { createFileRoute } from "@tanstack/react-router";

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
        const origin = new URL(request.url).origin;

        try {
          const session = await getStripe().checkout.sessions.create({
            mode: "payment",
            locale: "pt-BR",
            customer_email: order.email,
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
            success_url: `${origin}/pedido/sucesso`,
            cancel_url: `${origin}/pedido/cancelado`,
          });
          return Response.json({ url: session.url });
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
