<script setup lang="ts">
const { latest } = useRecentSearches();
</script>

<template>
  <div v-if="latest.length > 0" class="flex items-center gap-1.5">
    <NuxtLink
      v-for="s in latest"
      :key="s.courseCode"
      :to="`/search/${s.courseCode}`"
      class="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150"
    >
      {{ s.courseCode }}
      <LucideArrowUpRight class="w-3 h-3" />
    </NuxtLink>
  </div>
</template>
