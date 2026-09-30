import { createFileRoute } from "@tanstack/react-router";

import { getStripe, orderToMetadata } from "@/lib/checkout.server";
import { orderItems, orderSchema } from "@/lib/order";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = orderSchema.safeParse(await request.json().catch(() => null));
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
