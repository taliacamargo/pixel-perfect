import heroEnvelope from "@/assets/hero-envelope.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--wine)] text-[oklch(0.98_0.005_40)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-10 pb-16 md:grid-cols-2 md:items-center md:gap-14 md:pt-14 md:pb-24">
        <header className="md:order-1">
          <p className="text-lg tracking-tight">
            <span className="font-semibold">Napkin</span>{" "}
            <span className="font-light">Notes</span>
          </p>

          <h1 className="mt-8 text-4xl leading-[1.1] font-semibold md:text-5xl">
            Envie cartas para quem você ama sem sair de casa
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed font-normal opacity-85">
            Escreva sua carta, personalize do seu jeito, e eu dou vida a ela e envio direto para a
            casa de quem você ama.
          </p>

          <a
            href="#montar"
            className="mt-8 inline-flex rounded-full bg-[var(--paper)] px-7 py-3.5 text-sm font-semibold text-[var(--wine)] transition-transform duration-200 hover:scale-[1.03]"
          >
            Escrever minha carta
          </a>

          <p className="mt-4 text-sm font-light opacity-75">
            A partir de R$ 49, com envio para todo o Brasil.
          </p>
        </header>

        <div className="animate-letter-rise md:order-2">
          <img
            src={heroEnvelope}
            alt="Envelope vinho com lacre de cera em forma de coração, capim-dos-pampas e uma carta manuscrita"
            width={1024}
            height={1024}
            className="mx-auto w-full max-w-sm drop-shadow-2xl md:max-w-md"
          />
          <p className="mt-2 text-center font-[family-name:var(--font-hand)] text-sm leading-relaxed opacity-80">
            Meu amor, tem coisas que só cabem no papel…
          </p>
        </div>
      </div>
    </section>
  );
}
