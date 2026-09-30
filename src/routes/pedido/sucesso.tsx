import { createFileRoute } from "@tanstack/react-router";

import { OrderStatus } from "@/components/napkin/OrderStatus";

export const Route = createFileRoute("/pedido/sucesso")({
  head: () => ({
    meta: [{ title: "Pedido recebido | Napkin Notes" }, { name: "robots", content: "noindex" }],
  }),
  component: Success,
});

function Success() {
  return (
    <OrderStatus title="Obrigada pelo seu pedido!" linkLabel="Voltar ao início">
      <p>
        Recebemos sua carta. Assim que o pagamento for confirmado, a Tata começa a escrever à mão e
        prepara o envelope com todo o carinho.
      </p>
      <p>
        Você vai receber o comprovante da Stripe no seu e-mail. Se pagou com Pix, a confirmação pode
        levar alguns instantes.
      </p>
    </OrderStatus>
  );
}
