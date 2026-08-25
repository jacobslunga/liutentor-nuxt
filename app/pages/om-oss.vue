<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Om oss",
  description:
    "Lär känna teamet bakom LiU Tentor och vår mission att göra tentaplugg enklare för alla studenter vid Linköpings universitet.",
  robots: "index, follow",
});

const { open: openUploadModal } = useUploadModal();

const story = [
  {
    heading: "Varför vi finns",
    paragraphs: [
      "LiU Tentor startades av studenter som tröttnade på att klicka runt i röriga mappar för att hitta gamla tentor. Det som började som ett sidoprojekt en sen kväll under tentaveckan har vuxit till en samlingsplats för hela universitetet.",
      "Idén är enkel: allt material som redan är offentligt borde vara sökbart på ett ställe, utan inloggning, utan omvägar.",
    ],
  },
  {
    heading: "Vad du kan göra här",
    paragraphs: [
      "Sök upp din kurs och få alla tentor och facit samlade i en lista. Se betygsfördelning och godkändprocent för tidigare tillfällen. Öppna en tenta och be AI-assistenten om en ledtråd när du kör fast, eller generera ett quiz på materialet inför tentadagen.",
    ],
  },
  {
    heading: "Byggt av studenter, för studenter",
    paragraphs: [
      "Vi bygger LiU Tentor för att vi använder tjänsten själva varje dag. Varje förbättring kommer från något som irriterade oss under en pluggkväll – eller från feedback som någon annan skickat in.",
      "Har du en idé, hittat en bugg eller sitter du på tentor som saknas? Hör av dig, eller ladda upp direkt i appen.",
    ],
  },
];

const principles = [
  {
    title: "Gratis och utan konto",
    body: "Att söka och läsa tentor kräver ingen inloggning. Konto behövs bara för sparade chattar och quizhistorik.",
  },
  {
    title: "Din data stannar hos dig",
    body: "Vi säljer aldrig personuppgifter. Allt lagras inom EU och du kan radera ditt konto när du vill.",
  },
  {
    title: "Ärliga om AI:n",
    body: "AI-assistenten är ett stöd, inte ett facit. Vi är tydliga med var den brister istället för att överdriva vad den klarar.",
  },
];
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Om oss"
      title="Tentaplugget borde inte börja med en filjakt."
      lead="LiU Tentor är ett studentdrivet, fristående projekt. Vår mission är att göra tentaplugg så smidigt och tillgängligt som möjligt för alla vid Linköpings universitet."
    />

    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <section
        v-for="(block, i) in story"
        :key="block.heading"
        class="grid gap-x-12 gap-y-5 py-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-14"
        :class="i > 0 ? 'border-t' : ''"
      >
        <h2 class="text-lg font-medium leading-snug text-foreground lg:sticky lg:top-24 lg:self-start">
          {{ block.heading }}
        </h2>
        <div class="max-w-2xl space-y-4">
          <p
            v-for="(paragraph, j) in block.paragraphs"
            :key="j"
            class="text-[0.9375rem] leading-[1.75] text-foreground/75"
          >
            {{ paragraph }}
          </p>
        </div>
      </section>

      <section class="border-t py-14 lg:py-20">
        <p class="text-sm font-medium text-muted-foreground">
          Tre saker vi står för
        </p>
        <div class="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
          <div v-for="(principle, i) in principles" :key="principle.title">
            <span class="text-3xl font-medium leading-none text-primary">
              {{ String(i + 1).padStart(2, "0") }}
            </span>
            <h3 class="mt-4 text-base font-medium text-foreground">
              {{ principle.title }}
            </h3>
            <p class="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {{ principle.body }}
            </p>
          </div>
        </div>
      </section>

      <section class="grid gap-x-12 gap-y-6 border-t py-14 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-20">
        <h2 class="text-lg font-medium text-foreground">Hjälp till</h2>
        <div class="max-w-2xl">
          <p class="text-[0.9375rem] leading-[1.75] text-foreground/75">
            Arkivet växer när studenter delar med sig. Ligger det tentor på din dator som saknas
            här, tar uppladdningen under en minut.
          </p>
          <div class="mt-7 flex flex-wrap items-center gap-3">
            <Button size="sm" @click="openUploadModal()">
              <LucideUpload class="size-3.5" />
              Ladda upp tenta
            </Button>
            <Button size="sm" variant="outline" as-child>
              <NuxtLink to="/feedback">Skicka feedback</NuxtLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
