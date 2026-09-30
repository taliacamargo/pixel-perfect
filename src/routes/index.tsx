import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/napkin/Hero";
import { Story } from "@/components/napkin/Story";
import { HowItWorks } from "@/components/napkin/HowItWorks";
import { Builder } from "@/components/napkin/Builder";
import { WhatArrives } from "@/components/napkin/WhatArrives";
import { Faq } from "@/components/napkin/Faq";
import { SiteFooter } from "@/components/napkin/SiteFooter";

const TITLE = "Napkin Notes · cartas de amor escritas à mão";
const DESCRIPTION =
  "Você escreve o que sente. Eu passo à mão, fecho com lacre de cera e envio pelo correio.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <Story />
      <HowItWorks />
      <Builder />
      <WhatArrives />
      <Faq />
      <SiteFooter />
    </main>
  );
}
