<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Om oss",
  description:
    "Lär känna teamet bakom LiU Tentor och vår mission att göra tentorstudering enklare för alla studenter vid Linköpings universitet.",
  robots: "index, follow",
});
</script>

<template>
  <div class="w-full max-w-3xl">
    <h1 class="text-3xl font-semibold text-foreground mb-2">Om oss</h1>
    <p class="text-sm font-medium text-muted-foreground mb-6">
      Studentdrivet projekt för enklare tentplugg
    </p>
    <div
      class="text-sm text-foreground/80 font-medium leading-relaxed space-y-4"
    >
      <p>
        LiU Tentor är ett ideellt initiativ som startades av några studenter vid
        Linköpings universitet som tröttnade på att klicka runt i evigheter för
        att hitta rätt tenta. Det började som ett sidoprojekt en sen kväll under
        tentaveckan, och har sedan dess vuxit till något större än vi trodde.
      </p>
      <p>
        Vårt mål är enkelt: att göra det så smidigt som möjligt att hitta gamla
        tentor, lösningar och material för att kunna plugga smartare. Vi vet hur
        det känns att sitta dagen innan tenta och desperat leta efter en
        lösningsfil som kanske eller kanske inte finns någonstans på
        kurshemsidan.
      </p>
      <p>
        Vi bygger LiU Tentor för att vi själva använder det – och förbättrar det
        ständigt utifrån våra behov, era förslag och små idéer som dyker upp
        mitt i natten. Det är ett passion project, men också något vi verkligen
        tror gör studentlivet lite enklare.
      </p>
      <p>
        Har du idéer, hittat en bugg eller vill bara säga hej? Hör av dig! Vi
        älskar feedback.
      </p>
    </div>
  </div>
</template>
