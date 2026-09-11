<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

/** Ett val i inställningarna: Nuxt UI:s dropdown med en kryssgrupp inuti. */
const props = defineProps<{
  options: readonly { value: string; label: string; hint?: string }[];
}>();

const model = defineModel<string>({ required: true });

// Dropdownen har ingen radiovariant, så kryssposter används i stället — bara
// en åt gången är markerad eftersom valet speglar modellen.
const items = computed<DropdownMenuItem[]>(() =>
  props.options.map((option) => ({
    label: option.label,
    description: option.hint,
    type: "checkbox",
    checked: model.value === option.value,
    onUpdateChecked: (checked: boolean) => {
      if (checked) model.value = option.value;
    },
    onSelect: (event: Event) => event.preventDefault(),
  })),
);

const activeLabel = computed(
  () => props.options.find((o) => o.value === model.value)?.label ?? "",
);
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }">
    <UButton
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-chevron-down"
      :label="activeLabel"
    >
      <template v-if="$slots.icon" #leading>
        <slot name="icon" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
