<script setup lang="ts">
import { CHAT_MODELS } from "@/composables/useSelectedModel";

const ANSWER_MODES = [
  {
    value: true,
    label: "Fullständigt svar",
    description: "Ger fullständiga lösningar direkt",
  },
  {
    value: false,
    label: "Ledtrådar",
    description: "Guidar med frågor och tips.",
  },
] as const;

const props = defineProps<{
  modelValue: string;
  isLoading: boolean;
  giveDirectAnswer: boolean;
  selectedModelId: string;
  showScrollButton: boolean;
  courseCode?: string;
  hasSolution?: boolean;
  selectionContext?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  send: [];
  cancel: [];
  scrollToBottom: [];
  "update:giveDirectAnswer": [value: boolean];
  "update:selectedModelId": [value: string];
  clearSelectionContext: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const MAX_LENGTH = 4000;

const selectedModeLabel = computed(
  () =>
    ANSWER_MODES.find((m) => m.value === props.giveDirectAnswer)?.label ??
    ANSWER_MODES[0].label,
);
const selectedModelLabel = computed(
  () =>
    CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.label ??
    CHAT_MODELS[0].label,
);

const updateHeight = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  const nextHeight = Math.min(el.scrollHeight, 180);
  el.style.height = `${nextHeight}px`;
  el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  updateHeight();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (
      props.modelValue.trim() &&
      !props.isLoading &&
      props.modelValue.length <= MAX_LENGTH
    ) {
      emit("send");
    }
  }
};

onMounted(() => {
  updateHeight();
  textareaRef.value?.focus();
});

defineExpose({ focus: () => textareaRef.value?.focus() });
</script>

<template>
  <div class="px-4 bg-transparent relative w-full pointer-events-auto z-10">
    <div class="pointer-events-none absolute inset-x-0 -bottom-20 h-40 -z-10 bg-background" />
    <div class="max-w-2xl mx-auto relative">
      <Transition name="fade-up">
        <div v-if="showScrollButton" class="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
          <Button variant="outline" size="icon" class="rounded-full bg-background/60 backdrop-blur-sm"
            @click="emit('scrollToBottom')">
            <LucideArrowDown class="w-4 h-4" />
          </Button>
        </div>
      </Transition>

      <div class="space-y-2">
        <div
          class="rounded-3xl border border-border bg-background transition-colors duration-150 focus-within:border-border/80">
          <!-- Selection context chip -->
          <Transition name="context-chip">
            <div v-if="selectionContext" class="flex items-center gap-2 w-full border-b border-border/70 px-5 py-2.5">
              <LucideCornerUpLeft class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span class="flex-1 min-w-0 text-sm italic text-muted-foreground truncate">"{{ selectionContext }}"</span>
              <Button variant="ghost" size="icon-xs" class="shrink-0" @click.prevent="emit('clearSelectionContext')">
                <LucideX class="w-3.5 h-3.5" />
              </Button>
            </div>
          </Transition>

          <textarea ref="textareaRef" :value="modelValue" rows="1" placeholder="Fråga vad som helst"
            class="chat-textarea block w-full min-h-11 resize-none border-0 bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45"
            @input="handleInput" @keydown="handleKeyDown" />

          <div class="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm"
                  class="gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <LucideBrain v-if="giveDirectAnswer" class="w-3.5 h-3.5" />
                  <LucideLightbulb v-else class="w-3.5 h-3.5" />
                  {{ selectedModeLabel }}
                  <LucideChevronDown class="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" class="w-64">
                <DropdownMenuItem v-for="mode in ANSWER_MODES" :key="String(mode.value)"
                  class="cursor-pointer items-start gap-2" @click="emit('update:giveDirectAnswer', mode.value)">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium">{{ mode.label }}</p>
                    <p class="text-xs text-muted-foreground">{{ mode.description }}</p>
                  </div>
                  <LucideCheck v-if="mode.value === giveDirectAnswer" class="w-4 h-4 shrink-0 mt-0.5" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div class="flex shrink-0 items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm"
                    class="gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    {{ selectedModelLabel }}
                    <LucideChevronDown class="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-52">
                  <DropdownMenuItem v-for="model in CHAT_MODELS" :key="model.id"
                    class="cursor-pointer items-start gap-2" @click="emit('update:selectedModelId', model.id)">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium">{{ model.label }}</p>
                      <p class="text-xs text-muted-foreground">{{ model.description }}</p>
                    </div>
                    <LucideCheck v-if="model.id === selectedModelId" class="w-4 h-4 shrink-0 mt-0.5" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Transition name="scale" mode="out-in">
                <Button v-if="isLoading" key="stop" size="icon" variant="secondary" class="size-8 rounded-full"
                  @click="emit('cancel')">
                  <LucideSquare class="size-3.5 fill-current" />
                </Button>
                <Button v-else key="send" size="icon" class="size-8" :disabled="!modelValue.trim() || modelValue.length > MAX_LENGTH
                  " @click="emit('send')">
                  <LucideArrowUp class="size-4" />
                </Button>
              </Transition>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 px-4 text-center">
          <p class="text-[10px] text-muted-foreground/60">
            AI kan göra misstag. Kontrollera viktig information.
          </p>
          <p v-if="modelValue.length > MAX_LENGTH * 0.8" class="text-xs" :class="modelValue.length > MAX_LENGTH
            ? 'text-destructive font-bold'
            : 'text-muted-foreground'
            ">
            {{ modelValue.length }} / {{ MAX_LENGTH }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  transition: height 0.15s var(--ease-spring);
}

.chat-textarea {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chat-textarea::-webkit-scrollbar {
  display: none;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s var(--ease-spring);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.15s var(--ease-spring);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.context-chip-enter-active,
.context-chip-leave-active {
  transition: all 0.15s var(--ease-spring);
  overflow: hidden;
}

.context-chip-enter-from,
.context-chip-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.context-chip-enter-to,
.context-chip-leave-from {
  opacity: 1;
  max-height: 48px;
}
</style>
