import { Card, Tabs } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { OrderRows } from "@/components/painel/order-row";
import { PageHeader, PanelError } from "@/components/painel/ui";
import { ORDER_STATUSES, orderStatusSchema } from "@/lib/order";
import { listOrders } from "@/lib/painel.functions";

export const Route = createFileRoute("/painel/pedidos")({
  validateSearch: z.object({ status: orderStatusSchema.optional().catch(undefined) }),
  loader: ({ context }) => (context.authenticated ? listOrders() : []),
  component: OrderList,
  errorComponent: ({ reset }) => <PanelError reset={reset} />,
});

const FILTERS = [{ id: "todos", label: "Todos" }, ...ORDER_STATUSES];

function OrderList() {
  const orders = Route.useLoaderData();
  const { status } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const visible = status ? orders.filter((order) => order.status === status) : orders;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Todos os pedidos pagos, do mais recente ao mais antigo."
      />

      <Tabs
        selectedKey={status ?? "todos"}
        onSelectionChange={(key) => {
          const next = orderStatusSchema.safeParse(key);
          void navigate({ search: next.success ? { status: next.data } : {} });
        }}
        align="start"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Filtrar por status">
            {FILTERS.map((filter) => {
              const count =
                filter.id === "todos"
                  ? orders.length
                  : orders.filter((order) => order.status === filter.id).length;
              return (
                <Tabs.Tab key={filter.id} id={filter.id}>
                  {filter.label}
                  <span className="ms-1.5 text-xs tabular-nums opacity-60">{count}</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <Card className="overflow-hidden p-0">
        <Card.Content className="px-0 py-1">
          {visible.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">Nenhum pedido por aqui.</p>
          ) : (
            <OrderRows orders={visible} />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
