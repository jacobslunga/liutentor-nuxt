<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  isLoading: boolean;
  giveDirectAnswer: boolean;
  selectedModelId: string;
  showScrollButton: boolean;
  courseCode?: string;
  hasSolution?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "send": [];
  "cancel": [];
  "scrollToBottom": [];
  "update:giveDirectAnswer": [value: boolean];
  "update:selectedModelId": [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const currentRows = ref(1);
const MAX_LENGTH = 4000;

const updateHeight = () => {
  const el = textareaRef.value;
  if (!el) return;

  const style = getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight) || 24;
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;

  // scrollHeight includes vertical padding, so subtract it to estimate text rows.
  const contentHeight = Math.max(
    0,
    el.scrollHeight - paddingTop - paddingBottom,
  );
  currentRows.value = Math.max(1, Math.ceil(contentHeight / lineHeight));
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
      class="pointer-events-none absolute inset-x-0 -top-10 -bottom-25 -z-10 bg-linear-to-t from-background via-background to-transparent"
    />

    <div class="max-w-2xl mx-auto relative">
      <Transition name="fade-up">
        <div
          v-if="showScrollButton"
          class="absolute -top-12 right-0 -translate-x-1/2 z-20"
        >
          <Button
            variant="outline"
            size="icon"
            class="rounded-full shadow-md bg-background"
            @click="emit('scrollToBottom')"
          >
            <LucideChevronDown class="w-5 h-5" />
          </Button>
        </div>
      </Transition>

      <div
        class="relative border border-border bg-background rounded-3xl focus-within:border-foreground/30 transition-colors duration-200"
      >
        <textarea
          ref="textareaRef"
          :value="modelValue"
          rows="1"
          placeholder="Fråga om tentan..."
          class="chat-textarea w-full bg-transparent outline-none border-0 focus:ring-0 resize-none block pl-5 pr-12 py-2.75 text-sm leading-relaxed max-h-50 custom-scrollbar"
          @input="handleInput"
          @keydown="handleKeyDown"
        />

        <div class="absolute bottom-1.5 right-1.5">
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

      <div class="flex justify-between items-center mt-2 px-3">
        <p class="text-[10px] text-muted-foreground/60">AI kan göra misstag.</p>
        <p
          v-if="modelValue.length > MAX_LENGTH * 0.8"
          class="text-[10px]"
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
</template>

<style scoped>
.chat-textarea {
  transition: height 0.15s ease-out;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
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

textarea::placeholder {
  color: hsl(var(--muted-foreground));
  opacity: 0.6;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 10px;
}
</style>
