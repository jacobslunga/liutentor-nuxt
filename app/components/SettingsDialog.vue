<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="ghost" size="icon">
        <LucideSettings class="w-4.5 h-4.5" />
      </Button>
    </DialogTrigger>
    <DialogContent class="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Inställningar</DialogTitle>
        <DialogDescription>Anpassa din upplevelse</DialogDescription>
      </DialogHeader>
      <SettingsDialogContent />
    </DialogContent>
  </Dialog>
</template>
