<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { CHAT_MODELS } from "@/composables/useSelectedModel";
import { useChatStore, type ChatAttachment } from "@/stores/chat";
import { toast } from "vue-sonner";

const MODEL_GROUPS = ["OpenAI", "Google"].map((provider) => ({
  provider,
  models: CHAT_MODELS.filter((model) => model.provider === provider),
}));

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENTS_TOTAL_SIZE = 20 * 1024 * 1024;
const ACCEPTED_MEDIA_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const EXTENSIONS_BY_MEDIA_TYPE: Record<string, string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
};
const FILE_INPUT_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.gif,application/pdf,image/jpeg,image/png,image/webp,image/gif";

const props = withDefaults(
  defineProps<{
    initialText?: string;
    initialAttachments?: ChatAttachment[];
    isLoading: boolean;
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
    initialAttachments: () => [],
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
  "update:selectedModelId": [value: string];
  clearSelectionContext: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const rowRef = ref<HTMLElement | null>(null);
const attachmentButtonRef = ref<HTMLElement | null>(null);
const controlsRef = ref<HTMLElement | null>(null);
const text = ref(props.initialText ?? "");
const pendingAttachments = ref<ChatAttachment[]>([...props.initialAttachments]);
const chatStore = useChatStore();
const MAX_LENGTH = 4000;
const nonReactiveCanSend = ref(
  !!props.initialText?.trim() && props.initialText.length <= MAX_LENGTH,
);
const nonReactiveTooLong = ref((props.initialText?.length ?? 0) > MAX_LENGTH);

const singleLineHeight = ref(0);
const isMultiline = ref(false);

const canSend = computed(() => {
  const hasContent = props.reactiveInput
    ? !!text.value.trim() || pendingAttachments.value.length > 0
    : nonReactiveCanSend.value || pendingAttachments.value.length > 0;
  const tooLong = props.reactiveInput
    ? text.value.length > MAX_LENGTH
    : nonReactiveTooLong.value;
  return hasContent && !tooLong;
});

const activeAttachments = computed(() => chatStore.getActiveAttachments());
const activeAttachmentBytes = computed(() =>
  activeAttachments.value.reduce((sum, attachment) => sum + attachment.size, 0),
);
const attachmentCapacityReached = computed(
  () =>
    activeAttachments.value.length + pendingAttachments.value.length >=
      MAX_ATTACHMENTS ||
    activeAttachmentBytes.value +
      pendingAttachments.value.reduce(
        (sum, attachment) => sum + attachment.size,
        0,
      ) >=
      MAX_ATTACHMENTS_TOTAL_SIZE,
);

const selectedModelLabel = computed(
  () =>
    CHAT_MODELS.find((m) => m.id === props.selectedModelId)?.label ??
    CHAT_MODELS[0].label,
);

const oneRowWidth = () => {
  const row = rowRef.value;
  const controls = controlsRef.value;
  if (!row || !controls) return 0;

  const attachmentButton = attachmentButtonRef.value;

  const style = getComputedStyle(row);
  const gap = parseFloat(style.columnGap) || 0;
  const inner =
    row.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  return (
    inner -
    (attachmentButton?.offsetWidth ?? 0) -
    controls.offsetWidth -
    gap * (attachmentButton ? 2 : 1)
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
  nonReactiveTooLong.value = value.length > MAX_LENGTH;
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
  nonReactiveTooLong.value = value.length > MAX_LENGTH;
  if (props.autoResize) nextTick(recalculateLayout);
}

function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

function attachmentKey(file: Pick<File, "name" | "size" | "lastModified">) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function addFiles(files: File[]) {
  if (props.isLoading) return;

  const existingKeys = new Set([
    ...activeAttachments.value.map((attachment) =>
      attachmentKey({
        name: attachment.name,
        size: attachment.size,
        lastModified: attachment.lastModified,
      }),
    ),
    ...pendingAttachments.value.map((attachment) =>
      attachmentKey({
        name: attachment.name,
        size: attachment.size,
        lastModified: attachment.lastModified,
      }),
    ),
  ]);
  let count = activeAttachments.value.length + pendingAttachments.value.length;
  let totalSize =
    activeAttachmentBytes.value +
    pendingAttachments.value.reduce(
      (sum, attachment) => sum + attachment.size,
      0,
    );
  const errors = new Set<string>();

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (
      !ACCEPTED_MEDIA_TYPES.has(file.type) ||
      !EXTENSIONS_BY_MEDIA_TYPE[file.type]?.includes(extension)
    ) {
      errors.add("Endast PDF, JPEG, PNG, WebP och GIF stöds.");
      continue;
    }
    if (file.size === 0) {
      errors.add("Tomma filer kan inte bifogas.");
      continue;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      errors.add("Varje fil får vara högst 5 MB.");
      continue;
    }

    const key = attachmentKey(file);
    if (existingKeys.has(key)) {
      errors.add("Dubbletter har hoppats över.");
      continue;
    }
    if (count >= MAX_ATTACHMENTS) {
      errors.add("En aktiv chatt kan ha högst fem filer.");
      continue;
    }
    if (totalSize + file.size > MAX_ATTACHMENTS_TOTAL_SIZE) {
      errors.add("Filerna får vara högst 20 MB tillsammans.");
      continue;
    }

    pendingAttachments.value.push({
      id: crypto.randomUUID(),
      name: file.name,
      mediaType: file.type,
      size: file.size,
      lastModified: file.lastModified,
      active: true,
      file,
      ...(file.type.startsWith("image/")
        ? { previewUrl: URL.createObjectURL(file) }
        : {}),
    });
    existingKeys.add(key);
    count += 1;
    totalSize += file.size;
  }

  for (const error of errors) toast.error(error, { position: "top-center" });
}

function handleFileInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) addFiles(Array.from(input.files));
  input.value = "";
}

function removePendingAttachment(id: string) {
  const attachment = pendingAttachments.value.find((item) => item.id === id);
  if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
  pendingAttachments.value = pendingAttachments.value.filter(
    (attachment) => attachment.id !== id,
  );
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
  getAttachments: () => [...pendingAttachments.value],
  setAttachments: (value: ChatAttachment[]) => {
    pendingAttachments.value = value.filter(
      (attachment) => attachment.active && attachment.file,
    );
  },
  clearAttachments: () => {
    pendingAttachments.value = [];
  },
  discardAttachments: () => {
    for (const attachment of pendingAttachments.value) {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    }
    pendingAttachments.value = [];
  },
  addFiles,
});
</script>

<template>
  <div class="px-4 bg-transparent relative w-full pointer-events-auto z-10">
    <div class="max-w-2xl mx-auto relative">
      <Transition name="fade-up">
        <div v-if="showScrollButton" class="absolute -top-12 right-3 z-20">
          <Button
            variant="outline"
            size="icon"
            class="rounded-full"
            @click="emit('scrollToBottom')"
          >
            <LucideArrowDown class="w-4 h-4" />
          </Button>
        </div>
      </Transition>

      <div class="space-y-2">
        <div
          class="chat-shell rounded-[28px] border border-border bg-background focus-within:border-border"
        >
          <Transition name="context-chip">
            <div
              v-if="selectionContext"
              class="flex items-center gap-2 w-full border-b border-border/60 px-5 py-2.5"
            >
              <LucideCornerUpLeft
                class="w-3.5 h-3.5 shrink-0 text-muted-foreground"
              />
              <span
                class="flex-1 min-w-0 text-sm italic text-muted-foreground truncate"
                >"{{ selectionContext }}"</span
              >
              <Button
                variant="ghost"
                size="icon-xs"
                class="shrink-0"
                @click.prevent="emit('clearSelectionContext')"
              >
                <LucideX class="w-3.5 h-3.5" />
              </Button>
            </div>
          </Transition>

          <TransitionGroup
            v-if="pendingAttachments.length"
            name="attachment-chip"
            tag="div"
            appear
            class="relative flex flex-wrap gap-2 border-b border-border/60 px-4 py-2.5"
          >
            <div
              v-for="attachment in pendingAttachments"
              :key="attachment.id"
              class="flex min-w-0 max-w-full items-center gap-2 rounded-xl bg-secondary/60 px-2.5 py-1.5 text-xs"
            >
              <LucideFileText
                v-if="attachment.mediaType === 'application/pdf'"
                class="size-3.5 shrink-0 text-muted-foreground"
              />
              <img
                v-else-if="attachment.previewUrl"
                :src="attachment.previewUrl"
                alt=""
                class="size-10 shrink-0 rounded-lg object-cover"
              />
              <LucideImage
                v-else
                class="size-3.5 shrink-0 text-muted-foreground"
              />
              <span class="max-w-20 truncate" :title="attachment.name">{{
                attachment.name
              }}</span>
              <span class="shrink-0 text-muted-foreground">{{
                formatFileSize(attachment.size)
              }}</span>
              <button
                type="button"
                class="shrink-0 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
                :aria-label="`Ta bort ${attachment.name}`"
                @click="removePendingAttachment(attachment.id)"
              >
                <LucideX class="size-3.5" />
              </button>
            </div>
          </TransitionGroup>

          <div
            ref="rowRef"
            class="flex flex-wrap items-center gap-1.5 px-2.5 py-2.5"
          >
            <div
              ref="attachmentButtonRef"
              class="shrink-0"
              :class="isMultiline ? 'order-2' : 'order-1'"
            >
              <input
                ref="fileInputRef"
                type="file"
                multiple
                class="hidden"
                :accept="FILE_INPUT_ACCEPT"
                @change="handleFileInput"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Bifoga filer"
                class="size-8 rounded-full text-muted-foreground hover:text-foreground"
                :disabled="isLoading || attachmentCapacityReached"
                @click="fileInputRef?.click()"
              >
                <LucidePlus class="size-4" />
              </Button>
            </div>

            <textarea
              ref="textareaRef"
              :value="text"
              rows="1"
              placeholder="Fråga vad som helst"
              class="chat-textarea min-w-0 resize-none border-0 bg-transparent px-2 py-1 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45"
              :class="isMultiline ? 'order-1 basis-full' : 'order-2 flex-1'"
              @input="handleInput"
              @keydown="handleKeyDown"
            />

            <div
              ref="controlsRef"
              class="order-3 flex shrink-0 items-center gap-1.5"
              :class="{ 'ml-auto': isMultiline }"
            >
              <DropdownMenu v-if="!compact">
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-8 gap-1.5 rounded-full px-3 text-xs font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
                  >
                    {{ selectedModelLabel }}
                    <LucideChevronDown
                      class="w-3.5 h-3.5 text-muted-foreground/70"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56 p-1.5">
                  <template v-for="(group, groupIndex) in MODEL_GROUPS" :key="group.provider">
                    <DropdownMenuSeparator v-if="groupIndex > 0" class="my-1.5" />
                    <DropdownMenuLabel
                      class="px-2.5 pb-1 pt-1.5 text-xs font-normal text-muted-foreground"
                    >
                      {{ group.provider }}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      v-for="model in group.models"
                      :key="model.id"
                      class="cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-1.5 focus:bg-accent/70"
                      @click="emit('update:selectedModelId', model.id)"
                    >
                      <span class="text-xs font-medium text-foreground">
                        {{ model.label }}
                      </span>
                      <LucideCheck
                        v-if="model.id === selectedModelId"
                        class="size-3.5 shrink-0 text-primary"
                      />
                    </DropdownMenuItem>
                  </template>
                </DropdownMenuContent>
              </DropdownMenu>

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
                  :disabled="!canSend"
                  @click="emit('send')"
                >
                  <LucideArrowUp class="size-4" />
                </Button>
              </Transition>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 px-4 text-center">
          <p class="text-2xs text-muted-foreground/60">
            AI kan göra misstag. Kontrollera svaren.
          </p>
          <p
            v-if="reactiveInput && text.length > MAX_LENGTH * 0.8"
            class="text-xs"
            :class="
              text.length > MAX_LENGTH
                ? 'text-destructive font-bold'
                : 'text-muted-foreground'
            "
          >
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

.attachment-chip-enter-active,
.attachment-chip-leave-active,
.attachment-chip-move {
  transition:
    opacity 140ms ease,
    transform 180ms var(--ease-spring);
}

.attachment-chip-enter-from,
.attachment-chip-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.96);
}

.attachment-chip-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .attachment-chip-enter-active,
  .attachment-chip-leave-active,
  .attachment-chip-move {
    transition: none;
  }
}
</style>
