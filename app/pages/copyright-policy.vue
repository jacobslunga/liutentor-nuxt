<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Upphovsrätt",
  description:
    "Läs om hur LiU Tentor förhåller sig till upphovsrätt och hur du kan begära borttagning av material.",
  robots: "index, follow",
});

function openMail() {
  window.location.href =
    "mailto:liutentor@gmail.com?subject=Begäran om borttagning av material";
}

interface Section {
  title: string;
  content: string;
  items?: string[];
}

const sections: Section[] = [
  {
    title: "Vår utgångspunkt",
    content:
      "LiU Tentor är en icke-kommersiell tjänst som syftar till att underlätta tillgången till tentamaterial för studenter vid Linköpings universitet. Vi samlar in och tillgängliggör material som vi i god tro bedömer vara offentligt tillgängligt och avsett för studenters studieändamål. Vi respekterar upphovsrätten och agerar skyndsamt vid klagomål.",
  },
  {
    title: "Upphovsrätt och offentliga handlingar",
    content:
      "I Sverige är tentamina vid statliga lärosäten i regel allmänna handlingar enligt offentlighetsprincipen (2 kap. tryckfrihetsförordningen) och kan begäras ut av vem som helst. Detta innebär att handlingarna i sig är offentliga. Däremot innebär inte offentlighetsprincipen att upphovsrätten upphör – den som skapat materialet (exempelvis en examinator) kan i vissa fall ha upphovsrätt till verket även om det är en allmän handling. Vi publicerar material i enlighet med vad vi bedömer vara tillåten vidarespridning för icke-kommersiellt studieändamål, men vi gör inte anspråk på att varje enskilt publicerat dokument är helt fritt från upphovsrättsliga anspråk.",
  },
  {
    title: "Examinatorers och rättighetsinnehavares rättigheter",
    content:
      "Vi erkänner att examinatorer och andra upphovsrättsinnehavare kan ha legitima intressen avseende material som publiceras på LiU Tentor. Om du är upphovsrättsinnehavare och anser att material på vår tjänst kränker din upphovsrätt, ber vi dig kontakta oss. Vi behandlar alla sådana ärenden med respekt och skyndsamhet.",
  },
  {
    title: "Så hanterar vi borttagningsbegäranden",
    content:
      "Vi följer en enkel process inspirerad av principen om notice-and-takedown:",
    items: [
      "Du skickar ett e-postmeddelande till liutentor@gmail.com med ämnesraden 'Begäran om borttagning av material'",
      "Ange vilket material du avser (t.ex. kursnamn, år, filnamn eller länk)",
      "Beskriv kort varför du anser att materialet ska tas bort",
      "Vi bekräftar mottagandet och granskar ärendet normalt inom 48 timmar",
      "Material som vi bedömer omfattas av ett befogat upphovsrättsligt anspråk tas bort utan dröjsmål",
    ],
  },
  {
    title: "Vad vi inte publicerar",
    content: "Vi strävar efter att inte publicera material som:",
    items: [
      "Explicit är markerat som konfidentiellt eller ej avsett för spridning",
      "Tillhör privatpersoner utan koppling till universitetets ordinarie kursverksamhet",
      "Har blivit föremål för en befogad borttagningsbegäran från rättighetsinnehavaren",
    ],
  },
  {
    title: "Personuppgifter i tentamaterial",
    content:
      "Tentafiler kan i undantagsfall innehålla personuppgifter, exempelvis namn på examinatorer. Vi publicerar enbart uppgifter som redan ingår i det ursprungliga, offentliggjorda dokumentet. Om du vill att ditt namn eller andra personuppgifter ska tas bort från ett publicerat dokument har du rätt att begära detta med stöd av GDPR (rätten till radering, artikel 17). Kontakta oss via e-post så hanterar vi ditt ärende.",
  },
  {
    title: "Ansvarsbegränsning",
    content:
      "LiU Tentor är en ideell, studentdriven tjänst utan vinstsyfte. Vi gör vårt bästa för att agera lagenligt och respektfullt gentemot rättighetsinnehavare. Vi kan dock inte garantera att samtliga publicerade dokument är helt fria från upphovsrättsliga anspråk. Om du identifierar ett problem ber vi dig höra av dig till oss direkt – vi föredrar dialog framför konflikt och löser frågor i samförstånd.",
  },
];
</script>

<template>
  <div class="w-full max-w-3xl">
    <h1 class="text-3xl font-semibold text-foreground mb-1">Upphovsrätt</h1>
    <p class="text-xs text-muted-foreground mb-6">
      Senast uppdaterad: 2026/03/23
    </p>
    <p class="text-sm text-foreground/80 leading-relaxed mb-6">
      LiU Tentor publicerar tentamaterial i syfte att hjälpa studenter att
      förbereda sig inför examinationer. Vi tar upphovsrätt och
      rättighetsinnehavares intressen på allvar. På denna sida förklarar vi hur
      vi förhåller oss till upphovsrättsliga frågor och hur du snabbt och enkelt
      kan begära att material tas bort.
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

    <div class="mt-8 pt-6 border-t space-y-4">
      <div class="flex items-center gap-2">
        <LucideShieldAlert class="h-5 w-5 text-primary" />
        <h3 class="text-sm font-medium">Begär borttagning av material</h3>
      </div>
      <p class="text-sm text-muted-foreground">
        Anser du att vi publicerat material som kränker din upphovsrätt eller
        dina personuppgifter? Kontakta oss så hanterar vi ditt ärende inom 48
        timmar.
      </p>
      <Button size="sm" @click="openMail"> Skicka borttagningsbegäran </Button>
    </div>
  </div>
</template>
