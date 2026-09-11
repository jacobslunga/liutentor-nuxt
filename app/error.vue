<script setup lang="ts">
const error = useError();

const statusCode = computed(() => error.value?.statusCode ?? 500);
const statusMessage = computed(
  () => error.value?.statusText ?? "Något gick fel",
);
const message = computed(
  () => error.value?.message ?? "Sidan kunde inte visas.",
);

useSeoMeta({
  title: computed(() =>
    statusCode.value === 404 ? "404 - Sidan hittades inte" : "Ett fel uppstod",
  ),
  description: computed(() =>
    statusCode.value === 404
      ? "Sidan du letar efter finns inte."
      : "Ett oväntat fel uppstod i applikationen.",
  ),
  robots: "noindex, nofollow",
});

const goHome = () => clearError({ redirect: "/" });
const retry = () => clearError();
</script>

<template>
  <div class="min-h-screen bg-default text-highlighted flex items-center justify-center px-6">
    <div class="w-full max-w-xl text-center space-y-5">
      <p class="text-xs font-mono text-muted">
        FEL {{ statusCode }}
      </p>
      <h1 class="text-3xl md:text-4xl font-medium">
        {{ statusMessage }}
      </h1>
      <p class="text-sm text-muted max-w-md mx-auto">
        {{ message }}
      </p>

      <div class="flex items-center justify-center gap-3 pt-2">
        <UButton @click="goHome">Till startsidan</UButton>
        <UButton color="neutral" variant="outline" @click="retry">Försök igen</UButton>
      </div>
    </div>
  </div>
</template>
