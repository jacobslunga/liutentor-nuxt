<script setup lang="ts">
const { latest } = useRecentSearches();
</script>

<template>
  <div
    v-if="latest.length > 0"
    class="flex items-center gap-2 text-sm text-muted-foreground"
  >
    <template v-for="(s, i) in latest" :key="s.courseCode">
      <NuxtLink
        :to="`/search/${s.courseCode}`"
        class="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <span class="font-normal text-xs">{{ s.courseCode }}</span>
        <LucideArrowUpRight class="w-3 h-3" />
      </NuxtLink>
      <span v-if="i < latest.length - 1" class="text-border">|</span>
    </template>
  </div>
</template>
