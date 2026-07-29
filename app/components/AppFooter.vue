<script setup lang="ts">
const year = new Date().getFullYear();

// The footer is the site's navigation for every page outside the app itself,
// so it carries the full map rather than a token set of links.
const groupedLinks = [
  {
    title: "Tjänsten",
    links: [
      { name: "Sök tentor", href: "/" },
      { name: "Ladda upp tenta", href: "/upload-exams" },
      { name: "Om oss", href: "/om-oss" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Vanliga frågor", href: "/faq" },
      { name: "Feedback", href: "/feedback" },
    ],
  },
  {
    title: "Juridiskt",
    links: [
      { name: "Integritetspolicy", href: "/privacy-policy" },
      { name: "Upphovsrätt", href: "/copyright-policy" },
      { name: "AI-policy", href: "/ai-policy" },
    ],
  },
];
</script>

<template>
  <footer class="relative z-10 mt-24 w-full border-t bg-background">
    <div class="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-4">
        <div class="space-y-4 md:col-span-1">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 transition-opacity duration-150 ease-spring hover:opacity-70"
          >
            <LogoIcon class="size-7 text-primary" />
            <span class="font-logo text-xl font-medium tracking-tighter">LiU Tentor</span>
          </NuxtLink>
          <p class="max-w-56 text-sm leading-relaxed text-muted-foreground">
            Studentdrivet tentaarkiv för Linköpings universitet.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
          <div v-for="section in groupedLinks" :key="section.title">
            <h4 class="font-mono text-2xs uppercase tracking-[0.18em] text-muted-foreground">
              {{ section.title }}
            </h4>
            <ul class="mt-4 space-y-2.5">
              <li v-for="link in section.links" :key="link.href">
                <NuxtLink
                  :to="link.href"
                  class="text-sm text-foreground/70 transition-colors duration-150 ease-spring hover:text-foreground"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="mt-14 flex flex-col items-start justify-between gap-4 border-t pt-8 sm:flex-row sm:items-center"
      >
        <p class="text-xs text-muted-foreground">
          &copy; {{ year }} LiU Tentor. Inte affilierad med Linköpings universitet.
        </p>
        <div class="flex items-center gap-5">
          <a
            href="mailto:liutentor@gmail.com"
            class="text-xs text-muted-foreground transition-colors duration-150 ease-spring hover:text-foreground"
          >
            liutentor@gmail.com
          </a>
          <SettingsDialog />
        </div>
      </div>
    </div>
  </footer>
</template>
