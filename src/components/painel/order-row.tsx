import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { formatDate } from "@/components/painel/styles";
import { StatusChip } from "@/components/painel/ui";
import { formatBRL } from "@/lib/napkin";
import type { AdminOrderSummary } from "@/lib/painel.functions";

export function OrderRows({ orders }: { orders: AdminOrderSummary[] }) {
  return (
    <ul className="divide-y divide-separator">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            to="/painel/pedido/$id"
            params={{ id: order.id }}
            className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none md:px-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="truncate font-medium">{order.recipient}</span>
                <StatusChip status={order.status} />
              </div>
              <p className="mt-0.5 truncate text-xs text-muted">
                {order.city}/{order.uf} · {formatDate(order.createdAt)}
              </p>
            </div>
            <span className="text-sm tabular-nums">{formatBRL(order.amount / 100)}</span>
            <ChevronRight
              className="size-4 text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
