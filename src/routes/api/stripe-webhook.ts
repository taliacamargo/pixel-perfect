import { createFileRoute } from "@tanstack/react-router";

import { getStripe, requireEnv } from "@/lib/checkout.server";
import { handleStripeWebhook } from "@/lib/stripe-webhook.server";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return await handleStripeWebhook(
            request,
            getStripe(),
            requireEnv("STRIPE_WEBHOOK_SECRET"),
          );
        } catch {
          console.error("[stripe-webhook] configuração indisponível");
          return Response.json({ error: "Webhook indisponível." }, { status: 500 });
        }
      },
    },
  },
});
