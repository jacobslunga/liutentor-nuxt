<script setup lang="ts">
const route = useRoute();
const sidebarOpen = ref(false);
const { open: openUploadModal } = useUploadModal();

const pageTitles: Record<string, string> = {
  "/om-oss": "Om oss",
  "/faq": "Vanliga frågor",
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

    <div class="flex min-h-screen flex-1 flex-col lg:pl-60">
      <!-- Top header bar for both mobile & desktop -->
      <header class="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 lg:px-8">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" class="lg:hidden" @click="sidebarOpen = true">
            <LucideMenu class="size-4" />
          </Button>

          <NuxtLink to="/" class="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <LucideArrowLeft class="size-3.5" />
            <span>Hem</span>
          </NuxtLink>
          <span class="hidden sm:inline text-muted-foreground/40">/</span>
          <span class="text-sm font-medium text-foreground truncate">{{ currentTitle }}</span>
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="openUploadModal()">
            <LucideUpload class="size-3.5" />
            <span class="hidden sm:inline">Ladda upp tenta</span>
            <span class="sm:hidden">Ladda upp</span>
          </Button>
        </div>
      </header>

      <main class="flex-1">
        <div class="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
          <slot />
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>
