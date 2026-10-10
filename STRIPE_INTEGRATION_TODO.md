# Integração Stripe — configuração e etapas restantes

## Valores a substituir

Não há placeholders em `mode` ou `line_items`. O produto é uma carta com pagamento único (`payment`); os preços reais são calculados no servidor usando `orderItems` e enviados por `price_data`. Não é necessário substituir esses valores por um Price ID de exemplo.

As chaves devem ser configuradas no ambiente, sem gravar valores no repositório. Referência: [.env.example](.env.example).

| Variável                      | Valor necessário                                                     |
| ----------------------------- | -------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`           | Chave secreta Stripe, apenas no servidor.                            |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave publicável da mesma conta e ambiente, usada no navegador.      |
| `STRIPE_WEBHOOK_SECRET`       | Segredo de assinatura do destino de eventos, específico do ambiente. |

## Parâmetros configurados

Arquivos: [checkout.ts](src/routes/api/checkout.ts), [checkout.server.ts](src/lib/checkout.server.ts), [StripeCheckoutForm.tsx](src/components/napkin/StripeCheckoutForm.tsx).

| Parâmetro                                          | Valor                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| API version                                        | `2026-09-30.endive; custom_checkout_payment_form_preview=v1`            |
| `ui_mode`                                          | `form` (SDK Stripe instalado: 22.6.2)                                   |
| `mode`                                             | `payment`                                                               |
| `billing_address_collection`                       | `required`                                                              |
| `submit_type`                                      | `auto`                                                                  |
| `shipping_address_collection.allowed_countries`    | AR, BO, BR, BV, CL, CO, EC, FK, GF, GS, GY, PE, PY, SR, UY, VE          |
| `saved_payment_method_options.payment_method_save` | `enabled`                                                               |
| `integration_identifier`                           | `custom_embedded_web_0001`                                              |
| `metadata`                                         | Dados reais da carta e do pedido; preservados por instrução do usuário. |

`payment_method_collection` não é enviado: a regra 8 do pedido restringe esse parâmetro a `mode: subscription`, enquanto este produto tem pagamento único. `locale` e `customer_email` foram removidos por não constarem dos campos configurados; o formulário coleta os dados necessários ao pagamento.

## Configuração e próximos passos

1. Confirme com a Stripe o acesso da conta à prévia do formulário, à versão Endive indicada e ao beta `custom_checkout_payment_form_1`. A documentação pública consultada não confirmou essa API específica; o código segue o contrato fornecido no pedido. A sessão recebe um Customer explícito, criado com nome e e-mail da compradora, pois a Stripe exige esse vínculo para saved_payment_method_options. Cada tentativa cria um Customer; não há reutilização por e-mail nem cadastro local de clientes.
2. Configure as variáveis acima em `.env.local` no desenvolvimento e nas variáveis do projeto na Vercel. Para o checkout também são necessárias as variáveis Turnstile existentes. Nunca use prefixo `VITE_` para segredos. Reinicie o servidor local após mudanças; na Vercel, faça novo build e deploy, pois a chave publicável é incorporada pelo Vite no build.
3. As dependências atuais são suficientes. Use `pnpm install --frozen-lockfile` e Node 22.12+ para o projeto. Stripe.js é carregado diretamente de `https://js.stripe.com/dahlia/stripe.js` no `<head>`, sem empacotar ou hospedar esse script.
4. Publique o código e cadastre o destino Snapshot `https://www.napkinotes.com.br/api/stripe-webhook` na própria conta Stripe. Ative `checkout.session.completed`, `checkout.session.async_payment_succeeded` e `checkout.session.async_payment_failed`. Configure o segredo do destino e faça novo deploy. Teste e produção usam configurações separadas. Faturas são apenas registradas nos logs; assinaturas não são implementadas.
5. Faça um pedido em modo de teste pelo site. Para sucesso, use `4242 4242 4242 4242`; para recusa, `4000 0000 0000 0002`, com validade futura e CVC de três dígitos. Confira autenticação 3DS, erros do formulário, voltar ao pedido, entrega do webhook e aparecimento da carta no painel. Veja [testes Stripe](https://docs.stripe.com/testing). Não use cartões de teste no modo de produção.
6. Teste Pix e outros meios habilitados, incluindo confirmações posteriores. O retorno visual após confirmação não substitui a verificação de pagamento: o painel e o webhook consultam a Stripe. Valide também o fluxo de retorno de meios que redirecionam, pois nenhum `return_url` foi fornecido nos Field Intents.
7. Revise preços em [napkin.ts](src/lib/napkin.ts), países de entrega e condições de envio antes de produção. A carta continua nos metadados da sessão; status e rastreio permanecem no PaymentIntent. A produção e postagem são gerenciadas pelo painel existente.

## Estrutura e fluxo

Novo componente desta etapa: [StripeCheckoutForm.tsx](src/components/napkin/StripeCheckoutForm.tsx), com tipos locais para a API de prévia, montagem, confirmação, erros e limpeza ao sair do formulário.

O [Builder](src/components/napkin/Builder.tsx) valida os dados e chama `/api/checkout` com o token Turnstile. O servidor valida o pedido e calcula os preços; responde somente com `client_secret`. Stripe.js inicializa o SDK com o beta e a aparência fornecidos, cria o formulário com layout `expanded`, monta o iframe e confirma via `formConfirmEvent`. Ao confirmar sem erro, o navegador segue para a página de pedido recebido. Nenhum dado de cartão passa pelo servidor do projeto.

Os arquivos de webhook já adicionados na etapa anterior continuam presentes: [stripe-webhook.ts](src/routes/api/stripe-webhook.ts), [stripe-webhook.server.ts](src/lib/stripe-webhook.server.ts) e [testes](scripts/stripe-webhook.test.mjs). Não foi adicionado outro endpoint de checkout ou webhook.

## Validação

Execute `pnpm exec tsc --noEmit`, `pnpm build` e `node --experimental-strip-types --test scripts/stripe-webhook.test.mjs` (testes em Node 24). A criação de sessão e a montagem real do SDK precisam ser verificadas com chaves e acesso à prévia; verificações locais não comprovam compatibilidade da conta Stripe.

## Recursos

- [Suporte Stripe](https://support.stripe.com)
- [Stripe MCP](https://docs.stripe.com/mcp)
- [Webhooks](https://docs.stripe.com/webhooks)
- [Boas práticas para chaves](https://docs.stripe.com/keys-best-practices)
