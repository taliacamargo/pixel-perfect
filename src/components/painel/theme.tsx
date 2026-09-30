import { Button, Tooltip } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { THEME_STORAGE_KEY } from "@/components/painel/theme-script";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset["theme"] = theme;
}

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Aplica o tema ao entrar no painel e limpa ao sair, para não afetar o site. */
export function usePanelTheme() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Sem acesso ao armazenamento (ex.: navegação privada): segue o sistema.
    }
    applyTheme(
      saved === "light" || saved === "dark"
        ? saved
        : matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    );
    return () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      delete root.dataset["theme"];
    };
  }, []);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => setTheme(currentTheme()), []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Usar modo escuro" : "Usar modo claro";

  return (
    <Tooltip delay={400}>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label={label}
        onPress={() => {
          applyTheme(next);
          setTheme(next);
          try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            // A escolha vale só nesta visita.
          }
        }}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  );
}
