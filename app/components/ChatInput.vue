<script setup lang="ts">
import { useChatStore } from "@/stores/chat";

interface Model {
  id: string;
  name: string;
  logo?: string;
}

const props = defineProps<{
  modelValue: string;
  isLoading: boolean;
  giveDirectAnswer: boolean;
  selectedModelId: string;
  showScrollButton: boolean;
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
const isMultiline = ref(false);
const MAX_LENGTH = 4000;

const models: Model[] = [
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro" },
  { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (stable)" },
];

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
        class="relative border border-border bg-background dark:bg-secondary shadow-sm transition-all duration-200"
        :class="isMultiline ? 'rounded-2xl' : 'rounded-[28px]'"
      >
        <div class="flex flex-col w-full p-2">
          <textarea
            ref="textareaRef"
            :value="modelValue"
            placeholder="Fråga om tentan..."
            class="w-full bg-background dark:bg-secondary outline-none border-0 focus:ring-0 resize-none px-3 pt-2 pb-1 text-sm leading-relaxed min-h-10 max-h-50 custom-scrollbar"
            rows="1"
            @input="handleInput"
            @keydown="handleKeyDown"
          />

          <div class="flex items-center justify-between px-2 pb-1 pt-1">
            <div class="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button
                    class="flex items-center gap-1 h-7 px-2 rounded-lg hover:bg-accent text-[11px] font-semibold text-muted-foreground transition-colors"
                    type="button"
                  >
                    {{ selectedModel.name }}
                    <LucideChevronDown class="w-5 h-5 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" class="w-56">
                  <DropdownMenuItem
                    v-for="m in models"
                    :key="m.id"
                    class="text-xs justify-between cursor-pointer"
                    @click="emit('update:selectedModelId', m.id)"
                  >
                    {{ m.name }}
                    <LucideCheck
                      v-if="m.id === selectedModelId"
                      class="w-5 h-5 text-primary"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider :delay-duration="0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      class="flex cursor-pointer items-center gap-1.5 px-2 h-7 rounded-lg border text-[11px] font-medium transition-all"
                      :class="
                        !giveDirectAnswer
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'border-dashed border-border text-muted-foreground hover:bg-accent'
                      "
                      @click="
                        emit('update:giveDirectAnswer', !giveDirectAnswer)
                      "
                    >
                      <LucideLightbulb
                        v-if="giveDirectAnswer"
                        class="w-4 h-4"
                      />
                      <LucideLightbulb v-else class="w-4 h-4" />
                      <span class="hidden sm:inline">Hints</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">
                    <p class="text-xs">
                      {{
                        !giveDirectAnswer
                          ? "Pedagogiska ledtrådar på"
                          : "Klicka för vägledning"
                      }}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div class="flex items-center">
              <Transition name="scale" mode="out-in">
                <Button
                  v-if="isLoading"
                  key="stop"
                  variant="outline"
                  size="icon"
                  class="size-8 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive border-none"
                  @click="emit('cancel')"
                >
                  <LucideSquare class="size-3.5 fill-current" />
                </Button>
                <Button
                  v-else
                  key="send"
                  size="icon"
                  class="size-8 rounded-full transition-transform active:scale-95"
                  :disabled="
                    !modelValue.trim() || modelValue.length > MAX_LENGTH
                  "
                  @click="emit('send')"
                >
                  <LucideArrowUp class="w-4 h-4" />
                </Button>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mt-2 px-3">
        <p class="text-[10px] text-muted-foreground/60">AI kan göra misstag.</p>
        <p class="text-[10px] text-muted-foreground/60">Drivs av Gemini</p>
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
  opacity: 0.7;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 10px;
}
</style>
