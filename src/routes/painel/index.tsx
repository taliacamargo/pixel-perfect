import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { formatDate } from "@/components/painel/styles";
import { StatusBadge } from "@/components/painel/ui";
import { formatBRL } from "@/lib/napkin";
import { ORDER_STATUSES, orderStatusSchema } from "@/lib/order";
import { listOrders } from "@/lib/painel.functions";

export const Route = createFileRoute("/painel/")({
  validateSearch: z.object({ status: orderStatusSchema.optional().catch(undefined) }),
  loader: ({ context }) => (context.authenticated ? listOrders() : []),
  component: OrderList,
});

const FILTERS = [{ id: undefined, label: "Todos" }, ...ORDER_STATUSES];

function OrderList() {
  const orders = Route.useLoaderData();
  const { status } = Route.useSearch();
  const visible = status ? orders.filter((order) => order.status === status) : orders;

  return (
    <div>
      <h1 className="text-3xl text-[var(--wine-deep)] dark:text-foreground">Pedidos pagos</h1>

      <nav aria-label="Filtrar por status" className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count = filter.id
            ? orders.filter((order) => order.status === filter.id).length
            : orders.length;
          return (
            <Link
              key={filter.label}
              to="/painel"
              search={filter.id ? { status: filter.id } : {}}
              aria-current={status === filter.id ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                status === filter.id
                  ? "border-[var(--wine)] bg-[var(--wine)] text-[oklch(0.98_0.005_40)]"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              {filter.label} <span className="opacity-70">({count})</span>
            </Link>
          );
        })}
      </nav>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Nenhum pedido por aqui.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((order) => (
            <li key={order.id}>
              <Link
                to="/painel/pedido/$id"
                params={{ id: order.id }}
                className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-2xl bg-card p-4 transition-shadow hover:shadow-md md:grid-cols-[9rem_1fr_10rem_6rem_7rem] md:items-center md:px-6"
              >
                <span className="order-3 text-xs text-muted-foreground md:order-none md:text-sm">
                  {formatDate(order.createdAt)}
                </span>
                <span className="order-1 truncate font-medium md:order-none">
                  {order.recipient}
                </span>
                <span className="order-4 truncate text-right text-xs text-muted-foreground md:order-none md:text-left md:text-sm">
                  {order.city}/{order.uf}
                </span>
                <span className="order-2 text-right font-light md:order-none">
                  {formatBRL(order.amount / 100)}
                </span>
                <span className="order-5 col-span-2 md:order-none md:col-span-1 md:text-right">
                  <StatusBadge status={order.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
