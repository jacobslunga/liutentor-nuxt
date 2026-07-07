<script setup lang="ts">
const route = useRoute();
const sidebarOpen = ref(false);

const pageTitles: Record<string, string> = {
  "/om-oss": "Om oss",
  "/faq": "Vanliga frågor",
  "/upload-exams": "Ladda upp tenta",
  "/feedback": "Feedback",
  "/privacy-policy": "Integritetspolicy",
  "/copyright-policy": "Upphovsrätt",
  "/ai-policy": "AI-policy",
};

const currentTitle = computed(() => pageTitles[route.path] ?? "");
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <InfoSidebar v-model:open="sidebarOpen" />

    <div class="flex min-h-screen flex-1 flex-col lg:pl-56">
      <header class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4 lg:hidden">
        <Button variant="ghost" size="icon-sm" @click="sidebarOpen = true">
          <LucideMenu class="size-4" />
        </Button>
        <span class="text-sm font-medium truncate">{{ currentTitle }}</span>
      </header>

      <main class="flex-1">
        <div class="mx-auto max-w-3xl px-4 py-12 lg:py-16">
          <slot />
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>
