import type { ReactNode } from "react";

import { ORDER_STATUSES, labelOf, type OrderStatusId } from "@/lib/order";

const STATUS_STYLES: Record<OrderStatusId, string> = {
  novo: "bg-[var(--wine)] text-[oklch(0.98_0.005_40)]",
  escrevendo: "bg-[var(--blush)] text-[var(--wine-deep)]",
  postada: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: OrderStatusId }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {labelOf(ORDER_STATUSES, status)}
    </span>
  );
}

export function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
