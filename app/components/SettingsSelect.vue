<script setup lang="ts">
/** Ett val i inställningarna: shadcns dropdown med en radiogrupp inuti. */
defineProps<{
  options: readonly { value: string; label: string; hint?: string }[];
  contentClass?: string;
}>();

const model = defineModel<string>({ required: true });

function select(value: unknown) {
  if (typeof value === "string") model.value = value;
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="gap-1.5">
        <slot name="icon" />
        {{ options.find((o) => o.value === model)?.label ?? "" }}
        <LucideChevronDown class="size-3.5 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" :class="contentClass ?? 'w-48'">
      <DropdownMenuRadioGroup :model-value="model" @update:model-value="select">
        <DropdownMenuRadioItem v-for="option in options" :key="option.value" :value="option.value"
          class="cursor-pointer" :class="option.hint ? 'items-start' : ''">
          <span class="flex min-w-0 flex-col gap-0.5">
            <span class="text-sm">{{ option.label }}</span>
            <span v-if="option.hint" class="text-2xs leading-snug text-muted-foreground">
              {{ option.hint }}
            </span>
          </span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
