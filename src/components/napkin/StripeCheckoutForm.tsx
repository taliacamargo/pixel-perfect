import { useEffect, useRef, useState } from "react";

type ConfirmEvent = unknown;
type CheckoutForm = {
  mount: (element: HTMLElement) => void;
  on: (event: "confirm", handler: (event: ConfirmEvent) => Promise<void>) => void;
  destroy?: () => void;
};
type Checkout = {
  createForm: (options: { layout: "expanded" }) => CheckoutForm;
  loadActions: () => Promise<
    | {
        type: "success";
        actions: {
          confirm: (options: {
            formConfirmEvent: ConfirmEvent;
          }) => Promise<{ error?: { message?: string } } | void>;
        };
      }
    | { type: "error"; error?: { message?: string } }
  >;
  destroy?: () => void;
};
type StripeFactory = (
  key: string,
  options: { betas: string[] },
) => {
  initCheckoutFormSdk: (options: {
    clientSecret: Promise<string>;
    appearance: typeof appearance;
  }) => Checkout;
};

const appearance = {
  theme: "stripe",
  labels: "auto",
  inputs: "condensed",
  variables: {
    borderRadius: "4px",
    colorBackground: "#fbf5f3",
    colorDanger: "#df1b41",
    colorPrimary: "#6b1e2e",
    colorSuccess: "#00c853",
    colorText: "#30313d",
    fontFamily: "Be Vietnam Pro",
    fontSizeBase: "16px",
    spacingUnit: "4px",
  },
};

function stripeFactory(): StripeFactory | undefined {
  return (window as Window & { Stripe?: StripeFactory }).Stripe;
}

async function loadStripe(): Promise<StripeFactory> {
  const existing = stripeFactory();
  if (existing) return existing;
  return new Promise((resolve, reject) => {
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.stripe.com/dahlia/stripe.js"]',
    );
    if (!script) {
      reject(new Error("Não foi possível carregar o pagamento."));
      return;
    }
    const cleanup = () => {
      window.clearTimeout(timer);
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    const failed = () => {
      cleanup();
      reject(new Error("Não foi possível carregar o pagamento. Tente novamente."));
    };
    const loaded = () => {
      const factory = stripeFactory();
      cleanup();
      if (factory) resolve(factory);
      else reject(new Error("O formulário de pagamento está indisponível."));
    };
    const timer = window.setTimeout(failed, 15000);
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
  });
}

export function StripeCheckoutForm({
  clientSecret,
  onBack,
}: {
  clientSecret: string;
  onBack: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let disposed = false;
    let form: CheckoutForm | undefined;
    let checkout: Checkout | undefined;
    let busy = false;
    async function mount() {
      try {
        const key = import.meta.env["VITE_STRIPE_PUBLISHABLE_KEY"] as string | undefined;
        if (!key) throw new Error("O pagamento está indisponível no momento.");
        const Stripe = await loadStripe();
        if (disposed) return;
        const stripe = Stripe(key, { betas: ["custom_checkout_payment_form_1"] });
        checkout = stripe.initCheckoutFormSdk({
          clientSecret: Promise.resolve(clientSecret),
          appearance,
        });
        const result = await checkout.loadActions();
        if (disposed) return;
        if (result.type !== "success")
          throw new Error(result.error?.message || "Não foi possível abrir o pagamento.");
        form = checkout.createForm({ layout: "expanded" });
        form.on("confirm", async (event) => {
          if (disposed || busy) return;
          busy = true;
          setConfirming(true);
          setError("");
          try {
            const confirmation = await result.actions.confirm({ formConfirmEvent: event });
            if (confirmation?.error)
              throw new Error(confirmation.error.message || "Confira os dados de pagamento.");
            if (!disposed) window.location.assign("/pedido/sucesso");
          } catch (failure) {
            if (!disposed)
              setError(
                failure instanceof Error
                  ? failure.message
                  : "Não foi possível confirmar o pagamento.",
              );
          } finally {
            busy = false;
            if (!disposed) setConfirming(false);
          }
        });
        if (container.current) form.mount(container.current);
        setLoading(false);
      } catch (failure) {
        if (!disposed) {
          setError(
            failure instanceof Error ? failure.message : "Não foi possível abrir o pagamento.",
          );
          setLoading(false);
        }
      }
    }
    void mount();
    return () => {
      disposed = true;
      form?.destroy?.();
      checkout?.destroy?.();
    };
  }, [clientSecret]);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-card p-6 md:p-8">
      <h3 className="mb-6 text-xl">Pagamento</h3>
      {loading && <p role="status">Carregando o pagamento…</p>}
      <div id="checkout-form" ref={container} data-clarity-mask="true" />
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      {confirming && (
        <p role="status" className="mt-4 text-sm">
          Confirmando o pagamento…
        </p>
      )}
      <button
        type="button"
        onClick={onBack}
        disabled={confirming}
        className="mt-6 text-sm underline disabled:opacity-40"
      >
        Voltar ao pedido
      </button>
    </div>
  );
}
