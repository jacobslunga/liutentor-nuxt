<script setup lang="ts">
withDefaults(defineProps<{ hideTrigger?: boolean }>(), { hideTrigger: false });

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <UModal
    v-model:open="open"
    title="Inställningar"
    description="Anpassa hur LiU Tentor beter sig."
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
