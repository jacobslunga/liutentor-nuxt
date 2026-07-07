<script setup lang="ts">
definePageMeta({ layout: "info" });

useSeoMeta({
  title: "Ladda upp tenta",
  description: "Ladda upp gamla tentor och facit till LiU Tentor.",
  robots: "index, follow",
});
</script>

<template>
    <ExamUploadForm />
</template>
