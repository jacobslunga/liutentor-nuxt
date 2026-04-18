<script setup lang="ts">
const user = useSupabaseUser();

const router = useRouter();

watch(
  user,
  () => {
    if (user.value) {
      navigateTo("/", { replace: true });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col max-w-full min-h-screen bg-background">
    <main class="grow flex items-start justify-center py-5 px-4">
      <Button
        @click="router.go(-1)"
        class="absolute top-5 left-5"
        variant="ghost"
        size="sm"
      >
        <LucideArrowLeft class="w-4 h-4" />
        Tillbaka
      </Button>
      <slot />
    </main>
  </div>
  <AppFooter />
</template>
