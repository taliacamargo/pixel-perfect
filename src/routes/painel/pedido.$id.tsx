import {
  Button,
  Chip,
  Description,
  Form,
  Input,
  Label,
  Separator,
  TextField,
  buttonVariants,
} from "@heroui/react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, MessageCircle } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { formatDate } from "@/components/painel/styles";
import { Section, StatusChip } from "@/components/painel/ui";
import { ENVELOPE_COLORS, EXTRAS, SEAL_COLORS, formatBRL } from "@/lib/napkin";
import {
  ORDER_STATUSES,
  envelopeLines,
  formatWhatsapp,
  labelOf,
  type OrderStatusId,
} from "@/lib/order";
import { getOrder, saveTracking, setOrderStatus } from "@/lib/painel.functions";

export const Route = createFileRoute("/painel/pedido/$id")({
  loader: ({ context, params }) =>
    context.authenticated ? getOrder({ data: { id: params.id } }) : null,
  component: OrderDetail,
  errorComponent: () => (
    <div className="py-16 text-center">
      <p className="text-muted">Não foi possível abrir este pedido.</p>
      <Link to="/painel/pedidos" className={`${buttonVariants({ variant: "secondary" })} mt-4`}>
        Voltar para os pedidos
      </Link>
    </div>
  ),
});

const TRACKING_PATTERN = /^[A-Z0-9]{8,30}$/;

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  } catch {
    toast.error("Não foi possível copiar. Selecione o texto e copie manualmente.");
  }
}

function whatsappLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const url = `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

const trackingMessage = (buyerName: string, recipient: string, code: string) =>
  `Olá, ${buyerName}! A sua carta para ${recipient} foi postada nos Correios. ` +
  `Código de rastreio: ${code}. Acompanhe em https://rastreamento.correios.com.br/app/index.php`;

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <Button size="sm" variant="secondary" onPress={() => copy(text, label)}>
      <Copy className="size-3.5" aria-hidden />
      Copiar {label.toLowerCase()}
    </Button>
  );
}

function OrderDetail() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<OrderStatusId | null>(null);
  const [tracking, setTracking] = useState(data?.tracking ?? "");
  const [savingTracking, setSavingTracking] = useState(false);

  if (!data) return null;
  const { order } = data;
  const address = envelopeLines(order).join("\n");
  const extras = order.extras.map((id) => labelOf(EXTRAS, id));

  const changeStatus = async (status: OrderStatusId) => {
    setPendingStatus(status);
    try {
      await setOrderStatus({ data: { id: data.id, status } });
      await router.invalidate();
      toast.success(`Status: ${labelOf(ORDER_STATUSES, status)}`);
    } catch {
      toast.error("Não foi possível mudar o status. Tente de novo.");
    }
    setPendingStatus(null);
  };

  const submitTracking = async (event: FormEvent) => {
    event.preventDefault();
    const code = tracking.replace(/\s/g, "").toUpperCase();
    if (!TRACKING_PATTERN.test(code)) {
      toast.error("Confira o código de rastreio (ex.: AB123456789BR).");
      return;
    }
    setSavingTracking(true);
    try {
      await saveTracking({ data: { id: data.id, code } });
      setTracking(code);
      await router.invalidate();
      toast.success("Rastreio salvo! Use o botão do WhatsApp para avisar a compradora.");
    } catch {
      toast.error("Não foi possível salvar o rastreio. Tente de novo.");
    }
    setSavingTracking(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/painel/pedidos"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "-ms-3" })}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Carta para {order.recipient}</h1>
          <StatusChip status={data.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {formatDate(data.createdAt)} · {formatBRL(data.amount / 100)}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div className="space-y-5">
          <Section title="Texto da carta" action={<CopyButton text={order.text} label="Texto" />}>
            <p className="rounded-xl bg-surface-secondary p-4 leading-relaxed break-words whitespace-pre-wrap">
              {order.text}
            </p>
            <p className="mt-2 text-xs text-muted">
              {order.text.length.toLocaleString("pt-BR")} caracteres
              {order.anonymous && " · carta anônima"}
            </p>
          </Section>

          <Section title="Envelope" action={<CopyButton text={address} label="Endereço" />}>
            <p className="leading-relaxed whitespace-pre-line">{address}</p>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Status">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Mudar status">
              {ORDER_STATUSES.map((status) => {
                const isCurrent = data.status === status.id;
                return (
                  <Button
                    key={status.id}
                    size="sm"
                    variant={isCurrent ? "primary" : "secondary"}
                    aria-pressed={isCurrent}
                    isDisabled={
                      isCurrent || (pendingStatus !== null && pendingStatus !== status.id)
                    }
                    isPending={pendingStatus === status.id}
                    onPress={() => changeStatus(status.id)}
                  >
                    {status.label}
                  </Button>
                );
              })}
            </div>
          </Section>

          <Section title="Rastreio">
            <Form onSubmit={submitTracking} className="flex flex-col gap-3">
              <TextField
                name="rastreio"
                value={tracking}
                onChange={(value) => setTracking(value.toUpperCase())}
                fullWidth
              >
                <Label>Código dos Correios</Label>
                <Input placeholder="AB123456789BR" autoCapitalize="characters" autoComplete="off" />
                <Description>Ao salvar, o status muda para "Postada".</Description>
              </TextField>
              <Button
                type="submit"
                fullWidth
                isDisabled={!tracking.trim()}
                isPending={savingTracking}
              >
                Salvar rastreio
              </Button>
            </Form>
          </Section>

          <Section title="Escolhas">
            <dl className="space-y-2 text-sm">
              <Row label="Envelope" value={labelOf(ENVELOPE_COLORS, order.envelope)} />
              <Row label="Lacre" value={labelOf(SEAL_COLORS, order.seal)} />
              <div className="border-t border-separator pt-3">
                <dt className="text-muted">Adicionais</dt>
                <dd className="mt-2">
                  {extras.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {extras.map((extra) => (
                        <li key={extra}>
                          <Chip size="sm" variant="secondary">
                            <Check className="size-3" aria-hidden />
                            <Chip.Label>{extra}</Chip.Label>
                          </Chip>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">Nenhum</span>
                  )}
                </dd>
              </div>
            </dl>
          </Section>

          <Section title="Compradora">
            <dl className="space-y-2 text-sm">
              <Row label="Nome" value={order.buyerName} />
              <Row
                label="E-mail"
                value={
                  <a href={`mailto:${order.email}`} className="underline underline-offset-4">
                    {order.email}
                  </a>
                }
              />
              <Row label="WhatsApp" value={formatWhatsapp(order.whatsapp)} />
            </dl>
            <Separator className="my-4" />
            <a
              href={whatsappLink(
                order.whatsapp,
                data.tracking
                  ? trackingMessage(order.buyerName, order.recipient, data.tracking)
                  : undefined,
              )}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ fullWidth: true })}
            >
              <MessageCircle className="size-4" aria-hidden />
              {data.tracking ? "Enviar rastreio no WhatsApp" : "Abrir no WhatsApp"}
            </a>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
