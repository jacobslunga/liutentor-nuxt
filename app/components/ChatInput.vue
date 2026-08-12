<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
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

const props = withDefaults(
  defineProps<{

    initialText?: string;
    isLoading: boolean;
    giveDirectAnswer: boolean;
    selectedModelId: string;
    showScrollButton: boolean;
    courseCode?: string;
    hasSolution?: boolean;
    selectionContext?: string;

    autofocus?: boolean;

    submitOnEnter?: boolean;

    compact?: boolean;

    autoResize?: boolean;

    reactiveInput?: boolean;
  }>(),
  {
    autofocus: true,
    submitOnEnter: true,
    compact: false,
    autoResize: true,
    reactiveInput: true,
  },
);

const emit = defineEmits<{
  send: [];
  cancel: [];
  scrollToBottom: [];
  "update:giveDirectAnswer": [value: boolean];
  "update:selectedModelId": [value: string];
  clearSelectionContext: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const rowRef = ref<HTMLElement | null>(null);
const modeRef = ref<HTMLElement | null>(null);
const controlsRef = ref<HTMLElement | null>(null);
const text = ref(props.initialText ?? "");
const MAX_LENGTH = 4000;
const nonReactiveCanSend = ref(
  !!props.initialText?.trim() && props.initialText.length <= MAX_LENGTH,
);

const singleLineHeight = ref(0);
const isMultiline = ref(false);

const canSend = computed(
  () =>
    props.reactiveInput
      ? !!text.value.trim() && text.value.length <= MAX_LENGTH
      : nonReactiveCanSend.value,
);

const selectedModelLabel = computed(
  () =>
    CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.label ??
    CHAT_MODELS[0].label,
);

const answerModeLabel = computed(
  () =>
    ANSWER_MODES.find((m) => m.value === props.giveDirectAnswer)?.label ??
    ANSWER_MODES[0].label,
);

const oneRowWidth = () => {
  const row = rowRef.value;
  const controls = controlsRef.value;
  if (!row || !controls) return 0;

  const mode = modeRef.value;

  const style = getComputedStyle(row);
  const gap = parseFloat(style.columnGap) || 0;
  const inner =
    row.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  return (
    inner -
    (mode?.offsetWidth ?? 0) -
    controls.offsetWidth -
    gap * (mode ? 2 : 1)
  );
};

const applyHeight = (allowShrink = false) => {
  const el = textareaRef.value;
  if (!el) return;

  if (allowShrink) el.style.height = "auto";

  const scrollHeight = el.scrollHeight;
  const nextHeight = Math.min(scrollHeight, 180);
  const height = `${nextHeight}px`;
  const overflowY = scrollHeight > 180 ? "auto" : "hidden";

  if (el.style.height !== height) el.style.height = height;
  if (el.style.overflowY !== overflowY) el.style.overflowY = overflowY;
};

const recalculateLayout = () => {
  const el = textareaRef.value;
  if (!el) return;

  const was = isMultiline.value;
  const width = oneRowWidth();
  if (width > 0) {
    el.style.flex = `0 0 ${width}px`;
    el.style.height = "auto";
    isMultiline.value = el.scrollHeight > singleLineHeight.value + 4;
    el.style.flex = "";
  }

  if (isMultiline.value === was) {
    applyHeight(true);
    return;
  }

  nextTick(() => {
    const previous = el.style.transition;
    el.style.transition = "none";
    applyHeight(true);
    // Force reflow so restoring the transition cannot animate this resize.
    void el.offsetHeight;
    el.style.transition = previous;
  });
};

const updateHeight = (event?: Event) => {
  if (!props.autoResize) return;

  const el = textareaRef.value;
  if (!el) return;

  const inputType = event instanceof InputEvent ? event.inputType : "";

  // Deletion can make a multiline textarea fit on one row again, so it needs
  // the more expensive width probe. Insertions only need a single scrollHeight
  // read and should not force the surrounding mobile sheet to reflow.
  if (!event) {
    recalculateLayout();
    return;
  }

  if (inputType.startsWith("delete")) {
    if (isMultiline.value) recalculateLayout();
    return;
  }

  if (!isMultiline.value) {
    if (el.scrollHeight <= singleLineHeight.value + 4) return;
    isMultiline.value = true;
    nextTick(() => applyHeight(true));
    return;
  }

  applyHeight();
};

const handleInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;

  if (props.reactiveInput) {
    text.value = value;
    updateHeight(event);
    return;
  }

  // Keep rapid mobile typing out of Vue's render cycle. In this mode the DOM
  // owns the textarea value; reactive state only changes when sendability does.
  const nextCanSend = !!value.trim() && value.length <= MAX_LENGTH;
  if (nonReactiveCanSend.value !== nextCanSend) {
    nonReactiveCanSend.value = nextCanSend;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.submitOnEnter) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (canSend.value && !props.isLoading) emit("send");
  }
};

function setText(value: string) {
  if (props.reactiveInput) text.value = value;
  if (textareaRef.value) textareaRef.value.value = value;
  nonReactiveCanSend.value = !!value.trim() && value.length <= MAX_LENGTH;
  if (props.autoResize) nextTick(recalculateLayout);
}

onMounted(() => {
  const el = textareaRef.value;
  if (el && props.autoResize) {

    const draft = el.value;
    el.value = "";
    el.style.height = "auto";
    singleLineHeight.value = el.scrollHeight;
    el.value = draft;
  }
  if (props.autoResize) recalculateLayout();
  if (props.autofocus) textareaRef.value?.focus();
});

useEventListener("resize", () => {
  if (props.autoResize) recalculateLayout();
});

defineExpose({
  focus: () => textareaRef.value?.focus(),
  getText: () => textareaRef.value?.value ?? text.value,
  setText,
});
</script>

<template>
  <div class="px-4 bg-transparent relative w-full pointer-events-auto z-10">

    <div class="max-w-2xl mx-auto relative">
      <Transition name="fade-up">
        <div v-if="showScrollButton" class="absolute -top-12 right-3 z-20">
          <Button variant="outline" size="icon" class="rounded-full" @click="emit('scrollToBottom')">
            <LucideArrowDown class="w-4 h-4" />
          </Button>
        </div>
      </Transition>

      <div class="space-y-2">

        <div class="chat-shell rounded-[28px] border border-border bg-background focus-within:border-border">

          <Transition name="context-chip">
            <div v-if="selectionContext" class="flex items-center gap-2 w-full border-b border-border/60 px-5 py-2.5">
              <LucideCornerUpLeft class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span class="flex-1 min-w-0 text-sm italic text-muted-foreground truncate">"{{ selectionContext }}"</span>
              <Button variant="ghost" size="icon-xs" class="shrink-0" @click.prevent="emit('clearSelectionContext')">
                <LucideX class="w-3.5 h-3.5" />
              </Button>
            </div>
          </Transition>

          <div ref="rowRef" class="flex flex-wrap items-center gap-1.5 px-2.5 py-2.5">
            <div v-if="!compact" ref="modeRef" class="shrink-0" :class="isMultiline ? 'order-2' : 'order-1'">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" :aria-label="answerModeLabel"
                    class="size-8 rounded-full text-muted-foreground hover:text-foreground">
                    <LucideZap v-if="giveDirectAnswer" class="w-4 h-4" />
                    <LucideLightbulb v-else class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" class="w-60">
                  <DropdownMenuItem v-for="mode in ANSWER_MODES" :key="String(mode.value)"
                    class="cursor-pointer items-start justify-between gap-2"
                    @click="emit('update:giveDirectAnswer', mode.value)">
                    <div class="flex items-start gap-2">
                      <LucideZap v-if="mode.value" class="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <LucideLightbulb v-else class="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <div class="flex flex-col gap-0.5">
                        <span class="text-sm font-medium">{{ mode.label }}</span>
                        <span class="text-2xs text-muted-foreground">{{ mode.description }}</span>
                      </div>
                    </div>
                    <LucideCheck v-if="mode.value === giveDirectAnswer" class="w-4 h-4 shrink-0 text-primary" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <textarea ref="textareaRef" :value="text" rows="1" placeholder="Fråga vad som helst"
              class="chat-textarea min-w-0 resize-none border-0 bg-transparent px-2 py-1 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45"
              :class="isMultiline ? 'order-1 basis-full' : 'order-2 flex-1'" @input="handleInput"
              @keydown="handleKeyDown" />

            <div ref="controlsRef" class="order-3 flex shrink-0 items-center gap-1.5" :class="{ 'ml-auto': isMultiline }">
              <DropdownMenu v-if="!compact">
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm"
                    class="gap-1.5 px-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                    {{ selectedModelLabel }}
                    <LucideChevronDown class="w-3.5 h-3.5 text-muted-foreground/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuLabel
                    class="flex items-center gap-1.5 text-2xs font-semibold text-muted-foreground/70 px-2 py-1">
                    Gemini
                  </DropdownMenuLabel>
                  <DropdownMenuItem v-for="model in CHAT_MODELS" :key="model.id"
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
                <Button v-else key="send" size="icon" class="size-8 rounded-full" :disabled="!canSend"
                  @click="emit('send')">
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
          <p v-if="reactiveInput && text.length > MAX_LENGTH * 0.8" class="text-xs" :class="text.length > MAX_LENGTH
            ? 'text-destructive font-bold'
            : 'text-muted-foreground'
            ">
            {{ text.length }} / {{ MAX_LENGTH }}
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

.chat-shell {
  transition: border-color var(--duration-fast) ease;
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
