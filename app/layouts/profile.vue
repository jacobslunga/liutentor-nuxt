<script setup lang="ts">
const user = useSupabaseUser();
const router = useRouter();

watch(
  user,
  (u) => {
    if (!u) navigateTo("/logga-in", { replace: true });
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background">
    <header class="sticky top-0 z-40 w-full">
      <div
        class="absolute inset-0 bg-background/80 backdrop-blur-xl -z-10 mask-[linear-gradient(to_bottom,black,transparent)]"
      />
      <div
        class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between"
      >
        <Button
          @click="router.go(-1)"
          variant="ghost"
          size="sm"
          class="text-muted-foreground"
        >
          <LucideArrowLeft class="w-4 h-4" />
          Tillbaka
        </Button>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <LogoIcon class="w-7 h-7" />
          <span class="font-medium tracking-tighter text-lg font-logo"
            >LiU Tentor</span
          >
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
      <slot />
    </main>
  </div>
</template>
