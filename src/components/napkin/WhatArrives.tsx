const ITEMS = [
  {
    title: "Papel 120g",
    text: "Folha A4 lisa e encorpada, que não amassa fácil e dura anos guardada numa caixa.",
  },
  {
    title: "Escrita à mão",
    text: "Letra cursiva, com margem generosa e espaço entre as linhas, para ser lida com calma.",
  },
  {
    title: "Envelope 180g",
    text: "Branco ou colorido, no tamanho 11,4 x 16,2 cm, com a carta dobrada com cuidado lá dentro.",
  },
  {
    title: "Lacre de cera de presente",
    text: "Aplicado à mão, com sinete de coração, na cor que você escolher. Vem em todas as cartas, sem custo extra.",
  },
];

export function WhatArrives() {
  return (
    <section className="section-container py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl">O que chega na casa de quem você ama</h2>
      <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
        Nada é impresso. Cada linha é escrita por mim, com caneta, uma carta de cada vez.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <article key={item.title} className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
