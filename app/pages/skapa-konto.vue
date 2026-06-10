<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Skapa konto",
  description: "Skapa ett konto på LiU Tentor",
});

const router = useRouter();

onMounted(() => {
  router.replace("/logga-in?tab=skapa-konto");
});
</script>

<template>
  <div class="flex items-center justify-center">
    <LucideLoader2 class="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
</template>
