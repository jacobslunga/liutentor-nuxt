<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Vanliga frågor",
  description: "Hitta svar på de vanligaste frågorna om LiU Tentor.",
  robots: "index, follow",
});

const faqs = [
  {
    q: "Är det här en officiell LiU-sida?",
    a: "Nej, detta är ett studentdrivet projekt och är inte kopplat till Linköpings universitet.",
  },
  {
    q: "Var kommer tentorna ifrån?",
    a: "Tentorna är offentliga dokument som hämtas från universitetets hemsida eller laddas upp av användare.",
  },
  {
    q: "Hur kan jag bidra med fler tentor?",
    a: "Du kan enkelt ladda upp tentor via uppladdningssidan. Vi granskar materialet innan det publiceras.",
  },
  {
    q: "Varför finns det inga tentor för min kurs?",
    a: "Antingen har vi inte fått in några tentor för den kursen än, eller så är de ännu inte uppladdade. Du får gärna bidra själv!",
  },
  {
    q: "Vad är facit och hur vet jag om en tenta har det?",
    a: "Ett facit är en lösningsdel eller svarsmall till tentan. Om ett facit finns bifogat visas det som en separat fil bredvid tentan.",
  },
  {
    q: "Hur fungerar statistiken på kurssidorna?",
    a: "Statistiken baseras på data från tidigare tentor, såsom betygsfördelning och godkändprocent. All data är hämtad från universitetets officiella källor.",
  },
  {
    q: "Vad gör jag om en tenta inte laddas?",
    a: "Försök att ladda om sidan eller öppna tentan i en ny flik. Om problemet kvarstår, kontakta oss gärna via mejl eller via feedbackformuläret.",
  },
];
</script>

<template>
  <div class="w-full max-w-3xl">
    <h1 class="text-3xl font-semibold text-foreground mb-2">Vanliga frågor</h1>
    <p class="text-sm text-muted-foreground mb-6">
      Hitta svar på de vanligaste frågorna om LiU Tentor
    </p>

    <Accordion type="multiple" class="w-full space-y-3">
      <AccordionItem v-for="(faq, i) in faqs" :key="i" :value="String(i)">
        <AccordionTrigger>{{ faq.q }}</AccordionTrigger>
        <AccordionContent>{{ faq.a }}</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
