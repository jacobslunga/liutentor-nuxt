<script setup lang="ts">
const route = useRoute();

const isActive = (path: string) => route.path === path;

const navGroups = [
  {
    title: "Information",
    links: [
      { to: "/om-oss", label: "Om oss", icon: "LucideInfo" },
      { to: "/faq", label: "Vanliga frågor", icon: "LucideHelpCircle" },
      { to: "/feedback", label: "Feedback", icon: "LucideMessageSquare" },
    ],
  },
  {
    title: "Villkor & Policyer",
    links: [
      { to: "/privacy-policy", label: "Integritetspolicy", icon: "LucideShieldCheck" },
      { to: "/copyright-policy", label: "Upphovsrätt", icon: "LucideCopyright" },
      { to: "/ai-policy", label: "AI-policy", icon: "LucideBot" },
    ],
  },
];

const mobileOpen = defineModel<boolean>("open", { default: false });
</script>

<template>
  <Sheet v-model:open="mobileOpen">
    <SheetContent side="left" class="w-64 p-0">
      <div class="flex items-center gap-2 px-4 h-14 border-b shrink-0">
        <LogoIcon class="w-6 h-6 text-primary" />
        <span class="font-medium font-logo tracking-tighter text-lg">LiU Tentor</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-4 space-y-6">
        <div v-for="group in navGroups" :key="group.title" class="space-y-2">
          <p class="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-2">
            {{ group.title }}
          </p>
          <div class="space-y-1">
            <NuxtLink
              v-for="link in group.links"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors"
              :class="
                isActive(link.to)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              "
              @click="mobileOpen = false"
            >
              <component :is="link.icon" class="size-4 shrink-0" />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </SheetContent>
  </Sheet>

  <aside class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-60 border-r bg-background/95 backdrop-blur-sm">
    <NuxtLink to="/" class="flex items-center gap-2 px-4 h-14 shrink-0 border-b hover:opacity-80 transition-opacity">
      <LogoIcon class="w-6 h-6 text-primary" />
      <span class="font-medium font-logo tracking-tighter text-lg">LiU Tentor</span>
    </NuxtLink>
    <nav class="flex-1 overflow-y-auto p-4 space-y-6">
      <div v-for="group in navGroups" :key="group.title" class="space-y-2">
        <p class="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-2">
          {{ group.title }}
        </p>
        <div class="space-y-1">
          <NuxtLink
            v-for="link in group.links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors"
            :class="
              isActive(link.to)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            "
          >
            <component :is="link.icon" class="size-4 shrink-0" />
            <span>{{ link.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>
  </aside>
</template>
