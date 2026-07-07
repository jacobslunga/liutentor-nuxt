<script setup lang="ts">
const route = useRoute();

const isActive = (path: string) => route.path === path;

const navLinks = [
  { to: "/om-oss", label: "Om oss" },
  { to: "/faq", label: "Vanliga frågor" },
  { to: "/upload-exams", label: "Ladda upp tenta" },
  { to: "/feedback", label: "Feedback" },
  { to: "/privacy-policy", label: "Integritetspolicy" },
  { to: "/copyright-policy", label: "Upphovsrätt" },
  { to: "/ai-policy", label: "AI-policy" },
];

const mobileOpen = defineModel<boolean>("open", { default: false });
</script>

<template>
  <Sheet v-model:open="mobileOpen">
    <SheetContent side="left" class="w-64 p-0">
      <div class="flex items-center gap-2 px-4 h-14 border-b shrink-0">
        <LogoIcon class="w-6 h-6" />
        <span class="font-normal font-logo tracking-tighter">LiU Tentor</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-2">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block px-3 py-2 text-sm rounded-md transition-colors"
          :class="
            isActive(link.to)
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          "
          @click="mobileOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </SheetContent>
  </Sheet>

  <aside class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 w-56 border-r bg-background">
    <NuxtLink to="/" class="flex items-center gap-2 px-4 h-14 shrink-0 hover:opacity-80 transition-opacity">
      <LogoIcon class="w-6 h-6" />
      <span class="font-normal font-logo tracking-tighter">LiU Tentor</span>
    </NuxtLink>
    <nav class="flex-1 overflow-y-auto p-2">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="block px-3 py-2 text-sm rounded-md transition-colors"
        :class="
          isActive(link.to)
            ? 'bg-secondary text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        "
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>
