import { createFileRoute } from "@tanstack/react-router";

import { OrderStatus } from "@/components/napkin/OrderStatus";

export const Route = createFileRoute("/pedido/cancelado")({
  head: () => ({
    meta: [
      { title: "Pagamento não concluído | Napkin Notes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cancelled,
});

function Cancelled() {
  return (
    <OrderStatus
      title="Pagamento não concluído"
      linkLabel="Voltar para minha carta"
      linkHash="montar"
    >
      <p>Nenhum valor foi cobrado. Sua carta continua esperando por você.</p>
      <p>Se tiver alguma dúvida, é só chamar no WhatsApp.</p>
    </OrderStatus>
  );
}
