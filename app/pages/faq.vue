<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Vanliga frågor (FAQ)",
  description: "Svar på vanliga frågor om LiU Tentor, tentamaterial, uppladdningar och statistik.",
  robots: "index, follow",
});

const { open: openUploadModal } = useUploadModal();

const faqs = [
  {
    q: "Är det här en officiell LiU-sida?",
    a: "Nej, LiU Tentor är ett studentdrivet, fristående projekt som är skapat av studenter för studenter vid Linköpings universitet.",
  },
  {
    q: "Var kommer tentorna ifrån?",
    a: "Alla tentor är offentliga handlingar som antingen har hämtats från universitetets öppna kurshemsidor eller laddats upp av hjälpsamma studenter.",
  },
  {
    q: "Hur laddar jag upp nya tentor eller facit?",
    a: "Du kan när som helst klicka på 'Ladda upp tenta' i menyn för att dra och släppa dina PDF-filer. Materialet granskas och blir därefter tillgängligt för alla.",
  },
  {
    q: "Varför saknas tentor för min kurs?",
    a: "Om din kurs saknar tentor beror det oftast på att materialet inte publicerats öppet än. Ladda gärna upp tentor om du har dem på din dator!",
  },
  {
    q: "Hur fungerar tentastatistiken och betygsfördelningen?",
    a: "Betygsstatistik och godkändprocent hämtas från offentlig tentastatistik vid LiU och sammanställs automatiskt på respektive kurssida.",
  },
  {
    q: "Hur fungerar AI-assistenten för tentor?",
    a: "AI-assistenten analyserar den valda tentan och facit i realtid för att ge förklaringar, stegvisa ledtrådar eller besvara dina frågor direkt i webbläsaren.",
  },
];
</script>

<template>
  <div class="space-y-8">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
        <LucideHelpCircle class="size-3.5" />
        <span>FAQ & Svar</span>
      </div>
      <h1 class="text-3xl font-semibold text-foreground tracking-tight">Vanliga frågor</h1>
      <p class="text-base text-muted-foreground mt-2">
        Här samlar vi svar på de vanligaste frågorna om LiU Tentor.
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(faq, i) in faqs"
        :key="i"
        class="rounded-3xl bg-card p-6 transition-colors duration-150 ease-spring hover:bg-accent"
      >
        <h3 class="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
          <LucideHelpCircle class="size-4 text-primary shrink-0" />
          <span>{{ faq.q }}</span>
        </h3>
        <p class="text-sm text-muted-foreground leading-relaxed pl-6">
          {{ faq.a }}
        </p>
      </div>
    </div>

    <div class="rounded-3xl bg-primary/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="text-base font-semibold text-foreground">Hittade du inte svaret du sökte?</h4>
        <p class="text-sm text-muted-foreground mt-0.5">Ladda upp nya tentor eller skicka feedback till oss.</p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="default" size="sm" @click="openUploadModal()">
          <LucideUpload class="size-4" />
          Ladda upp tenta
        </Button>
        <Button variant="outline" size="sm" as-child>
          <NuxtLink to="/feedback">Feedback</NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>
