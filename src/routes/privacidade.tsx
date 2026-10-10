import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/napkin/SiteFooter";
import { SITE_URL } from "@/lib/site";

const TITLE = "Política de privacidade | Napkin Notes";
const DESCRIPTION =
  "Como a Napkin Notes cuida dos dados de quem compra e de quem recebe as cartas.";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${SITE_URL}privacidade` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}privacidade` }],
  }),
  component: Privacy,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl text-[var(--wine-deep)] dark:text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Privacy() {
  return (
    <>
      <main className="bg-[var(--blush)] py-20 md:py-28">
        <div className="section-container">
          <article className="mx-auto max-w-2xl space-y-10 rounded-3xl bg-card p-8 md:p-12">
            <header>
              <h1 className="text-3xl text-[var(--wine-deep)] md:text-4xl dark:text-foreground">
                Política de privacidade
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Atualizada em 10 de outubro de 2026.
              </p>
            </header>

            <Section title="Quais dados recebemos">
              <p>
                Para escrever e enviar a sua carta, pedimos o texto da carta, o nome e o endereço de
                quem vai receber, e o seu nome, e-mail e WhatsApp. Usamos esses dados só para
                preparar, enviar e acompanhar o pedido, e para falar com você sobre ele.
              </p>
            </Section>

            <Section title="Pagamento">
              <p>
                O pagamento é feito pela Stripe. Os dados do cartão ou do Pix vão direto para ela; a
                Napkin Notes não vê nem guarda essas informações.
              </p>
            </Section>

            <Section title="Serviços que ajudam o site a funcionar">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="font-medium text-foreground">ViaCEP</strong>: recebe só o CEP
                  digitado, para preencher o endereço automaticamente.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Cloudflare Turnstile</strong>:
                  verifica, sem pedir nada a você, se quem está pagando é uma pessoa e não um robô.
                </li>
                <li>
                  <strong className="font-medium text-foreground">Vercel e Upstash</strong>:
                  hospedam o site e guardam por pouco tempo o endereço IP, para limitar tentativas
                  repetidas e proteger o site contra abusos.
                </li>
              </ul>
            </Section>

            <Section title="Análise de navegação (Microsoft Clarity)">
              <p>
                Usamos o Microsoft Clarity para entender como as pessoas navegam pelo site: onde
                clicam, até onde rolam a página e em que ponto desistem. Ele gera mapas de calor e
                gravações anônimas da navegação, com a ajuda de cookies, e isso nos ajuda a deixar o
                site mais simples de usar.
              </p>
              <p>
                O texto da carta, o nome e o endereço de quem recebe e os seus dados de contato
                ficam mascarados: eles nunca aparecem nas gravações. O Clarity também não é usado na
                área administrativa do site.
              </p>
              <p>
                Para saber mais sobre como a Microsoft trata esses dados, veja a{" "}
                <a
                  href="https://privacy.microsoft.com/pt-br/privacystatement"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--wine)]"
                >
                  declaração de privacidade da Microsoft
                </a>
                .
              </p>
            </Section>

            <Section title="Por quanto tempo guardamos">
              <p>
                Os dados do pedido ficam guardados enquanto forem necessários para a entrega, para o
                atendimento e para cumprir obrigações legais, como as fiscais.
              </p>
            </Section>

            <Section title="Seus direitos">
              <p>
                Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para ver, corrigir ou
                apagar os seus dados. É só chamar no{" "}
                <a
                  href="https://wa.me/5551984553056"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--wine)]"
                >
                  WhatsApp
                </a>
                .
              </p>
            </Section>

            <Link
              to="/"
              className="inline-flex rounded-full bg-[var(--wine)] px-6 py-3.5 text-sm font-semibold text-[oklch(0.98_0.005_40)] transition-colors hover:bg-[var(--wine-deep)]"
            >
              Voltar ao início
            </Link>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
