import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { formatDate, primaryButton, secondaryButton } from "@/components/painel/styles";
import { Card, StatusBadge } from "@/components/painel/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ENVELOPE_COLORS, EXTRAS, SEAL_COLORS, formatBRL } from "@/lib/napkin";
import { ORDER_STATUSES, envelopeLines, labelOf, type OrderStatusId } from "@/lib/order";
import { getOrder, saveTracking, setOrderStatus } from "@/lib/painel.functions";

export const Route = createFileRoute("/painel/pedido/$id")({
  loader: ({ context, params }) =>
    context.authenticated ? getOrder({ data: { id: params.id } }) : null,
  component: OrderDetail,
  errorComponent: () => (
    <div className="mt-10 text-center">
      <p className="text-muted-foreground">Não foi possível abrir este pedido.</p>
      <Link to="/painel" className={`${secondaryButton} mt-4`}>
        Voltar para a lista
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
    <div className="space-y-5">
      <div>
        <Link to="/painel" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Todos os pedidos
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl text-[var(--wine-deep)] md:text-3xl dark:text-foreground">
            Carta para {order.recipient}
          </h1>
          <StatusBadge status={data.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(data.createdAt)} · {formatBRL(data.amount / 100)}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-5">
          <Card
            title="Texto da carta"
            action={
              <button
                type="button"
                className={secondaryButton}
                onClick={() => copy(order.text, "Texto")}
              >
                Copiar texto
              </button>
            }
          >
            <p className="rounded-2xl bg-[var(--paper)] p-4 leading-relaxed break-words whitespace-pre-wrap dark:bg-muted">
              {order.text}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {order.text.length.toLocaleString("pt-BR")} caracteres
              {order.anonymous && " · carta anônima"}
            </p>
          </Card>

          <Card
            title="Envelope"
            action={
              <button
                type="button"
                className={secondaryButton}
                onClick={() => copy(address, "Endereço")}
              >
                Copiar endereço
              </button>
            }
          >
            <p className="leading-relaxed whitespace-pre-line">{address}</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Status">
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status.id}
                  type="button"
                  disabled={data.status === status.id || pendingStatus !== null}
                  aria-pressed={data.status === status.id}
                  onClick={() => changeStatus(status.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    data.status === status.id
                      ? "border-[var(--wine)] bg-[var(--wine)] text-[oklch(0.98_0.005_40)]"
                      : "border-border hover:bg-accent disabled:opacity-40"
                  }`}
                >
                  {pendingStatus === status.id ? "Salvando…" : status.label}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Rastreio">
            <form onSubmit={submitTracking} className="space-y-3">
              <div>
                <Label htmlFor="rastreio">Código dos Correios</Label>
                <Input
                  id="rastreio"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value.toUpperCase())}
                  placeholder="AB123456789BR"
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="mt-2 rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={!tracking.trim() || savingTracking}
                className={`${primaryButton} w-full`}
              >
                {savingTracking ? "Salvando…" : "Salvar rastreio"}
              </button>
              <p className="text-xs text-muted-foreground">
                Ao salvar, o status muda para "Postada". Depois, avise a compradora pelo WhatsApp: a
                mensagem já vai com o código.
              </p>
            </form>
          </Card>

          <Card title="Escolhas">
            <dl className="space-y-1.5 text-sm">
              <Row label="Envelope" value={labelOf(ENVELOPE_COLORS, order.envelope)} />
              <Row label="Lacre" value={labelOf(SEAL_COLORS, order.seal)} />
              <Row label="Adicionais" value={extras.length ? extras.join(", ") : "Nenhum"} />
            </dl>
          </Card>

          <Card title="Compradora">
            <dl className="space-y-1.5 text-sm">
              <Row label="Nome" value={order.buyerName} />
              <Row
                label="E-mail"
                value={
                  <a href={`mailto:${order.email}`} className="underline underline-offset-4">
                    {order.email}
                  </a>
                }
              />
              <Row label="WhatsApp" value={order.whatsapp} />
            </dl>
            <a
              href={whatsappLink(
                order.whatsapp,
                data.tracking
                  ? trackingMessage(order.buyerName, order.recipient, data.tracking)
                  : undefined,
              )}
              target="_blank"
              rel="noreferrer"
              className={`${primaryButton} mt-4 w-full`}
            >
              {data.tracking ? "Enviar rastreio no WhatsApp" : "Abrir no WhatsApp"}
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right break-all">{value}</dd>
    </div>
  );
}
