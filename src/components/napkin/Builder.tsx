import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { EnvelopePreview } from "@/components/napkin/EnvelopePreview";
import { Turnstile, type TurnstileHandle } from "@/components/napkin/Turnstile";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BASE_PRICE,
  ENVELOPE_COLORS,
  ENVELOPE_COLOR_PRICE,
  EXTRAS,
  MAX_CHARS,
  SEAL_COLORS,
  SEAL_PRICE,
  TEMPLATES,
  formatBRL,
  type ColorOption,
} from "@/lib/napkin";
import { buyerSchema, formatWhatsapp, orderItems } from "@/lib/order";

function Swatches({
  options,
  value,
  onChange,
  name,
}: {
  options: ColorOption[];
  value: string;
  onChange: (id: string) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          aria-label={`${name}: ${option.label}`}
          onClick={() => onChange(option.id)}
          className="flex flex-col items-center gap-2 text-xs text-muted-foreground"
        >
          <span
            className={`size-10 rounded-full border transition-all duration-200 ${
              value === option.id
                ? "border-foreground/40 ring-2 ring-[var(--wine)] ring-offset-2 ring-offset-[var(--blush)]"
                : "border-border"
            }`}
            style={{ backgroundColor: option.hex }}
          />
          {option.label}
        </button>
      ))}
    </div>
  );
}

type BuyerField = "buyerName" | "email" | "whatsapp";

type CepStatus = {
  kind: "idle" | "loading" | "found" | "partial" | "error";
  message: string;
};

const CEP_IDLE: CepStatus = { kind: "idle", message: "Digite o CEP para buscar o endereço." };

function CepStatusIcon({ kind }: { kind: CepStatus["kind"] }) {
  const className = "mt-0.5 size-3.5 shrink-0";
  if (kind === "loading") return <LoaderCircle className={`${className} animate-spin`} />;
  if (kind === "found") return <CircleCheck className={`${className} text-[var(--wine)]`} />;
  if (kind === "partial" || kind === "error")
    return <CircleAlert className={`${className} ${kind === "error" ? "text-destructive" : ""}`} />;
  return <MapPin className={className} />;
}

function BuyerInput({
  id,
  label,
  error,
  ...props
}: { id: string; label: string; error: string | undefined } & ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-erro` : undefined}
        className={`mt-2 rounded-xl ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
        {...props}
      />
      {error && (
        <p id={`${id}-erro`} className="mt-1.5 text-xs leading-relaxed text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function Builder() {
  const [text, setText] = useState("");
  const [envelope, setEnvelope] = useState("branco");
  const [seal, setSeal] = useState("perola");
  const [extras, setExtras] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [cep, setCep] = useState("");
  const [cepStatus, setCepStatus] = useState<CepStatus>(CEP_IDLE);
  const cepLoading = cepStatus.kind === "loading";
  const cepRequest = useRef<AbortController | null>(null);
  const currentCep = useRef("");
  const editedAddressFields = useRef(new Set<string>());
  // Campos preenchidos pelo CEP ganham um fundo suave até a pessoa editar.
  const [autofilled, setAutofilled] = useState<ReadonlySet<string>>(new Set());
  const markEdited = (field: string) => {
    editedAddressFields.current.add(field);
    setAutofilled((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };
  const fieldClass = (field: string) =>
    `mt-2 rounded-xl transition-colors ${autofilled.has(field) ? "border-[var(--wine)]/30 bg-[var(--blush)]/50 dark:bg-[var(--wine)]/15" : ""}`;
  useEffect(() => () => cepRequest.current?.abort(), []);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const turnstile = useRef<TurnstileHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const waitingTurnstile = Boolean(TURNSTILE_SITE_KEY) && !turnstileToken;

  // Os erros de "Seus dados" vêm do mesmo schema Zod que o servidor usa,
  // e só aparecem depois que a pessoa sai do campo.
  const [touched, setTouched] = useState<ReadonlySet<BuyerField>>(new Set());
  const touch = (field: BuyerField) =>
    setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
  const buyerResult = buyerSchema.safeParse({ buyerName, email, whatsapp });
  const buyerErrors = buyerResult.success ? {} : buyerResult.error.flatten().fieldErrors;
  const errorFor = (field: BuyerField) =>
    touched.has(field) ? buyerErrors[field]?.[0] : undefined;

  const envelopeColor = ENVELOPE_COLORS.find((c) => c.id === envelope)!;
  const sealColor = SEAL_COLORS.find((c) => c.id === seal)!;
  const chosenExtras = EXTRAS.filter((extra) => extras.includes(extra.id));
  const total = orderItems({ envelope, extras }).reduce((sum, item) => sum + item.price, 0);
  const atLimit = text.length >= MAX_CHARS;

  const canSubmit = useMemo(
    () =>
      text.trim().length >= 20 &&
      recipient.trim() !== "" &&
      cep.replace(/\D/g, "").length === 8 &&
      street.trim() !== "" &&
      number.trim() !== "" &&
      city.trim() !== "" &&
      uf.trim() !== "" &&
      buyerResult.success,
    [text, recipient, cep, street, number, city, uf, buyerResult.success],
  );

  const goToCheckout = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          envelope,
          seal,
          extras,
          anonymous,
          recipient,
          cep,
          street,
          number,
          complement,
          district,
          city,
          uf,
          buyerName,
          email,
          whatsapp,
          turnstileToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (error) {
      toast.error(
        (error instanceof Error && error.message) ||
          "Não foi possível iniciar o pagamento. Tente novamente em instantes.",
      );
      turnstile.current?.reset();
      setSubmitting(false);
    }
  };

  const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
    if (
      text.trim() &&
      !window.confirm("Isso vai substituir o texto que você já escreveu. Tudo bem?")
    )
      return;
    setText(template.text.slice(0, MAX_CHARS));
  };

  const lookupCep = async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    cepRequest.current?.abort();
    const controller = new AbortController();
    cepRequest.current = controller;
    editedAddressFields.current.clear();
    setAutofilled(new Set());
    setCepStatus({ kind: "loading", message: "Buscando endereço…" });
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (cepRequest.current === controller) {
        setCepStatus({
          kind: "error",
          message: "A consulta demorou demais. Tente de novo ou preencha à mão.",
        });
      }
    }, 8000);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Falha na consulta do CEP");
      const data = (await res.json()) as {
        erro?: boolean | string;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (controller.signal.aborted || currentCep.current !== digits) return;
      if (data.erro) {
        setCepStatus({
          kind: "error",
          message: "CEP não encontrado. Confira os números ou preencha à mão.",
        });
        return;
      }
      if (!data.localidade || !data.uf) throw new Error("Endereço incompleto");
      const found: [string, string, (value: string) => void][] = [
        ["street", data.logradouro ?? "", setStreet],
        ["district", data.bairro ?? "", setDistrict],
        ["city", data.localidade, setCity],
        ["uf", data.uf, setUf],
      ];
      const filled = new Set<string>();
      for (const [field, value, set] of found) {
        if (editedAddressFields.current.has(field)) continue;
        set(value);
        if (value) filled.add(field);
      }
      setAutofilled(filled);
      setCepStatus(
        data.logradouro && data.bairro
          ? { kind: "found", message: "Endereço encontrado. Confira e informe o número." }
          : { kind: "partial", message: "Cidade encontrada. Complete a rua e o bairro." },
      );
    } catch {
      if (!controller.signal.aborted) {
        setCepStatus({
          kind: "error",
          message: "Não foi possível consultar o CEP. Tente de novo ou preencha à mão.",
        });
      }
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return (
    <section id="montar" className="bg-[var(--blush)] py-20 md:py-28">
      <div className="section-container">
        <h2 className="text-3xl text-[var(--wine-deep)] md:text-4xl dark:text-foreground">
          Monte sua carta
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-[var(--wine-deep)]/75 dark:text-muted-foreground">
          Escreva o que sente, escolha o visual e veja a prévia mudar enquanto você monta.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Formulário */}
          <div className="space-y-10 rounded-3xl bg-card p-6 md:p-8">
            <div>
              <Label htmlFor="carta">O texto da sua carta</Label>
              <Textarea
                id="carta"
                value={text}
                maxLength={MAX_CHARS}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Meu amor, hoje eu quis te escrever…"
                className="mt-2 resize-none rounded-2xl"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={atLimit ? "text-destructive" : "text-muted-foreground"}>
                  {atLimit ? "Você chegou ao limite da folha" : "Cabe em uma folha A4"}
                </span>
                <span className="font-light text-muted-foreground">
                  {text.length.toLocaleString("pt-BR")} / 1.800
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="rounded-full border border-border px-4 py-2 text-xs transition-colors hover:bg-accent"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Cor do envelope</Label>
                <Swatches
                  name="Envelope"
                  options={ENVELOPE_COLORS}
                  value={envelope}
                  onChange={setEnvelope}
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Branco incluso. Envelopes coloridos: + {formatBRL(ENVELOPE_COLOR_PRICE)}.
                </p>
              </div>
              <div>
                <Label className="mb-3 flex items-center gap-2">
                  Cor do lacre
                  <span className="rounded-full bg-[var(--blush)] px-2.5 py-0.5 text-xs font-medium text-[var(--wine-deep)] dark:bg-[var(--wine)]/40 dark:text-foreground">
                    de presente
                  </span>
                </Label>
                <Swatches name="Lacre" options={SEAL_COLORS} value={seal} onChange={setSeal} />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Adicionais</Label>
              <div className="space-y-3">
                {EXTRAS.map((extra) => (
                  <label
                    key={extra.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4"
                  >
                    <Checkbox
                      checked={extras.includes(extra.id)}
                      onCheckedChange={(checked) =>
                        setExtras((prev) =>
                          checked ? [...prev, extra.id] : prev.filter((id) => id !== extra.id),
                        )
                      }
                      className="mt-0.5"
                    />
                    <span className="flex-1 text-sm">
                      {extra.label}
                      <span className="block text-xs text-muted-foreground">
                        {extra.description}
                      </span>
                    </span>
                    <span className="text-sm font-light">+ {formatBRL(extra.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg">Para quem vai a carta</h3>
              <div>
                <Label htmlFor="destinatario">Nome de quem vai receber</Label>
                <Input
                  id="destinatario"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={9}
                    aria-describedby="cep-status"
                    aria-busy={cepLoading}
                    value={cep}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setCep(digits.replace(/^(\d{5})(\d)/, "$1-$2"));
                      if (digits === currentCep.current) return;
                      currentCep.current = digits;
                      cepRequest.current?.abort();
                      cepRequest.current = null;
                      setCepStatus(CEP_IDLE);
                      if (digits.length === 8) void lookupCep(digits);
                    }}
                    placeholder="00000-000"
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={street}
                    onChange={(e) => {
                      markEdited("street");
                      setStreet(e.target.value);
                    }}
                    autoComplete="address-line1"
                    className={fieldClass("street")}
                  />
                </div>
                <div className="-mt-1 flex items-start gap-2 text-xs leading-relaxed sm:col-span-3">
                  <CepStatusIcon kind={cepStatus.kind} />
                  <p
                    id="cep-status"
                    role="status"
                    className={
                      cepStatus.kind === "error" ? "text-destructive" : "text-muted-foreground"
                    }
                  >
                    {cepStatus.message}
                    {cep.replace(/\D/g, "").length === 8 && !cepLoading && (
                      <>
                        {" "}
                        <button
                          type="button"
                          onClick={() => void lookupCep(cep)}
                          className="whitespace-nowrap text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--wine)]"
                        >
                          Buscar de novo
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="mt-2 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={district}
                    onChange={(e) => {
                      markEdited("district");
                      setDistrict(e.target.value);
                    }}
                    className={fieldClass("district")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={city}
                    onChange={(e) => {
                      markEdited("city");
                      setCity(e.target.value);
                    }}
                    autoComplete="address-level2"
                    className={fieldClass("city")}
                  />
                </div>
                <div>
                  <Label htmlFor="uf">Estado</Label>
                  <Input
                    id="uf"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => {
                      markEdited("uf");
                      setUf(e.target.value.toUpperCase());
                    }}
                    autoComplete="address-level1"
                    className={fieldClass("uf")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg">Seus dados</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <BuyerInput
                  id="nome"
                  label="Seu nome"
                  error={errorFor("buyerName")}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  onBlur={() => touch("buyerName")}
                  autoComplete="name"
                />
                <BuyerInput
                  id="email"
                  label="E-mail"
                  error={errorFor("email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch("email")}
                  autoComplete="email"
                  placeholder="voce@email.com"
                />
                <BuyerInput
                  id="whatsapp"
                  label="WhatsApp"
                  error={errorFor("whatsapp")}
                  type="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                  onBlur={() => touch("whatsapp")}
                  autoComplete="tel-national"
                  placeholder="(11) 91234-5678"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked === true)}
                />
                Quero que a carta seja anônima
              </label>
            </div>
          </div>

          {/* Prévia */}
          <aside className="space-y-6 lg:sticky lg:top-8">
            <div className="rounded-3xl bg-card p-6 shadow-sm md:p-8">
              <div className="ruled-paper min-h-72 rounded-2xl border border-border bg-[var(--paper)] p-6 dark:bg-card">
                <p className="font-[family-name:var(--font-hand)] text-[0.78rem] leading-[2.1rem] break-words whitespace-pre-wrap text-foreground/85">
                  {text || "Sua carta aparece aqui, do jeitinho que você escrever."}
                </p>
              </div>

              <EnvelopePreview envelope={envelopeColor} seal={sealColor} />
            </div>

            <div className="rounded-3xl bg-card p-6 md:p-8">
              <h3 className="text-lg">Resumo do pedido</h3>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Carta escrita à mão + envio</dt>
                  <dd className="font-light">{formatBRL(BASE_PRICE)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Lacre de cera com sinete</dt>
                  <dd className="font-light">
                    <span className="mr-1.5 text-muted-foreground line-through">
                      {formatBRL(SEAL_PRICE)}
                    </span>
                    <span className="font-medium text-[var(--wine-deep)] dark:text-foreground">
                      Grátis
                    </span>
                  </dd>
                </div>
                {envelopeColor.id !== "branco" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Envelope colorido</dt>
                    <dd className="font-light">{formatBRL(envelopeColor.price ?? 0)}</dd>
                  </div>
                )}
                {chosenExtras.map((extra) => (
                  <div key={extra.id} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{extra.label}</dt>
                    <dd className="font-light">{formatBRL(extra.price)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-border pt-3 text-base">
                  <dt>Total</dt>
                  <dd className="font-semibold">{formatBRL(total)}</dd>
                </div>
              </dl>

              <Turnstile ref={turnstile} onToken={setTurnstileToken} />
              <button
                type="button"
                disabled={!canSubmit || submitting || waitingTurnstile}
                onClick={() => void goToCheckout()}
                className="mt-6 w-full rounded-full bg-[var(--wine)] px-6 py-3.5 text-sm font-semibold text-[oklch(0.98_0.005_40)] transition-colors hover:bg-[var(--wine-deep)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Abrindo o pagamento…" : "Ir para o pagamento"}
              </button>
              {!canSubmit ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Escreva pelo menos 20 caracteres e preencha o endereço e seus dados.
                </p>
              ) : (
                waitingTurnstile && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Fazendo uma verificação rápida de segurança…
                  </p>
                )
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
