# Stripe Checkout hospedado

## Valores a substituir

Não há placeholders de produto, preço ou URL. O modo é payment, e line_items preserva os preços reais calculados por orderItems com price_data. As páginas existentes /pedido/sucesso e /pedido/cancelado são usadas no domínio da requisição. {CHECKOUT_SESSION_ID} é um template da Stripe, não deve ser substituído manualmente.

## Parâmetros configurados

Arquivos: [checkout.ts](src/routes/api/checkout.ts) e [checkout.server.ts](src/lib/checkout.server.ts).

| Parâmetro                       | Valor                                                             |
| ------------------------------- | ----------------------------------------------------------------- |
| ui_mode                         | hosted_page (SDK 22.6.2)                                          |
| mode                            | payment                                                           |
| billing_address_collection      | auto                                                              |
| phone_number_collection.enabled | false                                                             |
| automatic_tax.enabled           | false                                                             |
| allow_promotion_codes           | false                                                             |
| submit_type                     | auto                                                              |
| integration_identifier          | hosted_web_0001                                                   |
| origin_context                  | web                                                               |
| success_url                     | /pedido/sucesso?session_id={CHECKOUT_SESSION_ID} no domínio atual |
| cancel_url                      | /pedido/cancelado no domínio atual                                |
| metadata                        | Carta e pedido, preservados por instrução do usuário              |

Não há versão da API sobrescrita: o cliente usa a versão padrão do SDK. payment_method_collection é omitido conforme a regra que o restringe a assinaturas. Não são enviados customer, shipping_address_collection ou saved_payment_method_options, ausentes da nova configuração. O endereço de entrega já preenchido continua nos metadados; não é solicitado novamente no checkout. A Stripe pode solicitar dados de faturamento quando necessários.

## Configuração e próximos passos

1. Configure STRIPE_SECRET_KEY no servidor e STRIPE_WEBHOOK_SECRET para o destino de eventos. Use chaves da mesma conta e ambiente. Produção exige chave live e conta ativada. Nunca grave segredos no código. Veja [.env.example](.env.example). VITE_STRIPE_PUBLISHABLE_KEY não é necessária no fluxo hospedado.
2. Não há novas dependências ou rotas. O botão em [Builder.tsx](src/components/napkin/Builder.tsx) envia o pedido ao endpoint existente, recebe a URL em JSON e redireciona o navegador. Stripe.js e o beta do formulário não são usados. O componente antigo do formulário permanece sem uso.
3. Envie a alteração para a branch publicada pela Vercel e aguarde o novo deploy. Um Redeploy do código anterior não inclui esta alteração. O commit local de preenchimento de endereço anterior permanece no histórico; esta migração deixa de criar Customers.
4. Mantenha o webhook Snapshot em https://www.napkinotes.com.br/api/stripe-webhook com checkout.session.completed, checkout.session.async_payment_succeeded e checkout.session.async_payment_failed. Configure o segredo correspondente ao ambiente. [Webhook existente](src/routes/api/stripe-webhook.ts).
5. Teste primeiro com chaves de teste: cartão 4242 4242 4242 4242, validade futura e CVC de três dígitos. Para recusa: 4000 0000 0000 0002. Confira sucesso, cancelamento, Pix, entrega HTTP 200 do webhook e a carta completa no painel. Não use cartões de teste em produção. [Documentação de testes](https://docs.stripe.com/testing).
6. O retorno de sucesso não comprova pagamento: o painel e o webhook verificam o estado na Stripe. Os metadados do pedido, status de produção e rastreio continuam nos locais existentes. Revise preços em [napkin.ts](src/lib/napkin.ts) e gerencie postagem pelo painel.

## Validação

Use pnpm exec tsc --noEmit, pnpm build e node --experimental-strip-types --test scripts/stripe-webhook.test.mjs (Node 24 para os testes). Ainda é necessário testar a criação e o pagamento da sessão na conta Stripe após o deploy.

## Recursos

- [Suporte Stripe](https://support.stripe.com)
- [Stripe MCP](https://docs.stripe.com/mcp)
- [Checkout](https://docs.stripe.com/payments/checkout)
- [Boas práticas de chaves](https://docs.stripe.com/keys-best-practices)
