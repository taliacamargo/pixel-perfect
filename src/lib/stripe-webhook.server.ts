import type Stripe from "stripe";

/** Verify the original body before reading any event data. */
export async function handleStripeWebhook(
  request: Request,
  stripe: Stripe,
  signingSecret: string,
): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Assinatura ausente." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, signingSecret);
  } catch {
    return Response.json({ error: "Evento ou assinatura inválidos." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        // Retrieve current state: events can be duplicated or arrive out of order.
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
        if (
          session.mode !== "payment" ||
          session.payment_status !== "paid" ||
          !session.metadata?.["carta_partes"] ||
          !session.payment_intent
        )
          break;
        const intentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id;
        // Only payment metadata: never reset order status or tracking.
        // Repeated deliveries write the same values, including across server instances.
        await stripe.paymentIntents.update(intentId, {
          metadata: { checkout_pagamento: "paid", checkout_session_id: session.id },
        });
        break;
      }
      case "checkout.session.async_payment_failed":
      case "invoice.paid":
      case "invoice.payment_failed":
        // Billing is not implemented; acknowledge for delivery diagnostics only.
        console.info("[stripe-webhook] evento recebido", {
          id: event.id,
          type: event.type,
          objectId: event.data.object.id,
        });
        break;
      default:
        return Response.json({ received: true, ignored: true });
    }
    return Response.json({ received: true });
  } catch {
    console.error("[stripe-webhook] falha no processamento", { id: event.id, type: event.type });
    // Stripe retries failed deliveries. Do not acknowledge before successful processing.
    return Response.json({ error: "Falha ao processar o evento." }, { status: 500 });
  }
}
