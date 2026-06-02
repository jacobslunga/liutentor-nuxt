<script setup lang="ts">
import { CHAT_MODELS } from "@/composables/useSelectedModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
const isMultiline = ref(false);

const currentModelLabel = computed(
  () =>
    CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.label ?? "Flash",
);

const updateHeight = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  isMultiline.value = el.scrollHeight > 42;
};

const inputRadiusClass = computed(() =>
  isMultiline.value || props.selectionContext ? "rounded-2xl" : "rounded-full",
);

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

watch(
  () => props.modelValue,
  (val) => {
    if (val === "") nextTick(updateHeight);
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
    <div
      class="pointer-events-none absolute inset-x-0 -top-20 -bottom-20 -z-10 bg-linear-to-t from-background via-background to-transparent"
    />
    <div class="max-w-2xl mx-auto relative">
      <Transition name="fade-up">
        <div
          v-if="showScrollButton"
          class="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
        >
          <Button variant="outline" size="icon" @click="emit('scrollToBottom')">
            <LucideArrowDown class="w-4 h-4" />
          </Button>
        </div>
      </Transition>

      <div class="space-y-2">
        <div
          class="border border-border bg-card/80 shadow-[0_10px_34px_color-mix(in_srgb,var(--foreground),transparent_92%)] dark:shadow-[0_10px_34px_color-mix(in_srgb,var(--background),transparent_92%)] backdrop-blur-sm transition-colors duration-150 focus-within:border-border focus-within:bg-card"
          :class="inputRadiusClass"
        >
          <!-- Selection context chip -->
          <Transition name="context-chip">
            <div
              v-if="selectionContext"
              class="flex items-center gap-2 w-full border-b border-border/70 px-5 py-2.5"
            >
              <LucideCornerUpLeft
                class="w-3.5 h-3.5 shrink-0 text-muted-foreground"
              />
              <span
                class="flex-1 min-w-0 text-sm italic text-muted-foreground truncate"
                >"{{ selectionContext }}"</span
              >
              <button
                class="shrink-0 cursor-pointer text-muted-foreground hover:opacity-60 transition-opacity"
                @click.prevent="emit('clearSelectionContext')"
              >
                <LucideX class="w-3.5 h-3.5" />
              </button>
            </div>
          </Transition>

          <div
            class="flex gap-2 px-5 py-3"
            :class="isMultiline || selectionContext ? 'items-end' : 'items-center'"
          >
            <!-- Textarea -->
            <textarea
              ref="textareaRef"
              :value="modelValue"
              rows="1"
              placeholder="Fråga vad som helst"
              class="min-h-8 flex-1 resize-none border-0 bg-transparent py-1 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45"
              @input="handleInput"
              @keydown="handleKeyDown"
            />

            <div class="flex shrink-0 items-center gap-1.5 pb-0.5">
              <!-- Model selector -->
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {{ currentModelLabel }}
                    <LucideChevronDown class="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="min-w-40">
                  <DropdownMenuRadioGroup
                    :model-value="selectedModelId"
                    @update:model-value="
                      (v) => v && emit('update:selectedModelId', v as string)
                    "
                  >
                    <DropdownMenuRadioItem
                      v-for="model in CHAT_MODELS"
                      :key="model.id"
                      :value="model.id"
                      class="text-sm"
                    >
                      {{ model.label }}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

            <!-- Send / Cancel -->
            <Transition name="scale" mode="out-in">
              <Button
                v-if="isLoading"
                key="stop"
                size="icon"
                variant="secondary"
                class="size-8 rounded-full"
                @click="emit('cancel')"
              >
                <LucideSquare class="size-3.5 fill-current" />
              </Button>
              <Button
                v-else
                key="send"
                size="icon"
                class="size-8 rounded-full"
                :disabled="!modelValue.trim() || modelValue.length > MAX_LENGTH"
                @click="emit('send')"
              >
                <LucideArrowUp class="size-4" />
              </Button>
              </Transition>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 px-4 text-center">
          <p class="text-xs text-muted-foreground/60">
            AI kan göra misstag. Kontrollera viktig information.
          </p>
          <p
            v-if="modelValue.length > MAX_LENGTH * 0.8"
            class="text-xs"
            :class="
              modelValue.length > MAX_LENGTH
                ? 'text-destructive font-bold'
                : 'text-muted-foreground'
            "
          >
            {{ modelValue.length }} / {{ MAX_LENGTH }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  transition: height 0.15s ease-out;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.context-chip-enter-active,
.context-chip-leave-active {
  transition: all 0.15s ease;
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
