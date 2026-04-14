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
      "Vi samlar in begränsad information för att kunna tillhandahålla och förbättra tjänsten:",
    items: [
      "Anonymiserad användningsstatistik för att förstå hur tjänsten används",
      "Sökhistorik som sparas lokalt i din webbläsare – vi har inte tillgång till denna",
      "Tentamaterial som du frivilligt väljer att ladda upp och dela",
      "Feedback som du frivilligt lämnar till oss",
    ],
  },
  {
    title: "Laglig grund för behandling",
    content:
      "Vi behandlar dina personuppgifter med stöd av följande rättsliga grunder enligt GDPR artikel 6:",
    items: [
      "Berättigat intresse (artikel 6.1 f) – för anonym analysstatistik i syfte att förbättra tjänsten",
      "Samtycke (artikel 6.1 a) – när du frivilligt laddar upp material eller lämnar feedback",
      "Avtal (artikel 6.1 b) – för uppgifter som är nödvändiga för att tillhandahålla tjänsten",
    ],
  },
  {
    title: "Hur vi använder informationen",
    content:
      "Vi använder informationen enbart för att förbättra tjänsten och ge dig en bättre upplevelse. Vi säljer aldrig dina personuppgifter till tredje part, och vi delar dem inte med externa aktörer utöver de tjänsteleverantörer som anges nedan.",
  },
  {
    title: "Lagringstid",
    content:
      "Vi lagrar dina personuppgifter endast så länge det är nödvändigt för de ändamål de samlades in för:",
    items: [
      "Anonym analysdata lagras i upp till 12 månader",
      "Uppladdade tentafiler lagras tills du eller vi begär att de tas bort",
      "Sökhistorik lagras lokalt i din webbläsare och raderas när du rensar din webbläsardata",
    ],
  },
  {
    title: "Cookies",
    content:
      "Vi använder cookies för att spara inställningar och sökhistorik lokalt i din webbläsare. Dessa cookies lagras enbart på din enhet och skickas inte till oss. Du kan rensa dem när som helst via din webbläsares inställningar.",
  },
  {
    title: "Tredjepartstjänster och dataöverföring",
    content:
      "Vi använder Supabase för lagring och autentisering. Supabase kan komma att lagra data på servrar utanför EU/EES. I sådana fall sker överföringen med stöd av EU:s standardavtalsklausuler (Standard Contractual Clauses) i enlighet med GDPR artikel 46. Vi använder även anonymiserade analysverktyg. Dessa leverantörer har egna integritetspolicyer och behandlar data för vår räkning som personuppgiftsbiträden.",
  },
  {
    title: "Dina rättigheter",
    content:
      "Enligt GDPR har du ett antal rättigheter avseende dina personuppgifter. Du har rätt att:",
    items: [
      "Begära tillgång till de personuppgifter vi behandlar om dig",
      "Begära rättelse av felaktiga eller ofullständiga uppgifter",
      "Begära radering av dina uppgifter ('rätten att bli bortglömd')",
      "Invända mot behandling som grundar sig på berättigat intresse",
      "Begära begränsning av behandlingen i vissa situationer",
      "Återkalla ditt samtycke när som helst, utan att det påverkar lagligheten av tidigare behandling",
    ],
  },
  {
    title: "Rätt att klaga",
    content:
      "Om du anser att vår behandling av dina personuppgifter strider mot GDPR har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY), som är tillsynsmyndighet i Sverige.",
    items: [
      "Webbplats: www.imy.se",
      "E-post: imy@imy.se",
      "Telefon: 08-657 61 00",
    ],
  },
  {
    title: "Automatiserat beslutsfattande",
    content:
      "Vi använder inte automatiserat beslutsfattande eller profilering som har rättsliga eller liknande betydande effekter för dig.",
  },
  {
    title: "Datasäkerhet",
    content:
      "Vi vidtar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina personuppgifter mot obehörig åtkomst, förlust eller förstörelse. Bland annat använder vi krypterade anslutningar (HTTPS) och åtkomstkontroll för lagrade data.",
  },
  {
    title: "Ändringar i denna policy",
    content:
      "Vi kan komma att uppdatera denna integritetspolicy. Vid väsentliga förändringar meddelar vi dig via tjänsten. Datumet för senaste uppdatering framgår längst upp på denna sida.",
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
      Hos LiU Tentor värnar vi om din integritet och behandlar dina
      personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR). Denna
      policy beskriver vilka uppgifter vi samlar in, varför vi gör det, och
      vilka rättigheter du har.
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
        Har du frågor om vår integritetspolicy eller vill utöva dina
        rättigheter? Kontakta oss så svarar vi normalt inom 48 timmar.
      </p>
      <Button size="sm" @click="openMail"> liutentor@gmail.com </Button>
    </div>
  </div>
</template>
