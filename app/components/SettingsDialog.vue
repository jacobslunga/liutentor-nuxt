<script setup lang="ts">
withDefaults(defineProps<{ hideTrigger?: boolean }>(), { hideTrigger: false });

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger v-if="!hideTrigger" as-child>
      <Button variant="ghost" size="icon-sm" aria-label="Inställningar">
        <LucideSettings />
      </Button>
    </DialogTrigger>

    <DialogContent class="custom-scrollbar max-h-[80vh] max-w-md overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Inställningar</DialogTitle>
        <DialogDescription>Anpassa hur LiU Tentor beter sig.</DialogDescription>
      </DialogHeader>

      <SettingsDialogContent />
    </DialogContent>
  </Dialog>
</template>
