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

## Identidade e SEO

- Metadados: `src/lib/site.ts` e `src/routes/index.tsx`.
- Ícones e imagem de compartilhamento: `public/`.
- Indexação: `public/robots.txt` e `public/sitemap.xml`.
- Animações: `src/components/napkin/FadeIn.tsx`; respeitam movimento reduzido e preservam o conteúdo sem JavaScript.
