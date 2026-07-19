<template>
  <div class="shrink-0 relative flex items-center justify-between px-3 py-2 z-90 overflow-visible">
    <div class="flex items-center gap-1 min-w-0">
      <Button variant="ghost" size="icon-sm" @click="emit('close')">
        <LucideChevronRight />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="gap-1 px-2 text-sm font-medium">
            {{ selectedModelLabel }}
            <LucideChevronDown class="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-52">
          <DropdownMenuItem v-for="model in CHAT_MODELS" :key="model.id" class="cursor-pointer items-start gap-2"
            @click="emit('update:selectedModelId', model.id)">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">{{ model.label }}</p>
              <p class="text-xs text-muted-foreground">{{ model.description }}</p>
            </div>
            <LucideCheck v-if="model.id === selectedModelId" class="w-4 h-4 shrink-0 mt-0.5" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" @click="emit('newChat')">
        <LucidePlus class="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" @click="emit('openHistory')">
        <LucidePanelRight v-if="historyOpen" class="w-4 h-4" />
        <LucidePanelRight v-else class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CHAT_MODELS } from "@/composables/useSelectedModel";

const props = defineProps<{
  hasSolution: boolean;
  title: string;
  historyOpen: boolean;
  selectedModelId: string;
}>();
const displayTitle = computed(() => props.title?.trim() || "Ny chatt");
const selectedModelLabel = computed(
  () =>
    CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.label ??
    CHAT_MODELS[0].label,
);
const emit = defineEmits<{
  close: [];
  openHistory: [];
  newChat: [];
  "update:selectedModelId": [value: string];
}>();
</script>
