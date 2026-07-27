<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Om oss",
  description:
    "Lär känna teamet bakom LiU Tentor och vår mission att göra tentaplugg enklare för alla studenter vid Linköpings universitet.",
  robots: "index, follow",
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
        <LucideInfo class="size-3.5" />
        <span>Studentdrivet initiativ</span>
      </div>
      <h1 class="text-3xl font-semibold text-foreground tracking-tight">Om LiU Tentor</h1>
      <p class="text-base text-muted-foreground mt-2">
        Vår mission är att göra tentaplugg så smidigt och tillgängligt som möjligt för alla studenter vid Linköpings universitet.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-3xl bg-card p-6 space-y-3">
        <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <LucideSparkles class="size-5" />
        </div>
        <h2 class="text-lg font-semibold text-foreground">Varför vi startade</h2>
        <p class="text-sm text-muted-foreground leading-relaxed">
          LiU Tentor startades av studenter som tröttnade på att klicka runt i röriga mappar för att hitta gamla tentor. Det som började som ett sidoprojekt en sen kväll under tentaveckan har vuxit till en samlingsplats för hela universitetet.
        </p>
      </div>

      <div class="rounded-3xl bg-card p-6 space-y-3">
        <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <LucideTarget class="size-5" />
        </div>
        <h2 class="text-lg font-semibold text-foreground">Vårt mål</h2>
        <p class="text-sm text-muted-foreground leading-relaxed">
          Vi vill spara tid för studenter. Med snabbsökning, samlad betygsstatistik och AI-assisterat tentaplugg gör vi det enkelt att hitta rätt material och förstå svåra uppgifter.
        </p>
      </div>
    </div>

    <div class="rounded-3xl bg-card p-6 sm:p-8 space-y-4">
      <h2 class="text-xl font-semibold text-foreground">Byggt för studenter, av studenter</h2>
      <div class="text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>
          Vi bygger LiU Tentor för att vi själva använder tjänsten varje dag. Vi utvecklar och förbättrar plattformen kontinuerligt utifrån er feedback och förslag.
        </p>
        <p>
          Har du idéer, upptäckt en bugg eller vill ladda upp tentamaterial? Tveka inte att höra av dig via vår feedback-sida eller ladda upp tentor direkt i appen!
        </p>
      </div>
    </div>
  </div>
</template>
