import assert from "node:assert/strict";
import { test } from "node:test";
import Stripe from "stripe";
import { handleStripeWebhook } from "../src/lib/stripe-webhook.server.ts";

const secret = "whsec_local_unit_test";
const webhooks = Stripe.webhooks;
const paid = {
  id: "cs_test_order",
  mode: "payment",
  payment_status: "paid",
  metadata: { carta_partes: "1" },
  payment_intent: "pi_test_order",
};
function fixture(type = "checkout.session.completed", session = paid) {
  const body = JSON.stringify({ id: "evt_test", type, data: { object: { id: session.id } } });
  const signature = webhooks.generateTestHeaderString({ payload: body, secret });
  const writes = [];
  const stripe = {
    webhooks,
    checkout: { sessions: { retrieve: async () => session } },
    paymentIntents: {
      update: async (id, params) => {
        writes.push({ id, params });
      },
    },
  };
  const request = (payload = body, header = signature) =>
    new Request("https://example.com/api/stripe-webhook", {
      method: "POST",
      body: payload,
      headers: header ? { "stripe-signature": header } : {},
    });
  return { stripe, writes, request };
}

test("rejects missing, invalid and tampered signatures without writes", async () => {
  const f = fixture();
  for (const request of [
    f.request(undefined, ""),
    f.request(undefined, "invalid"),
    f.request("{}"),
  ]) {
    assert.equal((await handleStripeWebhook(request, f.stripe, secret)).status, 400);
  }
  assert.equal(f.writes.length, 0);
});

test("paid checkout replays only write identical payment metadata", async () => {
  const f = fixture();
  for (let i = 0; i < 2; i++)
    assert.equal((await handleStripeWebhook(f.request(), f.stripe, secret)).status, 200);
  assert.deepEqual(f.writes[0], {
    id: paid.payment_intent,
    params: { metadata: { checkout_pagamento: "paid", checkout_session_id: paid.id } },
  });
  assert.deepEqual(f.writes[1], f.writes[0]);
});

test("unpaid or unrelated sessions never mark an order paid", async () => {
  for (const session of [
    { ...paid, payment_status: "unpaid" },
    { ...paid, metadata: {} },
    { ...paid, mode: "subscription" },
  ]) {
    const f = fixture("checkout.session.completed", session);
    assert.equal((await handleStripeWebhook(f.request(), f.stripe, secret)).status, 200);
    assert.equal(f.writes.length, 0);
  }
});

test("asynchronous success checks current paid session", async () => {
  const f = fixture("checkout.session.async_payment_succeeded");
  assert.equal((await handleStripeWebhook(f.request(), f.stripe, secret)).status, 200);
  assert.equal(f.writes.length, 1);
});

test("API failures return 500 and a retry succeeds", async () => {
  const f = fixture();
  const update = f.stripe.paymentIntents.update;
  f.stripe.paymentIntents.update = async () => {
    throw new Error("unavailable");
  };
  assert.equal((await handleStripeWebhook(f.request(), f.stripe, secret)).status, 500);
  f.stripe.paymentIntents.update = update;
  assert.equal((await handleStripeWebhook(f.request(), f.stripe, secret)).status, 200);
  assert.equal(f.writes.length, 1);
});

test("billing, failed and unsupported events cannot mark orders paid", async () => {
  for (const type of [
    "invoice.paid",
    "invoice.payment_failed",
    "checkout.session.async_payment_failed",
    "customer.subscription.deleted",
  ]) {
    const f = fixture(type);
    assert.equal((await handleStripeWebhook(f.request(), f.stripe, secret)).status, 200);
    assert.equal(f.writes.length, 0);
  }
});
