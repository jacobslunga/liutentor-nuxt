<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Vanliga frågor (FAQ)",
  description:
    "Svar på vanliga frågor om LiU Tentor, tentamaterial, uppladdningar och statistik.",
  robots: "index, follow",
});

const { open: openUploadModal } = useUploadModal();

const groups = [
  {
    label: "Om tjänsten",
    faqs: [
      {
        q: "Är det här en officiell LiU-sida?",
        a: "Nej, LiU Tentor är ett studentdrivet, fristående projekt som är skapat av studenter för studenter vid Linköpings universitet.",
      },
      {
        q: "Kostar det något eller krävs konto?",
        a: "Att söka och läsa tentor är gratis och kräver inget konto. Du loggar bara in om du vill spara chattar och quizhistorik.",
      },
    ],
  },
  {
    label: "Material",
    faqs: [
      {
        q: "Var kommer tentorna ifrån?",
        a: "Alla tentor är offentliga handlingar som antingen har hämtats från universitetets öppna kurshemsidor eller laddats upp av hjälpsamma studenter.",
      },
      {
        q: "Hur laddar jag upp nya tentor eller facit?",
        a: "Klicka på 'Ladda upp tenta' i menyn för att dra och släppa dina PDF-filer. Materialet granskas och blir därefter tillgängligt för alla.",
      },
      {
        q: "Varför saknas tentor för min kurs?",
        a: "Om din kurs saknar tentor beror det oftast på att materialet inte publicerats öppet än. Ladda gärna upp tentor om du har dem på din dator!",
      },
    ],
  },
  {
    label: "Statistik & AI",
    faqs: [
      {
        q: "Hur fungerar tentastatistiken och betygsfördelningen?",
        a: "Betygsstatistik och godkändprocent hämtas från offentlig tentastatistik vid LiU och sammanställs automatiskt på respektive kurssida.",
      },
      {
        q: "Hur fungerar AI-assistenten för tentor?",
        a: "AI-assistenten analyserar den valda tentan och facit i realtid för att ge förklaringar, stegvisa ledtrådar eller besvara dina frågor direkt i webbläsaren.",
      },
      {
        q: "Kan jag lita på AI:ns svar?",
        a: "Se dem som pedagogiska förslag, inte som facit. AI-modeller kan ha fel, så dubbelkolla alltid kritiska beräkningar mot kurslitteraturen. Läs mer i vår AI-policy.",
      },
    ],
  },
];
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Support"
      title="Vanliga frågor"
      lead="Svar på det vi får frågor om oftast – om var tentorna kommer ifrån, hur statistiken räknas och vad AI-assistenten faktiskt gör."
    />

    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <section
        v-for="(group, i) in groups"
        :key="group.label"
        class="grid gap-x-12 gap-y-2 py-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-10"
        :class="i > 0 ? 'border-t' : ''"
      >
        <p
          class="pt-6 text-sm font-medium text-muted-foreground lg:sticky lg:top-24 lg:self-start"
        >
          {{ group.label }}
        </p>

        <dl class="max-w-2xl">
          <div v-for="faq in group.faqs" :key="faq.q" class="border-b py-6 last:border-b-0">
            <dt class="text-base font-medium text-foreground">
              {{ faq.q }}
            </dt>
            <dd class="mt-2 text-[0.9375rem] leading-[1.75] text-foreground/70">
              {{ faq.a }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="grid gap-x-12 gap-y-6 border-t py-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-20">
        <h2 class="text-lg font-medium text-foreground">
          Hittade du inte svaret?
        </h2>
        <div class="max-w-2xl">
          <p class="text-[0.9375rem] leading-[1.75] text-foreground/75">
            Skicka en rad till oss så svarar vi – eller fyll luckan direkt genom att ladda upp
            tentor som saknas.
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" as-child>
              <NuxtLink to="/feedback">Skicka feedback</NuxtLink>
            </Button>
            <Button size="sm" variant="outline" @click="openUploadModal()">
              <LucideUpload class="size-3.5" />
              Ladda upp tenta
            </Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
