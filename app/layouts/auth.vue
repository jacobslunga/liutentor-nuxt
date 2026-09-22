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
  <div class="flex flex-col max-w-full min-h-dvh bg-default">
    <main class="grow flex items-start justify-center pt-20 pb-8 px-4 sm:pt-24 sm:px-8">
      <UButton
        @click="router.go(-1)"
        class="absolute top-5 left-5"
        color="neutral"
        variant="ghost"
        size="sm"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Tillbaka
      </UButton>
      <slot />
    </main>
  </div>
  <AppFooter />
</template>
