<script setup lang="ts">
interface Model {
  id: string;
  name: string;
  logoLight: string;
  logoDark: string;
}

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

const colorMode = useColorMode();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isMultiline = ref(false);
const MAX_LENGTH = 4000;

const models: Model[] = [
  {
    id: "gemini-3.1-flash-lite-preview",
    name: "Gemini",
    logoLight: "/images/llm-logos/gemini.svg",
    logoDark: "/images/llm-logos/gemini.svg",
  },
];

function modelLogo(m: Model) {
  return colorMode.value === "dark" ? m.logoDark : m.logoLight;
}

const selectedModel = computed(
  () => models.find((m) => m.id === props.selectedModelId) ?? models[0]!,
);

const updateHeight = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  const newHeight = Math.min(el.scrollHeight, 200);
  el.style.height = `${newHeight}px`;
  isMultiline.value = newHeight > 44;
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
          class="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
        >
          <Button
            variant="outline"
            size="icon"
            class="rounded-full shadow-md bg-background"
            @click="emit('scrollToBottom')"
          >
            <LucideArrowDown class="w-5 h-5" />
          </Button>
        </div>
      </Transition>

      <div
        class="relative border border-border bg-background transition-all duration-200 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/10 rounded-3xl"
      >
        <textarea
          ref="textareaRef"
          :value="modelValue"
          rows="1"
          placeholder="Fråga om tentan..."
          class="w-full bg-transparent outline-none border-0 focus:ring-0 resize-none px-4 pt-3 pb-1 text-sm leading-relaxed max-h-50 custom-scrollbar"
          @input="handleInput"
          @keydown="handleKeyDown"
        />

        <div class="flex items-center justify-between px-3 py-2">
          <div
            class="flex items-center gap-1 h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground shrink-0"
          >
            {{ selectedModel.name }}
          </div>

          <Transition name="scale" mode="out-in">
            <Button
              v-if="isLoading"
              key="stop"
              size="icon"
              variant="secondary"
              class="size-8 shrink-0"
              @click="emit('cancel')"
            >
              <LucideSquare class="size-3.5 fill-current" />
            </Button>
            <Button
              v-else
              key="send"
              size="icon"
              class="size-8 shrink-0"
              :disabled="!modelValue.trim() || modelValue.length > MAX_LENGTH"
              @click="emit('send')"
            >
              <LucideArrowUp />
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
