import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QUESTIONS = [
  {
    q: "Quanto tempo leva para chegar?",
    a: "Escrevo e posto sua carta em até 3 dias úteis depois do pagamento. Depois disso, o prazo é dos Correios, que costuma variar de 3 a 10 dias úteis conforme a cidade. Para datas especiais, peça com antecedência.",
  },
  {
    q: "Consigo acompanhar a entrega?",
    a: "Sim, escolhendo o envio com rastreio nos detalhes. No envio simples, aviso você quando a carta for postada.",
  },
  {
    q: "Vocês corrigem o meu texto?",
    a: "Não. Passo a carta exatamente como você escreveu, então revise antes de finalizar. Antes de começar, mando o texto para você confirmar.",
  },
  {
    q: "Alguém além de você lê a minha carta?",
    a: "Não. Só eu leio, para escrever. Os textos não são publicados nem compartilhados, e as fotos que posto usam cartas com nomes trocados e com autorização.",
  },
  {
    q: "Posso mandar qualquer carta?",
    a: "Cartas de amor, de saudade, de carinho, de pedido de desculpas. Não envio cartas com ofensas, ameaças ou para alguém que pediu para não ser procurado.",
  },
];

export function Faq() {
  return (
    <section className="border-t border-border bg-card/40 py-20 md:py-24">
      <div className="section-container">
        <h2 className="text-3xl md:text-4xl">Dúvidas</h2>
        <Accordion type="single" collapsible className="mt-8">
          {QUESTIONS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
