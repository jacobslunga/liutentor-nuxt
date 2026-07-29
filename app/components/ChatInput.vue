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

const googleModels = computed(() =>
  CHAT_MODELS.filter((m) => m.provider === "Google"),
);

const anthropicModels = computed(() =>
  CHAT_MODELS.filter((m) => m.provider === "Anthropic"),
);

const selectedModelLabel = computed(
  () =>
    CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.label ??
    CHAT_MODELS[0].label,
);

const selectedModelProvider = computed(
  () => CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.provider,
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

// handleInput already resizes synchronously, so reacting to the same keystroke
// here would measure the textarea twice per character — and `height: auto` +
// scrollHeight forces a layout each time. Only programmatic changes (send
// clears the draft, cancel restores it) need this.
watch(
  () => props.modelValue,
  (value) => {
    if (value === textareaRef.value?.value) return;
    nextTick(updateHeight);
  },
);

onMounted(() => {
  updateHeight();
  textareaRef.value?.focus();
});

defineExpose({ focus: () => textareaRef.value?.focus() });
</script>

<template>
  <div class="px-4 bg-transparent relative w-full pointer-events-auto z-10">
    <!-- No backdrop of its own: the input container is already opaque, and any
         solid block here would put a hard top edge across the scrolling text.
         The single fade lives on the parent's backdrop layer in ChatWindow. -->
    <div class="max-w-2xl mx-auto relative">
      <Transition name="fade-up">
        <div v-if="showScrollButton" class="absolute -top-12 right-3 z-20">
          <Button variant="outline" size="icon" class="rounded-full" @click="emit('scrollToBottom')">
            <LucideArrowDown class="w-4 h-4" />
          </Button>
        </div>
      </Transition>

      <div class="space-y-2">
        <div
          class="rounded-3xl border border-border bg-background transition-colors duration-150 focus-within:border-border">
          <!-- Selection context chip -->
          <Transition name="context-chip">
            <div v-if="selectionContext" class="flex items-center gap-2 w-full border-b border-border/60 px-5 py-2.5">
              <LucideCornerUpLeft class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span class="flex-1 min-w-0 text-sm italic text-muted-foreground truncate">"{{ selectionContext }}"</span>
              <Button variant="ghost" size="icon-xs" class="shrink-0" @click.prevent="emit('clearSelectionContext')">
                <LucideX class="w-3.5 h-3.5" />
              </Button>
            </div>
          </Transition>

          <textarea ref="textareaRef" :value="modelValue" rows="1" placeholder="Fråga vad som helst"
            class="chat-textarea block w-full min-h-11 resize-none border-0 bg-transparent px-5 pt-4 pb-1 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45"
            @input="handleInput" @keydown="handleKeyDown" />

          <div class="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <TooltipProvider>
              <Tabs :model-value="giveDirectAnswer ? 'direct' : 'hint'"
                @update:model-value="(v) => emit('update:giveDirectAnswer', v === 'direct')">
                <TabsList class="h-8">
                  <Tooltip v-for="mode in ANSWER_MODES" :key="String(mode.value)">
                    <TooltipTrigger as-child>
                      <TabsTrigger :value="mode.value ? 'direct' : 'hint'" class="h-full px-2.5">
                        <LucideBrain v-if="mode.value" class="w-4 h-4" />
                        <LucideLightbulb v-else class="w-4 h-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p class="font-medium">{{ mode.label }}</p>
                      <p class="text-2xs opacity-80">{{ mode.description }}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
              </Tabs>
            </TooltipProvider>

            <div class="flex shrink-0 items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm"
                    class="gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <img v-if="selectedModelProvider === 'Google'" src="/images/llm-logos/google.svg" alt="Google"
                      class="w-3.5 h-3.5 shrink-0" />
                    <template v-else-if="selectedModelProvider === 'Anthropic'">
                      <img src="/images/llm-logos/anthropic-black.svg" alt="Anthropic"
                        class="w-3.5 h-3.5 shrink-0 dark:hidden" />
                      <img src="/images/llm-logos/anthropic-white.svg" alt="Anthropic"
                        class="w-3.5 h-3.5 shrink-0 hidden dark:block" />
                    </template>
                    {{ selectedModelLabel }}
                    <LucideChevronDown class="w-3.5 h-3.5 text-muted-foreground/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuLabel
                    class="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground/70 px-2 py-1">
                    <img src="/images/llm-logos/google.svg" alt="Google" class="w-3.5 h-3.5 shrink-0" />
                    Gemini
                  </DropdownMenuLabel>
                  <DropdownMenuItem v-for="model in googleModels" :key="model.id"
                    class="cursor-pointer items-center justify-between gap-2"
                    @click="emit('update:selectedModelId', model.id)">
                    <span class="text-sm font-medium">{{ model.label }}</span>
                    <LucideCheck v-if="model.id === selectedModelId" class="w-4 h-4 shrink-0 text-primary" />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel
                    class="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground/70 px-2 py-1">
                    <img src="/images/llm-logos/anthropic-black.svg" alt="Anthropic"
                      class="w-3.5 h-3.5 shrink-0 dark:hidden" />
                    <img src="/images/llm-logos/anthropic-white.svg" alt="Anthropic"
                      class="w-3.5 h-3.5 shrink-0 hidden dark:block" />
                    Anthropic
                  </DropdownMenuLabel>
                  <DropdownMenuItem v-for="model in anthropicModels" :key="model.id"
                    class="cursor-pointer items-center justify-between gap-2"
                    @click="emit('update:selectedModelId', model.id)">
                    <span class="text-sm font-medium">{{ model.label }}</span>
                    <LucideCheck v-if="model.id === selectedModelId" class="w-4 h-4 shrink-0 text-primary" />
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
          <p class="text-2xs text-muted-foreground/60">
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
  transition: height var(--duration-fast) var(--ease-spring);
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
  transition: all var(--duration-base) var(--ease-spring);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all var(--duration-fast) var(--ease-spring);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.context-chip-enter-active,
.context-chip-leave-active {
  transition: all var(--duration-fast) var(--ease-spring);
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
