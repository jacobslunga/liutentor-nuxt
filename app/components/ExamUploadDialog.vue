<script setup lang="ts">
const { isOpen, prefilledCourseCode } = useUploadModal();
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Ladda upp tenta eller facit"
    description="Hjälp andra studenter på Linköpings Universitet genom att dela gamla tentor och lösningar."
  >
    <template #body>
      <ExamUploadForm
        :key="prefilledCourseCode"
        :initial-course-code="prefilledCourseCode"
        :fixed-course-code="!!prefilledCourseCode"
        :show-heading="false"
      />
    </template>
  </UModal>
</template>
