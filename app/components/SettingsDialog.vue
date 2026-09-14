<script setup lang="ts">
withDefaults(defineProps<{ hideTrigger?: boolean }>(), { hideTrigger: false });

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <UModal
    v-model:open="open"
    title="Inställningar"
    description="Anpassa hur LiU Tentor beter sig."
    :ui="{
      content: 'sm:max-h-[calc(100dvh-8rem)]',
      wrapper: 'flex flex-col gap-0.5',
      description: '!mt-0',
      body: 'min-h-0 overflow-y-auto px-4 py-4 sm:px-6',
    }"
  >
    <template v-if="!hideTrigger" #default>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-settings"
        aria-label="Inställningar"
      />
    </template>

    <template #body>
      <SettingsDialogContent />
    </template>
  </UModal>
</template>
