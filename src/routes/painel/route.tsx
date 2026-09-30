import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { primaryButton, secondaryButton } from "@/components/painel/styles";
import { adminLogin, adminLogout, getAdminSession } from "@/lib/painel.functions";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [{ title: "Painel | Napkin Notes" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: () => getAdminSession(),
  component: PainelLayout,
});

function PainelLayout() {
  const { authenticated } = Route.useRouteContext();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--blush)] pb-16 dark:bg-background">
      <header className="section-container flex items-center justify-between py-6">
        <Link
          to="/painel"
          className="text-lg tracking-tight text-[var(--wine-deep)] dark:text-foreground"
        >
          <span className="font-semibold">Napkin</span> <span className="font-light">Painel</span>
        </Link>
        {authenticated && (
          <button
            type="button"
            className={secondaryButton}
            onClick={async () => {
              await adminLogout();
              await router.invalidate();
            }}
          >
            Sair
          </button>
        )}
      </header>
      <div className="section-container">{authenticated ? <Outlet /> : <LoginForm />}</div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await adminLogin({ data: { password } });
      if (result.ok) {
        await router.invalidate();
        return;
      }
      setError(result.error ?? "Não foi possível entrar.");
    } catch {
      setError("Não foi possível entrar. Tente de novo.");
    }
    setPending(false);
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-10 max-w-sm space-y-4 rounded-3xl bg-card p-6 md:p-8"
    >
      <h1 className="text-2xl text-[var(--wine-deep)] dark:text-foreground">Área restrita</h1>
      <div>
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 rounded-xl"
          autoFocus
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button type="submit" disabled={!password || pending} className={`${primaryButton} w-full`}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
