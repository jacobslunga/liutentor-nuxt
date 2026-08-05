<script setup lang="ts">
import type { DocSection } from "~/types/doc";

definePageMeta({ layout: "info" });

useSeoMeta({
  title: "AI-policy",
  description:
    "Läs om hur vi använder AI på LiU Tentor och vad du bör tänka på som användare.",
  robots: "index, follow",
});

function openMail() {
  window.location.href = "mailto:liutentor@gmail.com";
}

const sections: DocSection[] = [
  {
    title: "Vårt syfte med AI",
    content:
      "LiU Tentor använder artificiell intelligens för att demokratisera tillgången till studiestöd. Vårt mål är att erbjuda en personlig tutor som kan förklara komplexa koncept, ge ledtrådar till svåra tentauppgifter och skapa anpassade övningsquiz dygnet runt.",
  },
  {
    title: "Tekniken bakom",
    content:
      "Vi använder toppmoderna modeller från världsledande leverantörer för att säkerställa högsta möjliga kvalitet på svaren:",
    items: [
      "Google Gemini (3.1 Flash Lite & 3.6 Flash) för chatt, quizgenerering och bearbetning av tentamens-PDF:er.",
    ],
  },
  {
    title: "Viktig ansvarsfriskrivning",
    content:
      "Trots teknikens framsteg är AI-modeller inte felfria. Det är viktigt att du som student är medveten om följande:",
    items: [
      "Hallucinationer: AI:n kan ibland presentera felaktig information eller matematiska beräkningar som sanning. Dubbelkolla alltid kritiska fakta mot kurslitteraturen.",
      "Inget facit: AI:ns lösningar ska ses som pedagogiska förslag, inte som det officiella facit från universitetet.",
      "Pedagogik framför svar: Vi uppmuntrar användningen av 'Ledtråds-läge' för att främja djupt lärande istället för att bara be om färdiga svar.",
    ],
  },
  {
    title: "AI och akademisk integritet",
    content:
      "Vi stödjer akademisk hederlighet. Vår AI är utformad för att vara ett komplement till dina studier, inte ett verktyg för fusk. Vi uppmanar alla användare att följa Linköpings universitets regler gällande användning av AI-verktyg i samband med inlämningar och examinationer.",
  },
  {
    title: "Data och integritet i chatten",
    content:
      "När du interagerar med vår AI skickas innehållet i din chatt (inklusive de PDF:er du valt) till AI-leverantören för att generera ett svar. Vi delar aldrig din e-postadress eller andra identifierbara profiluppgifter med AI-leverantörerna. Din data används inte av oss för att träna egna modeller.",
  },
  {
    title: "Kontinuerlig förbättring",
    content:
      "Vi granskar löpande (anonymiserat) hur AI:n presterar för att identifiera områden där den tenderar att svara felaktigt. Din feedback via vår feedback-funktion är avgörande för att vi ska kunna finjustera systemet och göra det säkrare för alla studenter.",
  },
];
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Juridiskt"
      title="AI-policy"
      lead="Den här policyn förklarar hur LiU Tentor använder artificiell intelligens, vad du kan förvänta dig av tjänsten och vilket ansvar du har som användare. Vårt mål är att vara en trygg och transparent partner i dina studier."
      meta="Senast uppdaterad 29 juli 2026"
    />

    <LegalDocument :sections="sections">
      <template #footer>
        <div class="grid gap-x-12 gap-y-5 border-t py-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-20">
          <h2 class="text-lg font-medium text-foreground">
            Använd AI med omdöme
          </h2>
          <div class="max-w-2xl">
            <p class="text-[0.9375rem] leading-[1.75] text-foreground/75">
              AI:n är en assistent, inte en ersättare för ditt eget kritiska tänkande. Genom att
              använda LiU Tentor godkänner du att du förstår teknikens begränsningar.
            </p>
            <p class="mt-6 text-sm text-muted-foreground">
              Har du sett AI:n svara ovanligt märkligt?
              <button
                type="button"
                class="text-foreground underline underline-offset-2 transition-colors duration-150 ease-spring hover:text-primary"
                @click="openMail"
              >
                Rapportera det till oss.
              </button>
            </p>
          </div>
        </div>
      </template>
    </LegalDocument>
  </div>
</template>
