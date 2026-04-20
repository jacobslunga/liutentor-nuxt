<script setup lang="ts">
const route = useRoute();
const isCurrentPath = (path: string) =>
  path === "/" ? route.path === "/" : route.path.startsWith(path);

const navLinks = [
  { to: "/faq", label: "Vanliga frågor" },
  { to: "/om-oss", label: "Om oss" },
  { to: "/upload-exams", label: "Ladda upp" },
  { to: "/feedback", label: "Feedback" },
  { to: "/privacy-policy", label: "Integritet" },
];

const mobileOpen = ref(false);
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background">
    <header
      class="sticky top-0 z-40 w-full bg-linear-to-b from-background to-transparent"
    >
      <div
        class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <LogoIcon class="w-7 h-7" />
          <span class="font-medium text-lg font-logo tracking-tighter"
            >LiU Tentor</span
          >
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 font-medium text-sm rounded-md transition-colors"
            :class="
              isCurrentPath(link.to)
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            "
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="md:hidden">
              <LucideMenu class="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-70">
            <SheetHeader>
              <SheetTitle class="flex items-center gap-2">
                <LogoIcon class="w-7 h-7" />
                <span class="font-medium text-lg font-logo tracking-tighter"
                  >LiU Tentor</span
                >
              </SheetTitle>
            </SheetHeader>
            <div class="mt-6 space-y-1">
              <NuxtLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="block px-3 py-2 text-sm rounded-md transition-colors"
                :class="
                  isCurrentPath(link.to)
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                "
                @click="mobileOpen = false"
              >
                {{ link.label }}
              </NuxtLink>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
