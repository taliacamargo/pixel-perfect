// Cloudflare Turnstile: confirma no servidor que o pedido veio de uma pessoa,
// não de um robô testando cartões roubados.

/** Sem TURNSTILE_SECRET_KEY a verificação fica desligada (ex.: no computador). */
export const turnstileEnabled = () => Boolean(process.env["TURNSTILE_SECRET_KEY"]);

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env["TURNSTILE_SECRET_KEY"];
  if (!secret) return true;
  if (!token) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      metadata?: { result_with_testing_key?: boolean };
    };
    // As chaves de teste da Cloudflare não devolvem a ação; as reais, sim.
    const actionOk =
      result.action === "checkout" || result.metadata?.result_with_testing_key === true;
    return result.success === true && actionOk;
  } catch (error) {
    console.error("Falha ao verificar o Turnstile", error);
    return false;
  }
}
