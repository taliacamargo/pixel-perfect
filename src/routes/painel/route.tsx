import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative mt-2">
          <Input
            id="senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl pr-11"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            aria-controls="senha"
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
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
