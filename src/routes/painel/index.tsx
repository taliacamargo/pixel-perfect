import { Card, buttonVariants } from "@heroui/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Mail, PenLine, Receipt, Wallet } from "lucide-react";

import { OrderRows } from "@/components/painel/order-row";
import { monthKey, monthName } from "@/components/painel/styles";
import { PageHeader, PanelError, StatCard } from "@/components/painel/ui";
import { formatBRL } from "@/lib/napkin";
import { listOrders, type AdminOrderSummary } from "@/lib/painel.functions";

export const Route = createFileRoute("/painel/")({
  loader: ({ context }) => (context.authenticated ? listOrders() : []),
  component: Dashboard,
  errorComponent: ({ reset }) => <PanelError reset={reset} />,
});

const sum = (orders: AdminOrderSummary[]) => orders.reduce((total, o) => total + o.amount, 0) / 100;

function previousMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number) as [number, number];
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
}

function Delta({
  current,
  previous,
  previousLabel,
}: {
  current: number;
  previous: number;
  previousLabel: string;
}) {
  if (previous === 0) return <>Sem vendas em {previousLabel} para comparar</>;
  const change = Math.round(((current - previous) / previous) * 100);
  const Icon = change >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3.5" aria-hidden />
      {change >= 0 ? "+" : ""}
      {change}% em relação a {previousLabel}
    </span>
  );
}

function Dashboard() {
  const orders = Route.useLoaderData();
  const now = Date.now();
  const thisMonth = monthKey(now);
  const lastMonth = previousMonthKey(thisMonth);
  const lastMonthLabel = monthName(new Date(`${lastMonth}-15T12:00:00Z`).getTime());

  const monthOrders = orders.filter((o) => monthKey(o.createdAt) === thisMonth);
  const lastMonthOrders = orders.filter((o) => monthKey(o.createdAt) === lastMonth);
  const newOrders = orders.filter((o) => o.status === "novo");
  const writing = orders.filter((o) => o.status === "escrevendo");
  // Fila de produção: quem pagou primeiro vem primeiro.
  const queue = [...newOrders, ...writing].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Visão geral"
        description={`Resumo de ${monthName(now)} e cartas esperando por você.`}
      />

      <section aria-label="Números do mês" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label={`Vendas em ${monthName(now)}`}
          value={formatBRL(sum(monthOrders))}
          detail={
            <Delta
              current={sum(monthOrders)}
              previous={sum(lastMonthOrders)}
              previousLabel={lastMonthLabel}
            />
          }
        />
        <StatCard
          icon={Mail}
          label={`Pedidos em ${monthName(now)}`}
          value={String(monthOrders.length)}
          detail={`${orders.length} pedidos pagos no total`}
        />
        <StatCard
          icon={PenLine}
          label="Na fila"
          value={String(queue.length)}
          detail={`${newOrders.length} novos · ${writing.length} escrevendo`}
        />
        <StatCard
          icon={Receipt}
          label="Ticket médio"
          value={orders.length ? formatBRL(sum(orders) / orders.length) : "—"}
          detail="Considerando todos os pedidos"
        />
      </section>

      <Card className="overflow-hidden p-0">
        <Card.Header className="flex-row items-center justify-between gap-3 px-4 pt-4 md:px-5">
          <div>
            <Card.Title className="text-base">Precisam de você</Card.Title>
            <Card.Description>
              Pedidos novos e em escrita, do mais antigo para o mais novo.
            </Card.Description>
          </div>
          <Link
            to="/painel/pedidos"
            className={buttonVariants({ variant: "tertiary", size: "sm" })}
          >
            Ver todos
          </Link>
        </Card.Header>
        <Card.Content className="px-0 pb-1">
          {queue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Tudo em dia! Nenhuma carta esperando.
            </p>
          ) : (
            <OrderRows orders={queue.slice(0, 6)} />
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
