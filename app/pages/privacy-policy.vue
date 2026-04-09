<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Integritetspolicy",
  description:
    "Läs om hur LiU Tentor hanterar dina personuppgifter och vår integritetspolicy.",
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
    title: "Information vi samlar in",
    content:
      "Vi samlar in begränsad information för att förbättra din upplevelse:",
    items: [
      "Anonyma användningsdata för att förbättra tjänsten",
      "Sökhistorik som sparas lokalt i din webbläsare",
      "Uppladdad tentamaterial som du väljer att dela",
      "Feedback du frivilligt lämnar",
    ],
  },
  {
    title: "Hur vi använder informationen",
    content:
      "Vi använder informationen enbart för att förbättra tjänsten och ge dig en bättre upplevelse. Vi säljer aldrig din data till tredje part.",
  },
  {
    title: "Cookies",
    content:
      "Vi använder cookies för att spara inställningar och sökhistorik lokalt. Du kan rensa dessa när som helst via din webbläsares inställningar.",
  },
  {
    title: "Tredjepartstjänster",
    content:
      "Vi använder Supabase för lagring och autentisering, samt anonyma analysverktyg. Dessa tjänster har egna integritetspolicyer.",
  },
  {
    title: "Dina rättigheter",
    content: "Du har rätt att:",
    items: [
      "Begära tillgång till dina personuppgifter",
      "Begära rättelse eller radering av dina uppgifter",
      "Återkalla ditt samtycke när som helst",
    ],
  },
  {
    title: "Datasäkerhet",
    content:
      "Vi vidtar rimliga tekniska och organisatoriska åtgärder för att skydda dina uppgifter mot obehörig åtkomst.",
  },
  {
    title: "Kontakt",
    content:
      "Om du har frågor om vår integritetspolicy är du välkommen att kontakta oss:",
    items: [
      "E-post: liutentor@gmail.com",
      "Vi svarar normalt inom 48 timmar",
      "Du kan även använda feedbackformuläret på hemsidan",
    ],
  },
  {
    title: "Hantering av personuppgifter och GDPR",
    content:
      "Vi visar offentligt tillgängliga tentor som publicerats av universitetet, inklusive namn på examinatorer som en del av dokumentets originalinnehåll. Vi respekterar rätten till integritet och följer GDPR-regleringen.",
    items: [
      "Vi publicerar endast tentor som är offentligt tillgängliga.",
      "Examinatorers namn ingår endast om de finns med i den ursprungliga tentan.",
      "Om du vill begära borttagning av en tenta eller ett namn, vänligen kontakta oss via e-post.",
    ],
  },
];
</script>

<template>
  <div class="w-full max-w-3xl">
    <h1 class="text-3xl font-semibold text-foreground mb-1">
      Integritetspolicy
    </h1>
    <p class="text-xs text-muted-foreground mb-6">
      Senast uppdaterad: 2026/03/23
    </p>
    <p class="text-sm text-foreground/80 leading-relaxed mb-6">
      Hos LiU Tentor värnar vi om din integritet. Denna policy beskriver hur vi
      samlar in, använder och skyddar information när du använder vår tjänst.
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

    <div class="mt-8 pt-6 border-t space-y-2">
      <div class="flex items-center gap-2">
        <LucideMailbox class="h-5 w-5 text-primary" />
        <h3 class="text-sm font-medium">Kontakta oss</h3>
      </div>
      <p class="text-sm text-muted-foreground">
        Om du har frågor om vår integritetspolicy är du välkommen att kontakta
        oss.
      </p>
      <Button size="sm" @click="openMail"> liutentor@gmail.com </Button>
    </div>
  </div>
</template>
