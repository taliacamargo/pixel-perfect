# Napkin Notes

Cartas de amor escritas à mão, personalizadas e enviadas para todo o Brasil.

Domínio: https://www.napkinotes.com.br/

## Desenvolvimento

React, TanStack Start, Vite, Tailwind CSS e Motion. Use Node.js 22.12+ e pnpm.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

O build usa Nitro com destino Vercel e gera `.vercel/output`, com os arquivos estáticos e a função de renderização no servidor. `vercel.json` define o framework, o comando de build e o diretório de saída, substituindo a configuração antiga de `dist`.

Para publicar, envie as alterações ao repositório conectado à Vercel e execute um novo deploy. A raiz do projeto na Vercel deve ser a pasta que contém `package.json` e `vercel.json`. O build local não publica o site.

## Pagamentos

O checkout usa o formulário incorporado da prévia `custom_checkout_payment_form_preview=v1`, com API `2026-09-30.endive` e `ui_mode: form`. O frontend recebe `client_secret` em JSON e monta o formulário da Stripe dentro do site. Configuração, testes e etapas restantes estão em [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md).

- O botão "Ir para o pagamento" chama `POST /api/checkout` (`src/routes/api/checkout.ts`), que valida o pedido, recalcula o preço com a tabela de `src/lib/napkin.ts` e abre o Stripe Checkout em BRL. O pedido fica nos metadados da sessão da Stripe; não há banco de dados.
- Painel em `/painel` (`src/routes/painel/`, `src/lib/painel.functions.ts`): login com `ADMIN_PASSWORD`, lista os pedidos pagos direto da Stripe (Pix confirmado depois aparece sozinho) e guarda status e rastreio nos metadados do PaymentIntent. O aviso de postagem vai pelo WhatsApp, com mensagem pronta.
- Segurança:
  - Login do painel com senha + código do app autenticador (`ADMIN_TOTP_SECRET`, gerado por `pnpm gerar-2fa`); cada código vale uma vez.
  - Limite de tentativas no login e no `/api/checkout` (`src/lib/rate-limit.server.ts`), guardado no Upstash Redis quando configurado.
  - Turnstile da Cloudflare antes do checkout, contra robôs testando cartões.
  - Cabeçalhos de segurança em todas as respostas (`src/lib/security-headers.ts`); a CSP completa está em modo de observação (`Report-Only`).
- Variáveis: veja `.env.example`. Localmente ficam em `.env.local` (fora do git); na Vercel, em Settings > Environment Variables.

## Webhook da Stripe

Após publicar o endpoint, cadastre `https://www.napkinotes.com.br/api/stripe-webhook` em Stripe > Workbench > Webhooks, para eventos da própria conta com payload **Snapshot**. Ative `checkout.session.completed`, `checkout.session.async_payment_succeeded` e `checkout.session.async_payment_failed` (pagamentos com confirmação posterior, como Pix). Copie o segredo de assinatura do destino para `STRIPE_WEBHOOK_SECRET` na Vercel e faça novo deploy; teste e produção usam segredos separados. Não coloque o segredo no código.

O endpoint verifica `Stripe-Signature` usando o corpo original. Para pedidos pagos, consulta o estado atual da sessão e registra `checkout_pagamento=paid` e `checkout_session_id` no PaymentIntent, preservando status e rastreio. Reentregas escrevem os mesmos valores; falhas de consulta ou gravação retornam HTTP 500 para permitir novas tentativas da Stripe. O painel continua consultando os pedidos pagos diretamente na Stripe.

`invoice.paid` e `invoice.payment_failed` são aceitos apenas para diagnóstico nos logs, sem ações de faturamento. O projeto não cria faturas ou assinaturas; eventos de subscription e setup não precisam ser ativados. Eventos desconhecidos recebem HTTP 200 com `ignored: true`.

Teste local: `stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed --forward-to localhost:8080/api/stripe-webhook`. Use o segredo exibido pelo CLI no ambiente local. Testes automatizados do handler: `node --experimental-strip-types --test scripts/stripe-webhook.test.mjs`.

## Identidade e SEO

- Metadados: `src/lib/site.ts` e `src/routes/index.tsx`.
- Ícones e imagem de compartilhamento: `public/`.
- Indexação: `public/robots.txt` e `public/sitemap.xml`.
- Animações: `src/components/napkin/FadeIn.tsx`; respeitam movimento reduzido e preservam o conteúdo sem JavaScript.
