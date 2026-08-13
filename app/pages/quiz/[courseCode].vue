<script setup lang="ts">
// The quiz now lives as a tab on the course page. Keep this route as a
// permanent redirect so existing links and bookmarks still resolve.
const route = useRoute();
const courseCode = computed(() => (route.params.courseCode as string) ?? "");

await navigateTo(
  { path: `/search/${courseCode.value}`, query: { tab: "quiz" } },
  { redirectCode: 301, replace: true },
);
</script>

<template>
  <div />
</template>
