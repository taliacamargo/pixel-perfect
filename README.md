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

- O botão "Ir para o pagamento" chama `POST /api/checkout` (`src/routes/api/checkout.ts`), que valida o pedido, recalcula o preço com a tabela de `src/lib/napkin.ts` e abre o Stripe Checkout em BRL. O pedido fica nos metadados da sessão da Stripe; não há banco de dados.
- Painel em `/painel` (`src/routes/painel/`, `src/lib/painel.functions.ts`): login com `ADMIN_PASSWORD`, lista os pedidos pagos direto da Stripe (Pix confirmado depois aparece sozinho) e guarda status e rastreio nos metadados do PaymentIntent. O aviso de postagem vai pelo WhatsApp, com mensagem pronta.
- Segurança:
  - Login do painel com senha + código do app autenticador (`ADMIN_TOTP_SECRET`, gerado por `pnpm gerar-2fa`); cada código vale uma vez.
  - Limite de tentativas no login e no `/api/checkout` (`src/lib/rate-limit.server.ts`), guardado no Upstash Redis quando configurado.
  - Turnstile da Cloudflare antes do checkout, contra robôs testando cartões.
  - Cabeçalhos de segurança em todas as respostas (`src/lib/security-headers.ts`); a CSP completa está em modo de observação (`Report-Only`).
- Variáveis: veja `.env.example`. Localmente ficam em `.env.local` (fora do git); na Vercel, em Settings > Environment Variables.

## Identidade e SEO

- Metadados: `src/lib/site.ts` e `src/routes/index.tsx`.
- Ícones e imagem de compartilhamento: `public/`.
- Indexação: `public/robots.txt` e `public/sitemap.xml`.
- Animações: `src/components/napkin/FadeIn.tsx`; respeitam movimento reduzido e preservam o conteúdo sem JavaScript.
