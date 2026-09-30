import napkin from "@/assets/napkin-note.png";

export function Story() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
      <img
        src={napkin}
        alt="Guardanapo de papel com o bilhete manuscrito: eu ia te dizer isso pessoalmente, mas fiquei com vergonha :)"
        width={1024}
        height={768}
        loading="lazy"
        className="w-full rounded-2xl"
      />
      <div>
        <h2 className="text-3xl md:text-4xl">Do guardanapo para o papel</h2>
        <p className="mt-5 leading-[1.9] text-muted-foreground">
          Os sentimentos mais sinceros costumam nascer no improviso: um bilhete rabiscado às pressas
          num guardanapo de bar, escrito antes que a coragem acabe. A Napkin Notes guarda esse
          impulso e dá a ele o tempo que ele merece. Seu recado vira uma carta escrita à mão, em
          papel encorpado, para ser lida e guardada para sempre.
        </p>
      </div>
    </section>
  );
}
