const LINKS = [
  { label: "WhatsApp", href: "https://wa.me/" },
  { label: "Instagram", href: "https://instagram.com/tatacamarrgo" },
  { label: "Pinterest", href: "https://br.pinterest.com/tatacamarrgo" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--wine-deep)] text-[oklch(0.96_0.008_40)]">
      <div className="section-container flex flex-col gap-6 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-lg tracking-tight">
            <span className="font-semibold">Napkin</span> <span className="font-light">Notes</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-75">
            Cartas de amor escritas à mão e enviadas pelo correio para todo o Brasil.
          </p>
        </div>
        <nav className="flex gap-6 text-sm">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="opacity-80 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
