<script setup lang="ts">
const error = useError();
console.log(error);

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
  <div
    class="min-h-screen bg-background text-foreground flex items-center justify-center px-6"
  >
    <div class="w-full max-w-xl text-center space-y-5">
      <p class="text-xs font-mono text-muted-foreground">
        FEL {{ statusCode }}
      </p>
      <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
        {{ statusMessage }}
      </h1>
      <p class="text-sm text-muted-foreground max-w-md mx-auto">
        {{ message }}
      </p>

      <div class="flex items-center justify-center gap-3 pt-2">
        <Button @click="goHome">Till startsidan</Button>
        <Button variant="outline" @click="retry">Försök igen</Button>
      </div>
    </div>
  </div>
</template>
