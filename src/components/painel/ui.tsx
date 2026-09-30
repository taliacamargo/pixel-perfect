import { Button, Card, Chip } from "@heroui/react";
import { useRouter } from "@tanstack/react-router";
import { CircleAlert, CircleDot, PenLine, Send, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ORDER_STATUSES, labelOf, type OrderStatusId } from "@/lib/order";

const STATUS_LOOK: Record<
  OrderStatusId,
  { color: "accent" | "warning" | "success"; icon: LucideIcon }
> = {
  novo: { color: "accent", icon: CircleDot },
  escrevendo: { color: "warning", icon: PenLine },
  postada: { color: "success", icon: Send },
};

/** Status sempre com ícone + texto, nunca só pela cor. */
export function StatusChip({ status }: { status: OrderStatusId }) {
  const { color, icon: Icon } = STATUS_LOOK[status];
  return (
    <Chip color={color} variant="soft" size="sm">
      <Icon className="size-3" aria-hidden />
      <Chip.Label>{labelOf(ORDER_STATUSES, status)}</Chip.Label>
    </Chip>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <Card.Content className="gap-1">
        <div className="flex items-center justify-between gap-2 text-sm text-muted">
          <span>{label}</span>
          <Icon className="size-4" aria-hidden />
        </div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">{value}</p>
        {detail && <p className="text-xs text-muted">{detail}</p>}
      </Card.Content>
    </Card>
  );
}

/** Cartão com título e ação opcional no canto (ex.: botão de copiar). */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <Card.Header className="flex-row items-center justify-between gap-3">
        <Card.Title className="text-base">{title}</Card.Title>
        {action}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

/** Erro de carregamento dentro do painel (ex.: Stripe fora do ar ou chave errada). */
export function PanelError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <Card className="mx-auto max-w-md text-center">
      <Card.Content className="items-center gap-3 py-8">
        <CircleAlert className="size-6 text-danger" aria-hidden />
        <p className="font-medium">Não foi possível carregar os pedidos.</p>
        <p className="text-sm text-muted">Confira a conexão e a chave da Stripe e tente de novo.</p>
        <Button
          variant="secondary"
          onPress={async () => {
            await router.invalidate();
            reset();
          }}
        >
          Tentar de novo
        </Button>
      </Card.Content>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
