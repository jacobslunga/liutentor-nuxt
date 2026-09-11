<script setup lang="ts">
const isMounted = useIsMounted();
const { latest } = useRecentSearches();
</script>

<template>
  <div v-if="isMounted && latest.length > 0" class="flex flex-wrap items-center justify-center gap-1.5">
    <UButton v-for="s in latest" :key="s.courseCode" :to="`/search/${s.courseCode}`" size="sm" color="neutral"
      variant="ghost">
      {{ s.courseCode }}
      <UIcon name="i-lucide-arrow-up-right" class="w-3.5 h-3.5 ml-1" />
    </UButton>
  </div>
</template>
