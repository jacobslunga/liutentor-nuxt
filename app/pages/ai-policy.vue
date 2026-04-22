<script setup lang="ts">
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

interface Section {
  title: string;
  content: string;
  items?: string[];
}

const sections: Section[] = [
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
      "OpenAI (GPT-4o) för generering av logiska quiz och analyser.",
      "Google (Gemini 2.5 Pro/Flash) för bearbetning av stora tentamens-PDF:er.",
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
  <div class="w-full max-w-3xl">
    <h1 class="text-3xl font-semibold text-foreground mb-1">AI-policy</h1>
    <p class="text-xs text-muted-foreground mb-6">
      Senast uppdaterad: 2026-04-20
    </p>
    <p class="text-sm text-foreground/80 leading-relaxed mb-6">
      Den här policyn förklarar hur LiU Tentor använder artificiell intelligens,
      vad du kan förvänta dig av tjänsten och vilket ansvar du har som
      användare. Vårt mål är att vara en trygg och transparent partner i dina
      studier.
    </p>

    <Separator />

    <div class="space-y-6 mt-8">
      <div v-for="section in sections" :key="section.title" class="mb-6">
        <h2 class="text-lg font-medium text-foreground mb-2">
          {{ section.title }}
        </h2>
        <p class="text-sm text-foreground/80 leading-relaxed">
          {{ section.content }}
        </p>
        <ul
          v-if="section.items"
          class="mt-3 list-disc pl-5 space-y-1 text-sm text-foreground/70"
        >
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div
      class="mt-8 pt-6 border-t bg-primary/5 rounded-md p-6 border border-primary/10"
    >
      <div class="flex items-center gap-2 mb-2">
        <LucideShieldCheck class="h-5 w-5 text-primary" />
        <h3 class="text-sm font-medium">Använd AI med omdöme</h3>
      </div>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Kom ihåg: AI:n är en assistent, inte en ersättare för ditt eget kritiska
        tänkande. Genom att använda LiU Tentor godkänner du att du förstår
        teknikens begränsningar.
      </p>
    </div>

    <div class="mt-12 text-center">
      <p class="text-xs text-muted-foreground">
        Har du sett AI:n svara ovanligt märkligt?
        <button @click="openMail" class="underline hover:text-foreground">
          Rapportera det till oss.
        </button>
      </p>
    </div>
  </div>
</template>
