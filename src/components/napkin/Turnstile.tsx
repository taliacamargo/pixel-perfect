import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";

// Cloudflare Turnstile: um "não sou robô" que normalmente fica invisível e só
// mostra um desafio quando a Cloudflare desconfia de quem está na página.

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | undefined;

function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("Não foi possível carregar o Turnstile"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

export const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string) => void }>(
  function Turnstile({ onToken }, ref) {
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;

    useImperativeHandle(ref, () => ({
      // Cada token vale uma vez: depois de uma tentativa, pede um novo.
      reset: () => {
        onTokenRef.current("");
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      },
    }));

    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return;
      let cancelled = false;
      loadScript()
        .then(() => {
          if (cancelled || !container.current || !window.turnstile) return;
          widgetId.current = window.turnstile.render(container.current, {
            sitekey: TURNSTILE_SITE_KEY,
            action: "checkout",
            appearance: "interaction-only",
            language: "pt-br",
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(""),
            "error-callback": () => onTokenRef.current(""),
          });
        })
        .catch((error) => console.error(error));
      return () => {
        cancelled = true;
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      };
    }, []);

    if (!TURNSTILE_SITE_KEY) return null;
    return <div ref={container} className="mt-4 flex justify-center empty:hidden" />;
  },
);
