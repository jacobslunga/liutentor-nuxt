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
    title: "Personuppgiftsansvarig",
    content:
      "LiU Tentor är personuppgiftsansvarig för behandlingen av dina personuppgifter inom denna tjänst. Har du frågor om hur vi hanterar dina uppgifter är du välkommen att kontakta oss via liutentor@gmail.com.",
  },
  {
    title: "Information vi samlar in",
    content:
      "Vi samlar in information för att kunna tillhandahålla tjänsten och erbjuda personliga funktioner såsom sparade chattar:",
    items: [
      "E-postadress för inloggade användare (via Supabase Auth)",
      "Chattmeddelanden och konversationstitlar som sparas för att du ska kunna återse din historik",
      "Quizresultat och statistik kopplat till din användarprofil",
      "Anonymiserad användningsstatistik för att förstå hur tjänsten används",
      "Tentamaterial som du frivilligt väljer att ladda upp och dela",
    ],
  },
  {
    title: "Laglig grund för behandling",
    content:
      "Vi behandlar dina personuppgifter med stöd av följande rättsliga grunder enligt GDPR artikel 6:",
    items: [
      "Avtal (artikel 6.1 b) – För att kunna tillhandahålla ditt användarkonto och spara dina konversationer.",
      "Berättigat intresse (artikel 6.1 f) – För anonym analysstatistik i syfte att förbättra tjänsten.",
      "Samtycke (artikel 6.1 a) – När du frivilligt laddar upp material eller lämnar feedback.",
    ],
  },
  {
    title: "Tredjepartstjänster och dataöverföring",
    content:
      "Vi använder moderna molntjänster för att driva tjänsten och möjliggöra AI-funktionalitet:",
    items: [
      "Supabase: Vår databas och autentiseringstjänst. Din data lagras på servrar i Frankfurt, Tyskland (EU).",
      "AI-leverantörer (Google, OpenAI): Vid användning av chatten skickas meddelanden och relevant tentainnehåll till dessa för att generera svar. Ingen personlig profilinformation (som din e-post) delas med dessa leverantörer.",
      "Infrastruktur: Vi säljer aldrig dina personuppgifter till tredje part.",
    ],
  },
  {
    title: "Lagringstid",
    content:
      "Vi lagrar dina personuppgifter endast så länge det är nödvändigt för de ändamål de samlades in för:",
    items: [
      "Kontoinformation och chatthistorik lagras så länge ditt konto är aktivt eller tills du själv raderar dem.",
      "Anonym analysdata lagras i upp till 12 månader.",
      "Uppladdade tentafiler lagras tills du eller vi begär att de tas bort.",
    ],
  },
  {
    title: "Cookies",
    content:
      "Vi använder cookies för att hantera din inloggningssession samt för att spara vissa inställningar lokalt. Du kan styra användningen av cookies via din webbläsares inställningar.",
  },
  {
    title: "Dina rättigheter",
    content:
      "Enligt GDPR har du ett antal rättigheter avseende dina personuppgifter. Du har rätt att:",
    items: [
      "Begära tillgång till och utdrag av de personuppgifter vi behandlar om dig (dataportabilitet)",
      "Begära rättelse av felaktiga eller ofullständiga uppgifter",
      "Begära radering av dina uppgifter eller hela ditt konto",
      "Invända mot behandling som grundar sig på berättigat intresse",
      "Återkalla ditt samtycke när som helst",
    ],
  },
  {
    title: "Datasäkerhet",
    content:
      "Vi vidtar lämpliga tekniska säkerhetsåtgärder för att skydda dina data, inklusive krypterade anslutningar (HTTPS) och strikt åtkomstkontroll via Supabase RLS (Row Level Security) för att säkerställa att endast du kan komma åt dina privata chattar.",
  },
  {
    title: "Rätt att klaga",
    content:
      "Om du anser att vår behandling av dina personuppgifter strider mot GDPR har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY).",
    items: ["Webbplats: www.imy.se", "E-post: imy@imy.se"],
  },
];
</script>

<template>
  <div class="w-full max-w-3xl">
    <h1 class="text-3xl font-semibold text-foreground mb-1">
      Integritetspolicy
    </h1>
    <p class="text-xs text-muted-foreground mb-6">
      Senast uppdaterad: 2026-04-19
    </p>
    <p class="text-sm text-foreground/80 leading-relaxed mb-6">
      Hos LiU Tentor värnar vi om din integritet och behandlar dina
      personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR). Denna
      policy beskriver vilka uppgifter vi samlar in, hur de hanteras säkert i
      Frankfurt (EU), och vilka rättigheter du har som användare.
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
        Har du frågor om din data eller vill utöva dina rättigheter (t.ex.
        radera ditt konto)? Kontakta oss så hjälper vi dig.
      </p>
      <Button size="sm" @click="openMail"> liutentor@gmail.com </Button>
    </div>
  </div>
</template>
