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

O build usa Nitro com destino Cloudflare Workers. A publicação e a configuração de DNS são feitas na hospedagem; o build local não publica o site.

## Identidade e SEO

- Metadados: `src/lib/site.ts` e `src/routes/index.tsx`.
- Ícones e imagem de compartilhamento: `public/`.
- Indexação: `public/robots.txt` e `public/sitemap.xml`.
- Animações: `src/components/napkin/FadeIn.tsx`; respeitam movimento reduzido e preservam o conteúdo sem JavaScript.
