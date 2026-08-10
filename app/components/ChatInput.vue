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

const props = defineProps<{
  /**
   * Seed value only — read once, on mount. The draft deliberately lives here
   * rather than in the parent or the store: routing every keystroke through
   * either one re-rendered the whole chat panel per character.
   */
  initialText?: string;
  isLoading: boolean;
  giveDirectAnswer: boolean;
  selectedModelId: string;
  showScrollButton: boolean;
  courseCode?: string;
  hasSolution?: boolean;
  selectionContext?: string;
}>();

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

// Captured from the empty textarea's natural scrollHeight on mount, so we can
// tell "still one line" apart from "has wrapped" without hardcoding a px value
// that would drift if the font or padding changes.
const singleLineHeight = ref(0);
const isMultiline = ref(false);

const canSend = computed(
  () => !!text.value.trim() && text.value.length <= MAX_LENGTH,
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

/**
 * Width the textarea has when it shares the row with the buttons — the width
 * the wrap decision must always be taken at. Measuring at the two-row width
 * instead would let a line that just wrapped fit again the moment the layout
 * changed, and the two layouts would flip-flop on every keystroke.
 */
const oneRowWidth = () => {
  const row = rowRef.value;
  const mode = modeRef.value;
  const controls = controlsRef.value;
  if (!row || !mode || !controls) return 0;

  const style = getComputedStyle(row);
  const gap = parseFloat(style.columnGap) || 0;
  const inner =
    row.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  return inner - mode.offsetWidth - controls.offsetWidth - gap * 2;
};

const applyHeight = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
};

const updateHeight = () => {
  const el = textareaRef.value;
  if (!el) return;

  const was = isMultiline.value;
  const width = oneRowWidth();
  if (width > 0) {
    // Pin the one-row width just long enough to read the wrapped height back.
    // Nothing paints in between — the reflow is synchronous.
    el.style.flex = `0 0 ${width}px`;
    el.style.height = "auto";
    isMultiline.value = el.scrollHeight > singleLineHeight.value + 4;
    el.style.flex = "";
  }

  if (isMultiline.value === was) {
    applyHeight();
    return;
  }

  // The layout is switching. Measuring now would size the textarea against the
  // outgoing width for one frame, and the height transition would then animate
  // it while the box is also changing width — that pair is what flickers. Wait
  // for the new row (the classes land on the next tick, still before paint) and
  // resize without transitioning, so the switch lands in a single frame.
  nextTick(() => {
    const previous = el.style.transition;
    el.style.transition = "none";
    applyHeight();
    void el.offsetHeight; // flush, so restoring below can't animate this step
    el.style.transition = previous;
  });
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (canSend.value && !props.isLoading) emit("send");
  }
};

function setText(value: string) {
  text.value = value;
  nextTick(updateHeight);
}

onMounted(() => {
  const el = textareaRef.value;
  if (el) {
    // Measure a guaranteed-empty textarea so a multi-line initial draft
    // doesn't get mistaken for the single-line baseline.
    const draft = el.value;
    el.value = "";
    el.style.height = "auto";
    singleLineHeight.value = el.scrollHeight;
    el.value = draft;
  }
  updateHeight();
  textareaRef.value?.focus();
});

// A narrower row wraps sooner, so the one-row width has to be re-measured.
useEventListener("resize", updateHeight);

defineExpose({
  focus: () => textareaRef.value?.focus(),
  getText: () => text.value,
  setText,
});
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
        <!-- Fixed radius, exactly half the one-row height (56px): it reads as a
             full pill while collapsed and as a rounded box once it grows, with
             nothing to animate. Transitioning to `rounded-full` instead snaps —
             9999px clamps to half the height, so most of the sweep looks
             identical and the change all lands in the last few frames. -->
        <div class="chat-shell rounded-[28px] border border-border bg-background focus-within:border-border">
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

          <!-- One wrapping row: on a single line of text everything sits side by
               side; once the text wraps the textarea takes the full basis and
               pushes the two control groups onto a row of their own. The
               textarea's own padding must stay identical across both layouts —
               it feeds the height measurement that picks between them. -->
          <div ref="rowRef" class="flex flex-wrap items-center gap-1.5 px-2.5 py-2.5">
            <div ref="modeRef" class="shrink-0" :class="isMultiline ? 'order-2' : 'order-1'">
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

            <textarea ref="textareaRef" v-model="text" rows="1" placeholder="Fråga vad som helst"
              class="chat-textarea min-w-0 resize-none border-0 bg-transparent px-2 py-1 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45"
              :class="isMultiline ? 'order-1 basis-full' : 'order-2 flex-1'" @input="updateHeight"
              @keydown="handleKeyDown" />

            <div ref="controlsRef" class="order-3 flex shrink-0 items-center gap-1.5" :class="{ 'ml-auto': isMultiline }">
              <DropdownMenu>
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
          <p v-if="text.length > MAX_LENGTH * 0.8" class="text-xs" :class="text.length > MAX_LENGTH
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
