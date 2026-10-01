import { Heart } from "lucide-react";
import portrait from "@/assets/tata-torre-eiffel.jpg";
import writing from "@/assets/tata-escrita.jpg";
import memories from "@/assets/tata-memorias.jpg";

export function About() {
  return (
    <section id="sobre-mim" aria-labelledby="about-title" className="overflow-hidden bg-rose/60">
      <div className="section-container grid items-center gap-10 py-20 md:grid-cols-2 md:gap-14 md:py-28">
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-blush/60" />
          <figure className="absolute top-[5%] left-[4%] z-10 w-[55%] -rotate-6 bg-white p-2 pb-3 shadow-lg sm:p-3 sm:pb-4">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-[30%] h-6 w-[42%] rotate-3 bg-cream/85"
            />
            <img
              src={portrait}
              alt="Tata sentada à beira do rio Sena, com a Torre Eiffel ao fundo"
              width={475}
              height={465}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </figure>

          <figure className="absolute top-[13%] right-[2%] w-[39%] rotate-[9deg] bg-white p-2 pb-3 shadow-md sm:p-3 sm:pb-4">
            <img
              src={writing}
              alt="Livro, caderno aberto e caneta sobre a grama"
              width={700}
              height={1244}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover"
            />
          </figure>

          <figure className="absolute right-[4%] bottom-[1%] z-20 w-[61%] rotate-3 bg-white p-2 pb-3 shadow-lg sm:p-3 sm:pb-4">
            <span
              aria-hidden="true"
              className="absolute -top-2 right-[12%] h-5 w-[35%] -rotate-12 bg-cream/85"
            />
            <img
              src={memories}
              alt="Tata tomando uma bebida em uma xícara, à mesa com uma vela acesa"
              width={683}
              height={911}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="pt-3 text-center font-hand text-[10px] text-wine sm:text-xs">
              memórias que ficam
            </figcaption>
          </figure>
          <Heart
            aria-hidden="true"
            strokeWidth={1.3}
            className="absolute bottom-[4%] left-[13%] size-9 -rotate-12 text-wine sm:size-12"
          />
        </div>

        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-wine uppercase">Sobre mim</p>
          <h2 id="about-title" className="mt-4 text-3xl leading-tight md:text-4xl">
            Eu sou a Tata,
            <br />a mão por trás da sua carta.
          </h2>
          <div className="mt-6 space-y-4 leading-[1.9] text-muted-foreground">
            <p>
              Meu pai revelava fotos dele com a minha mãe e escrevia dedicatórias no verso. Foi aí
              que me apaixonei pela ideia de deixar o amor por escrito.
            </p>
            <p>
              Imagina, daqui a alguns anos, alguém que você ama encontrando a sua carta. Relendo
              suas palavras e sentindo, mais uma vez, o carinho que você deixou no papel.
            </p>
            <p>
              O Napkin Notes nasceu para ser essa ponte. Espero que você se apaixone por escrever
              para quem ama, assim como meu pai escrevia para a minha mãe. ♡
            </p>
          </div>
          <p className="mt-7 font-hand text-lg leading-loose text-wine">Com carinho, Tata</p>
          <a
            href="#montar"
            className="mt-6 inline-flex items-center gap-2 border-b border-wine/40 pb-1 text-sm font-medium text-wine transition-colors hover:border-wine focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
          >
            Vamos dar vida à sua carta?
            <Heart aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
