import {
  AlertDialog,
  Button,
  Card,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
  buttonVariants,
} from "@heroui/react";
import { Link, Outlet, createFileRoute, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Inbox, LayoutDashboard, LogOut, type LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ThemeToggle, usePanelTheme } from "@/components/painel/theme";
import { THEME_SCRIPT } from "@/components/painel/theme-script";
import { adminLogin, adminLogout, getAdminSession } from "@/lib/painel.functions";
import painelCss from "../../painel.css?url";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [{ title: "Painel | Napkin Notes" }, { name: "robots", content: "noindex, nofollow" }],
    links: [{ rel: "stylesheet", href: painelCss }],
    scripts: [{ children: THEME_SCRIPT }],
  }),
  beforeLoad: () => getAdminSession(),
  component: PainelLayout,
});

const NAV: { to: "/painel" | "/painel/pedidos"; label: string; icon: LucideIcon }[] = [
  { to: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { to: "/painel/pedidos", label: "Pedidos", icon: Inbox },
];

function Brand() {
  return (
    <Link to="/painel" className="flex items-center gap-2 text-base tracking-tight">
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
        N
      </span>
      <span>
        <span className="font-semibold">Napkin</span>{" "}
        <span className="font-light text-muted">Painel</span>
      </span>
    </Link>
  );
}

function PainelLayout() {
  usePanelTheme();
  const { authenticated } = Route.useRouteContext();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!authenticated) return <LoginScreen />;

  const askLogout = () => setConfirmLogout(true);

  const navLinkClass =
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-default hover:text-foreground";

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      {/* Menu lateral (computador) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-separator bg-surface p-4 md:flex">
        <Brand />
        <nav aria-label="Painel" className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/painel", includeSearch: false }}
              className={navLinkClass}
              activeProps={{ className: "bg-accent-soft text-accent-soft-foreground font-medium" }}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t border-separator pt-4">
          <ThemeToggle />
          <Button size="sm" variant="ghost" onPress={askLogout}>
            <LogOut className="size-4" aria-hidden />
            Sair
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior (celular) */}
        <header className="sticky top-0 z-10 border-b border-separator bg-surface/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Brand />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button size="sm" variant="ghost" isIconOnly aria-label="Sair" onPress={askLogout}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
          <nav aria-label="Painel" className="flex gap-1 px-3 pb-2">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/painel", includeSearch: false }}
                className={`${navLinkClass} py-1.5`}
                activeProps={{
                  className: "bg-accent-soft text-accent-soft-foreground font-medium",
                }}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>

      <LogoutDialog isOpen={confirmLogout} onOpenChange={setConfirmLogout} />
    </div>
  );
}

function LogoutDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = async () => {
    setPending(true);
    try {
      await adminLogout();
      // Recarrega a sessão: o painel volta para a tela de login.
      await router.invalidate();
    } catch {
      toast.error("Não foi possível sair. Tente de novo.");
      setPending(false);
    }
  };

  return (
    <AlertDialog.Backdrop
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      // Enquanto sai, o modal não fecha por clique fora nem pelo Esc.
      isDismissable={!pending}
      isKeyboardDismissDisabled={pending}
    >
      <AlertDialog.Container size="sm">
        <AlertDialog.Dialog>
          <AlertDialog.Header>
            <AlertDialog.Icon status="accent">
              <LogOut className="size-5" aria-hidden />
            </AlertDialog.Icon>
            <AlertDialog.Heading>Sair do painel?</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p className="text-sm text-muted">
              Para voltar, você vai precisar digitar a senha de novo.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={pending}>
              Cancelar
            </Button>
            <Button onPress={logout} isPending={pending}>
              Sair
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}

function LoginScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password) {
      setError("Digite a senha.");
      return;
    }
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
    <div className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <Card className="gap-5 p-6 sm:p-8">
          <Card.Header>
            <Card.Title className="text-xl">Área restrita</Card.Title>
            <Card.Description>Entre com a senha para acompanhar os pedidos.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Form onSubmit={submit} className="flex flex-col gap-4">
              <TextField
                name="senha"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  setError("");
                }}
                isInvalid={Boolean(error)}
                autoFocus
                fullWidth
              >
                <Label>Senha</Label>
                <InputGroup fullWidth>
                  <InputGroup.Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                  />
                  <InputGroup.Suffix className="pe-0">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={showPassword}
                      onPress={() => setShowPassword((show) => !show)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
                <FieldError>{error}</FieldError>
              </TextField>
              <Button type="submit" fullWidth isPending={pending}>
                {pending ? "Entrando…" : "Entrar"}
              </Button>
            </Form>
          </Card.Content>
        </Card>
        <p className="mt-6 text-center text-xs text-muted">
          <a href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Voltar para o site
          </a>
        </p>
      </div>
    </div>
  );
}
