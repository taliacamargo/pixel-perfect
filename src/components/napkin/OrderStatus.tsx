import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function OrderStatus({
  title,
  children,
  linkLabel,
  linkHash,
}: {
  title: string;
  children: ReactNode;
  linkLabel: string;
  linkHash?: string;
}) {
  return (
    <main className="flex min-h-screen items-center bg-[var(--blush)] py-20">
      <div className="section-container">
        <div className="mx-auto max-w-xl rounded-3xl bg-card p-8 text-center md:p-12">
          <h1 className="text-3xl text-[var(--wine-deep)] md:text-4xl dark:text-foreground">
            {title}
          </h1>
          <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">{children}</div>
          <Link
            to="/"
            {...(linkHash ? { hash: linkHash } : {})}
            className="mt-8 inline-flex rounded-full bg-[var(--wine)] px-6 py-3.5 text-sm font-semibold text-[oklch(0.98_0.005_40)] transition-colors hover:bg-[var(--wine-deep)]"
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
