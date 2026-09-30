import { createFileRoute } from "@tanstack/react-router";

import { Hero } from "@/components/napkin/Hero";
import { Story } from "@/components/napkin/Story";
import { About } from "@/components/napkin/About";
import { HowItWorks } from "@/components/napkin/HowItWorks";
import { Builder } from "@/components/napkin/Builder";
import { WhatArrives } from "@/components/napkin/WhatArrives";
import { Faq } from "@/components/napkin/Faq";
import { SiteFooter } from "@/components/napkin/SiteFooter";
import { FadeIn } from "@/components/napkin/FadeIn";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, SOCIAL_IMAGE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: SOCIAL_IMAGE },
      { property: "og:image:width", content: "794" },
      { property: "og:image:height", content: "794" },
      { property: "og:image:type", content: "image/jpeg" },
      {
        property: "og:image:alt",
        content: "Carta manuscrita com envelopes vinho e lacre de cera dourado",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: SOCIAL_IMAGE },
      {
        name: "twitter:image:alt",
        content: "Carta manuscrita com envelopes vinho e lacre de cera dourado",
      },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Hero />
      <FadeIn>
        <Story />
      </FadeIn>
      <FadeIn>
        <HowItWorks />
      </FadeIn>
      <FadeIn>
        <Builder />
      </FadeIn>
      <FadeIn>
        <WhatArrives />
      </FadeIn>
      <FadeIn>
        <About />
      </FadeIn>
      <FadeIn>
        <Faq />
      </FadeIn>
      <SiteFooter />
    </main>
  );
}
