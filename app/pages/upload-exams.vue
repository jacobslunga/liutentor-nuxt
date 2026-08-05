<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Ladda upp tenta",
  description: "Ladda upp gamla tentor och facit till LiU Tentor.",
  robots: "index, follow",
});
</script>

<template>
  <div>
    <PageIntro
      eyebrow="Bidra"
      title="Ladda upp tenta"
      lead="Hjälp andra studenter genom att dela gamla tentor och facit. Dra in PDF:erna, ange kurskod och skicka – vi sköter resten."
    />

    <div class="mx-auto max-w-6xl px-5 sm:px-8">
      <div class="grid gap-x-12 gap-y-8 py-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-16">
        <p class="text-sm font-medium text-muted-foreground lg:sticky lg:top-24 lg:self-start">
          Uppladdning
        </p>
        <div class="max-w-2xl">
          <ExamUploadForm :show-heading="false" />
        </div>
      </div>
    </div>
  </div>
</template>
