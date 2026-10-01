import letterEnvelopes from "@/assets/carta-envelopes.jpeg";

export function Story() {
  return (
    <section className="section-container grid items-center gap-10 py-20 md:grid-cols-2 md:py-28">
      <img
        src={letterEnvelopes}
        alt="Carta manuscrita com envelopes vinho, lacre dourado e sinetes sobre uma superfície cinza"
        width={794}
        height={794}
        loading="lazy"
        className="w-full rounded-2xl"
      />
      <div>
        <h2 className="text-3xl md:text-4xl">
          O celular encurtou as distâncias. E as palavras também.
        </h2>
        <p className="mt-5 leading-[1.9] text-muted-foreground">
          Hoje a gente se fala o dia todo, mas quase nunca diz o que sente. Mensagens somem no meio
          de tantas outras. Uma carta, não: ela fica pra sempre!
        </p>
        <p className="mt-4 leading-[1.9] text-muted-foreground">
          Eu estou aqui para você surpreender quem ama como antigamente, sem sair de casa.
        </p>
        <p className="mt-4 leading-[1.9] text-muted-foreground">
          Mande para um amor, amigos ou familiares :)
        </p>
      </div>
    </section>
  );
}
