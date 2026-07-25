<script setup lang="ts">
const isMounted = useIsMounted();
const { latest } = useRecentSearches();
</script>

<template>
  <div
    v-if="isMounted && latest.length > 0"
    class="flex flex-wrap items-center justify-center gap-1.5"
  >
    <Button v-for="s in latest" :key="s.courseCode" as-child size="sm" variant="ghost">
      <NuxtLink :to="`/search/${s.courseCode}`">
        {{ s.courseCode }}
        <LucideArrowUpRight class="w-3.5 h-3.5 ml-1" />
      </NuxtLink>
    </Button>
  </div>
</template>
