<script setup lang="ts">
const year = new Date().getFullYear();

const groupedLinks = [
  {
    title: "Sidor",
    links: [
      { name: "Hem", href: "/" },
      { name: "Om oss", href: "/om-oss" },
    ],
  },
  {
    title: "Juridiskt",
    links: [
      { name: "Integritetspolicy", href: "/privacy-policy" },
      { name: "Upphovsrätt", href: "/copyright-policy" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Feedback", href: "/feedback" },
      { name: "Vanliga frågor", href: "/faq" },
    ],
  },
];
</script>

<template>
  <footer class="w-full bg-background mt-24 relative z-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="md:col-span-1 space-y-4">
          <div class="flex items-center gap-2">
            <LogoIcon class="w-8 h-8 text-primary" />
            <span class="text-xl font-logo font-normal tracking-tighter">
              LiU Tentor
            </span>
          </div>
          <p class="text-sm font-normal text-muted-foreground">
            Din resurs för tentamensarkiv vid Linköpings Universitet.
          </p>
        </div>

        <div class="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div v-for="section in groupedLinks" :key="section.title">
            <h4 class="text-sm font-medium text-foreground/80 mb-3">
              {{ section.title }}
            </h4>
            <ul class="space-y-2">
              <li v-for="link in section.links" :key="link.href">
                <NuxtLink
                  :to="link.href"
                  class="text-sm font-normal text-muted-foreground hover:text-foreground transition-colors"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p class="text-xs font-normal text-muted-foreground">
          &copy; {{ year }} LiU Tentor. Alla rättigheter förbehållna.
        </p>
        <div class="flex items-center gap-4">
          <a
            href="mailto:liutentor@gmail.com"
            class="text-xs font-normal text-muted-foreground hover:text-primary transition-colors"
          >
            liutentor@gmail.com
          </a>
          <SettingsDialog />
        </div>
      </div>
    </div>
  </footer>
</template>
