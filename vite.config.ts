import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  // Em `pnpm dev`, as rotas de servidor leem as chaves do .env.local (fora do git).
  // Na Vercel, elas vêm das variáveis de ambiente do painel.
  if (command === "serve") {
    process.env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  }

  return {
    server: { host: "0.0.0.0", port: 8080 },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      dedupe: ["react", "react-dom", "@tanstack/react-router"],
    },
    plugins: [
      tanstackStart({ server: { entry: "server" } }),
      react(),
      tailwindcss(),
      ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    ],
  };
});
