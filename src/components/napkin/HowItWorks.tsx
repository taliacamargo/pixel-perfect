const STEPS = [
  {
    title: "Você escreve",
    text: "Digite sua carta aqui no site. Se travar, use um dos modelos prontos e adapte.",
  },
  {
    title: "Você escolhe o visual",
    text: "Cor do envelope, cor do lacre e os detalhes que quiser acrescentar.",
  },
  {
    title: "Eu escrevo à mão",
    text: "Passo sua carta a limpo com caneta, em papel 120g, com calma e capricho.",
  },
  {
    title: "Chega pelo correio",
    text: "Envelope fechado com lacre de cera, na caixa de correio de quem você ama.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-card/40 py-20 md:py-24">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl">Como funciona</h2>
        <ol className="mt-10 grid gap-8 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative grid grid-cols-[3rem_1fr] gap-x-5 lg:block">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-14 bottom-[-1.5rem] left-6 w-px bg-wine/25 lg:top-6 lg:right-2 lg:bottom-auto lg:left-14 lg:h-px lg:w-auto lg:translate-x-4 dark:bg-rose-gold/40"
                />
              )}
              <span className="flex size-12 items-center justify-center rounded-full border border-wine/25 bg-paper text-2xl font-light text-wine dark:border-rose-gold/40 dark:text-rose-gold">
                {i + 1}
              </span>
              <div className="pt-1.5 lg:pt-0">
                <h3 className="text-lg lg:mt-4">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
