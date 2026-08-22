<script setup lang="ts">
import { useChatStore, type ChatAttachment } from "@/stores/chat";
import { toast } from "vue-sonner";

const { availableModels } = useSelectedModel();

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
    webSearch?: boolean;
    showScrollButton: boolean;
    courseCode?: string;
    hasSolution?: boolean;
    selectionContext?: string;
    showDisclaimer?: boolean;

    autofocus?: boolean;

    submitOnEnter?: boolean;

    autoResize?: boolean;

    reactiveInput?: boolean;
  }>(),
  {
    autofocus: true,
    initialAttachments: () => [],
    submitOnEnter: true,
    autoResize: true,
    reactiveInput: true,
    showDisclaimer: false,
    webSearch: false,
  },
);

const emit = defineEmits<{
  send: [];
  cancel: [];
  scrollToBottom: [];
  "update:selectedModelId": [value: string];
  "update:webSearch": [value: boolean];
  clearSelectionContext: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const chatShellRef = ref<HTMLDivElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const text = ref(props.initialText ?? "");
const pendingAttachments = ref<ChatAttachment[]>([...props.initialAttachments]);
const chatStore = useChatStore();
const MAX_LENGTH = 4000;
const nonReactiveCanSend = ref(
  !!props.initialText?.trim() && props.initialText.length <= MAX_LENGTH,
);
const nonReactiveTooLong = ref((props.initialText?.length ?? 0) > MAX_LENGTH);

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
    availableModels.value.find((m) => m.id === props.selectedModelId)?.label ??
    availableModels.value[0]!.label,
);

/**
 * The textarea owns its own row now, so growing it is a plain scrollHeight read
 * capped at 180px. The previous layout had it sharing a row with the controls
 * until the text stopped fitting, which needed width probing and a hand-rolled
 * expansion animation; none of that survives the stacked design.
 */
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

const updateHeight = (event?: Event) => {
  if (!props.autoResize) return;
  // Deleting can free up a row, so it needs the shrink pass; typing only grows.
  const inputType = event instanceof InputEvent ? event.inputType : "";
  applyHeight(!event || inputType.startsWith("delete"));
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
  if (props.autoResize) nextTick(() => applyHeight(true));
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
  if (props.autoResize) applyHeight(true);
  if (props.autofocus) textareaRef.value?.focus();
});

defineExpose({
  focus: () => textareaRef.value?.focus(),
  getShellTop: () => chatShellRef.value?.getBoundingClientRect().top ?? null,
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
      <div class="space-y-2">
        <p v-if="showDisclaimer" class="px-4 text-center text-2xs text-muted-foreground/60">
          AI kan göra misstag. Kontrollera svaren.
        </p>

        <div ref="chatShellRef"
          class="chat-shell relative rounded-[28px] border border-border bg-background dark:bg-secondary shadow-[0_16px_45px_-18px_rgba(0,0,0,0.22)] focus-within:border-border dark:shadow-[0_16px_45px_-18px_rgba(0,0,0,0.55)]">
          <Transition name="fade-up">
            <div v-if="showScrollButton" class="pointer-events-none absolute -top-12 right-3 z-20">
              <Button variant="outline" size="icon" class="pointer-events-auto rounded-full"
                @click="emit('scrollToBottom')">
                <LucideArrowDown class="w-4 h-4" />
              </Button>
            </div>
          </Transition>

          <Transition name="context-chip">
            <div v-if="selectionContext" class="flex items-center gap-2 w-full border-b border-border/60 px-5 py-2.5">
              <LucideCornerUpLeft class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span class="flex-1 min-w-0 text-sm italic text-muted-foreground truncate">"{{ selectionContext }}"</span>
              <Button variant="ghost" size="icon-xs" class="shrink-0" @click.prevent="emit('clearSelectionContext')">
                <LucideX class="w-3.5 h-3.5" />
              </Button>
            </div>
          </Transition>

          <TransitionGroup v-if="pendingAttachments.length" name="attachment-chip" tag="div" appear
            class="relative flex flex-wrap gap-2 border-b border-border/60 px-4 py-2.5">
            <div v-for="attachment in pendingAttachments" :key="attachment.id"
              class="flex min-w-0 max-w-full items-center gap-2 rounded-xl bg-secondary/60 px-2.5 py-1.5 text-xs">
              <LucideFileText v-if="attachment.mediaType === 'application/pdf'"
                class="size-3.5 shrink-0 text-muted-foreground" />
              <img v-else-if="attachment.previewUrl" :src="attachment.previewUrl" alt=""
                class="size-10 shrink-0 rounded-lg object-cover" />
              <LucideImage v-else class="size-3.5 shrink-0 text-muted-foreground" />
              <span class="max-w-20 truncate" :title="attachment.name">{{
                attachment.name
              }}</span>
              <span class="shrink-0 text-muted-foreground">{{
                formatFileSize(attachment.size)
              }}</span>
              <button type="button"
                class="shrink-0 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
                :aria-label="`Ta bort ${attachment.name}`" @click="removePendingAttachment(attachment.id)">
                <LucideX class="size-3.5" />
              </button>
            </div>
          </TransitionGroup>

          <div class="px-4 pt-3.5 pb-1">
            <textarea ref="textareaRef" :value="text" rows="1" placeholder="Fråga vad som helst"
              class="chat-textarea block w-full min-w-0 resize-none border-0 bg-transparent p-0 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:ring-0 max-h-45 sm:text-[15px]"
              @input="handleInput" @keydown="handleKeyDown" />
          </div>

          <div class="flex items-center gap-1.5 px-2.5 pb-2.5">
            <input ref="fileInputRef" type="file" multiple class="hidden" :accept="FILE_INPUT_ACCEPT"
              @change="handleFileInput" />
            <Button variant="ghost" size="icon" aria-label="Bifoga filer"
              class="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              :disabled="isLoading || attachmentCapacityReached" @click="fileInputRef?.click()">
              <LucidePlus class="size-4" />
            </Button>

            <Button variant="ghost" size="sm" type="button" aria-label="Sök på webben" :aria-pressed="webSearch"
              :title="webSearch ? 'Webbsökning på' : 'Sök på webben'"
              class="h-8 shrink-0 gap-1.5 rounded-full px-2.5 text-xs font-normal hover:bg-accent/70" :class="webSearch
                ? 'bg-accent/70 text-primary hover:text-primary'
                : 'text-muted-foreground hover:text-foreground'" @click="emit('update:webSearch', !webSearch)">
              <LucideGlobe class="size-4" />
              <span v-if="webSearch">Webb</span>
            </Button>

            <div class="ml-auto flex shrink-0 items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm"
                    class="h-8 gap-1.5 rounded-full px-3 text-xs font-normal text-muted-foreground hover:bg-accent/70 hover:text-foreground data-[state=open]:bg-accent/70">
                    {{ selectedModelLabel }}
                    <LucideChevronDown class="w-3.5 h-3.5 text-muted-foreground/70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-60 p-1.5">
                  <DropdownMenuLabel class="px-2.5 pb-1 pt-1.5 text-xs font-normal text-muted-foreground">
                    Tankenivå
                  </DropdownMenuLabel>
                  <DropdownMenuItem v-for="model in availableModels" :key="model.id"
                    class="cursor-pointer items-start justify-between gap-2 rounded-md px-2.5 py-1.5 focus:bg-accent/70"
                    @click="emit('update:selectedModelId', model.id)">
                    <span class="flex min-w-0 flex-col gap-0.5">
                      <span class="text-xs font-medium text-foreground">
                        {{ model.label }}
                      </span>
                      <span class="text-2xs leading-snug text-muted-foreground">
                        {{ model.hint }}
                      </span>
                    </span>
                    <LucideCheck v-if="model.id === selectedModelId" class="mt-0.5 size-3.5 shrink-0 text-primary" />
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

        <div v-if="reactiveInput && text.length > MAX_LENGTH * 0.8"
          class="flex items-center justify-center gap-2 px-4 text-center">
          <p class="text-xs" :class="text.length > MAX_LENGTH
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
  transition:
    opacity var(--duration-base) var(--ease-spring),
    transform var(--duration-base) var(--ease-spring);
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
