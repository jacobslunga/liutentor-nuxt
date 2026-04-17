<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <LucideSettings class="w-4.5 h-4.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-90 p-4 max-h-[80vh] overflow-y-auto">
      <div class="mb-4">
        <p class="text-base font-semibold">Inställningar</p>
        <p class="text-sm text-muted-foreground">Anpassa din upplevelse</p>
      </div>
      <SettingsDialogContent />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
