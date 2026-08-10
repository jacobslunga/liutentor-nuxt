<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const { isOpen, prefilledCourseCode } = useUploadModal();
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
      <DialogHeader class="mb-2">
        <DialogTitle class="text-2xl font-semibold text-foreground flex items-center gap-2">
          <LucideUpload class="size-6 text-primary" />
          Ladda upp tenta eller facit
        </DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          Hjälp andra studenter på Linköpings Universitet genom att dela gamla tentor och lösningar.
        </DialogDescription>
      </DialogHeader>

      <ExamUploadForm :key="prefilledCourseCode" :initial-course-code="prefilledCourseCode"
        :fixed-course-code="!!prefilledCourseCode" :show-heading="false" />
    </DialogContent>
  </Dialog>
</template>
