<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <LucideSettings class="w-4.5 h-4.5" />
      </Button>
    </DialogTrigger>
    <DialogContent
      class="w-[95vw] max-w-125 max-h-[90vh] overflow-y-auto rounded-xl"
    >
      <DialogHeader>
        <DialogTitle class="text-2xl">Inställningar</DialogTitle>
        <DialogDescription>Anpassa din upplevelse</DialogDescription>
      </DialogHeader>
      <SettingsDialogContent />
    </DialogContent>
  </Dialog>
</template>
