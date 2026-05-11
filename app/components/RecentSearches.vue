<script setup lang="ts">
const { latest } = useRecentSearches();
</script>

<template>
  <div v-if="latest.length > 0" class="flex items-center gap-1.5">
    <Button
      v-for="s in latest"
      :key="s.courseCode"
      as-child
      size="sm"
      variant="ghost"
    >
      <NuxtLink :to="`/search/${s.courseCode}`">
        {{ s.courseCode }}
        <LucideArrowUpRight class="w-3 h-3" />
      </NuxtLink>
    </Button>
  </div>
</template>
