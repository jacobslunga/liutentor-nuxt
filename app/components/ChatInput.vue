<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { useChatStore, type ChatAttachment } from "@/stores/chat";
import { useResizeObserver } from "@vueuse/core";

const { availableModels } = useSelectedModel();
const toast = useToast();

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
    courseCode?: string;
    hasSolution?: boolean;
    selectionContext?: string;
    showDisclaimer?: boolean;

    autofocus?: boolean;

    submitOnEnter?: boolean;

    autoResize?: boolean;
  }>(),
  {
    autofocus: true,
    initialAttachments: () => [],
    submitOnEnter: true,
    autoResize: true,
    showDisclaimer: false,
  },
);

const emit = defineEmits<{
  send: [];
  cancel: [];
  "update:selectedModelId": [value: string];
  clearSelectionContext: [];
}>();

const shellRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const fileInputRef = ref<HTMLInputElement | null>(null);
const text = ref(props.initialText ?? "");
const pendingAttachments = ref<ChatAttachment[]>([...props.initialAttachments]);
const chatStore = useChatStore();
const MAX_LENGTH = 4000;

const leftControlsRef = ref<HTMLElement | null>(null);
const rightControlsRef = ref<HTMLElement | null>(null);
const measurementRef = ref<HTMLTextAreaElement | null>(null);
const compactTextWidth = ref(1);
const leftControlsWidth = ref(64);
const rightControlsWidth = ref(120);
const textHeight = ref(24);
const animateLayout = ref(false);
let measuredExpanded = false;
const isMultiline = ref(false);
const isExpanded = computed(() => isMultiline.value);
const hasHeader = computed(
  () => !!props.selectionContext || pendingAttachments.value.length > 0,
);

function measurePrompt() {
  const shell = shellRef.value;
  const measurement = measurementRef.value;
  if (!shell || !measurement) return;
  leftControlsWidth.value = leftControlsRef.value?.offsetWidth ?? 64;
  rightControlsWidth.value = rightControlsRef.value?.offsetWidth ?? 120;
  compactTextWidth.value = Math.max(
    1,
    shell.clientWidth - leftControlsWidth.value - rightControlsWidth.value - 40,
  );
  measurement.style.width = `${compactTextWidth.value}px`;
  isMultiline.value =
    text.value.includes("\n") || measurement.scrollHeight > 24;
  measurement.style.width = `${isExpanded.value ? shell.clientWidth - 40 : compactTextWidth.value}px`;
  const nextHeight = props.autoResize
    ? Math.min(192, Math.max(24, measurement.scrollHeight))
    : 24;
  if (
    isExpanded.value !== measuredExpanded ||
    nextHeight !== textHeight.value
  ) {
    animateLayout.value = isExpanded.value !== measuredExpanded;
  }
  measuredExpanded = isExpanded.value;
  textHeight.value = nextHeight;
}

useResizeObserver([shellRef, leftControlsRef, rightControlsRef], measurePrompt);
watch([text, isExpanded], () => nextTick(measurePrompt), { flush: "post" });
onMounted(() => {
  measurePrompt();
  if (props.autofocus) textareaRef.value?.focus({ preventScroll: true });
});

const canSend = computed(
  () =>
    (!!text.value.trim() || pendingAttachments.value.length > 0) &&
    text.value.length <= MAX_LENGTH,
);

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

const modelMenuOpen = ref(false);

// Markera den valda tankenivån.
const modelItems = computed<DropdownMenuItem[][]>(() => [
  [
    ...availableModels.value.map((model) => ({
      label: model.label,
      type: "checkbox" as const,
      checked: model.id === props.selectedModelId,
      onSelect: () => {
        emit("update:selectedModelId", model.id);
        modelMenuOpen.value = false;
      },
    })),
  ],
]);

const handleInput = (event: Event) => {
  const el = event.target as HTMLTextAreaElement;
  text.value = el.value;
};

function handleSubmit() {
  if (canSend.value && !props.isLoading) emit("send");
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.isComposing || e.keyCode === 229) return;
  // Enter submits text or attachments; Shift+Enter keeps a newline.
  const submits = props.submitOnEnter
    ? !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey
    : e.ctrlKey || e.metaKey;
  if (e.key === "Enter" && submits) {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit();
  }
};

function setText(value: string) {
  text.value = value;
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

  for (const error of errors) toast.add({ title: error, color: "error" });
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

defineExpose({
  focus: () => textareaRef.value?.focus(),
  getShellTop: () => shellRef.value?.getBoundingClientRect().top ?? null,
  getText: () => text.value,
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
  <div class="pointer-events-auto w-full px-3 sm:px-4">
    <div ref="shellRef" class="relative mx-auto max-w-2xl 3xl:max-w-3xl">
      <form
        class="chat-prompt bg-default"
        :class="{
          'is-expanded': isExpanded,
          'animate-layout': animateLayout,
        }"
        @submit.prevent="handleSubmit"
      >
        <div class="chat-prompt-header" v-if="hasHeader">
          <Transition name="input-panel">
            <div v-if="hasHeader" class="input-panel grid">
              <div class="min-h-0 overflow-hidden">
                <TransitionGroup
                  name="input-change"
                  tag="div"
                  class="relative flex min-w-0 flex-col gap-2 border-b border-default bg-elevated/50 px-4 pt-3 pb-2.5"
                >
                  <div
                    v-if="selectionContext"
                    :key="`context-${selectionContext}`"
                    class="flex w-full items-start gap-3"
                  >
                    <UIcon
                      name="i-openai-corner-down-left"
                      class="mt-0.5 size-4 shrink-0 -scale-x-100 text-muted"
                    />
                    <span
                      class="min-w-0 flex-1 line-clamp-3 text-sm leading-relaxed text-default"
                      >"<SelectionQuote :text="selectionContext" />"</span
                    >
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      icon="i-openai-x"
                      aria-label="Ta bort citatet"
                      @click.prevent="emit('clearSelectionContext')"
                    />
                  </div>

                  <TransitionGroup
                    v-if="pendingAttachments.length"
                    key="attachments"
                    name="attachment-chip"
                    tag="div"
                    appear
                    class="flex flex-wrap gap-2"
                  >
                    <div
                      v-for="attachment in pendingAttachments"
                      :key="attachment.id"
                      class="flex min-w-0 max-w-full items-center gap-2 rounded-xl bg-elevated px-2.5 py-1.5 text-xs"
                    >
                      <UIcon
                        v-if="attachment.mediaType === 'application/pdf'"
                        name="i-openai-file-text"
                        class="size-3.5 shrink-0 text-muted"
                      />
                      <img
                        v-else-if="attachment.previewUrl"
                        :src="attachment.previewUrl"
                        alt=""
                        class="size-10 shrink-0 rounded-lg object-cover"
                      />
                      <UIcon
                        v-else
                        name="i-openai-photo"
                        class="size-3.5 shrink-0 text-muted"
                      />
                      <span
                        class="max-w-20 truncate"
                        :title="attachment.name"
                        >{{ attachment.name }}</span
                      >
                      <span class="shrink-0 text-muted">{{
                        formatFileSize(attachment.size)
                      }}</span>
                      <UButton
                        color="neutral"
                        variant="link"
                        size="xs"
                        icon="i-openai-x"
                        :aria-label="`Ta bort ${attachment.name}`"
                        @click="removePendingAttachment(attachment.id)"
                      />
                    </div>
                  </TransitionGroup>
                </TransitionGroup>
              </div>
            </div>
          </Transition>
        </div>

        <textarea
          ref="textareaRef"
          v-model="text"
          rows="1"
          class="chat-prompt-body chat-prompt-textarea"
          :style="{
            height: `${textHeight + 8}px`,
            paddingLeft: isExpanded ? '8px' : `${leftControlsWidth + 8}px`,
            paddingRight: isExpanded ? '8px' : `${rightControlsWidth + 8}px`,
          }"
          placeholder="Fråga vad som helst"
          aria-label="Meddelande"
          @input="handleInput"
          @keydown="handleKeyDown"
        />

        <div class="chat-prompt-footer">
          <div class="contents">
            <div
              ref="leftControlsRef"
              class="chat-controls-left flex items-center gap-0.5"
            >
              <input
                ref="fileInputRef"
                type="file"
                multiple
                class="hidden"
                :accept="FILE_INPUT_ACCEPT"
                @change="handleFileInput"
              />
              <UTooltip text="Bifoga filer">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-openai-plus"
                  aria-label="Bifoga filer"
                  :disabled="isLoading || attachmentCapacityReached"
                  @click="fileInputRef?.click()"
                />
              </UTooltip>
            </div>
            <div
              ref="rightControlsRef"
              class="chat-controls-right flex shrink-0 items-center gap-1"
            >
              <UDropdownMenu
                v-model:open="modelMenuOpen"
                :items="modelItems"
                :content="{ align: 'end', side: 'top' }"
                checked-icon="i-openai-check"
                :ui="{
                  content: 'min-w-24 w-28',
                  item: 'py-1',
                  itemLabel: 'text-xs font-normal',
                }"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :label="`${selectedModelLabel}`"
                  class="min-w-0"
                  trailing-icon="i-openai-chevron-down"
                />
              </UDropdownMenu>
              <p
                v-if="text.length > MAX_LENGTH * 0.8"
                class="text-2xs"
                :class="
                  text.length > MAX_LENGTH
                    ? 'font-medium text-error'
                    : 'text-muted'
                "
              >
                {{ text.length }} / {{ MAX_LENGTH }}
              </p>
              <button
                type="button"
                class="chat-send flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-inverted disabled:opacity-45"
                :aria-label="isLoading ? 'Avbryt svar' : 'Skicka meddelande'"
                :disabled="!isLoading && !canSend"
                @click="isLoading ? emit('cancel') : handleSubmit()"
              >
                <UIcon
                  :name="isLoading ? 'i-openai-stop' : 'i-openai-arrow-up'"
                  class="size-5"
                />
              </button>
            </div>
          </div>
        </div>
      </form>
      <textarea
        ref="measurementRef"
        :value="text"
        aria-hidden="true"
        tabindex="-1"
        rows="1"
        class="prompt-measurement"
      />
    </div>
    <p
      v-if="showDisclaimer"
      class="pointer-events-auto px-4 pb-2 pt-1 text-center text-2xs text-dimmed"
    >
      AI kan göra misstag. Kontrollera svaren.
    </p>
  </div>
</template>

<style scoped>
.prompt-measurement {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  height: 0;
  padding: 0;
  border: 0;
  font: inherit;
  font-size: 0.9375rem;
  line-height: 24px;
  overflow: hidden;
}

.chat-prompt {
  position: relative;
  padding: 8px;
  border: 1px solid
    color-mix(in srgb, var(--ui-text-highlighted) 10%, transparent);
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.035);
  border-radius: 26px;
  transition:
    border-radius 200ms ease,
    padding-bottom 200ms ease;
}
.chat-prompt-header {
  display: block;
  /* Pull the header out to the shell edge so its background meets the border. */
  margin: -8px -8px 8px;
  border-radius: 25px 25px 0 0;
  overflow: hidden;
}
.chat-prompt.is-expanded .chat-prompt-header {
  border-radius: 19px 19px 0 0;
}
.chat-prompt-textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 32px;
  resize: none;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ui-text-highlighted);
  font-size: 0.9375rem;
  line-height: 24px;
  padding-top: 4px;
  padding-bottom: 4px;
  overflow-y: auto;
  scrollbar-width: thin;
}
.animate-layout .chat-prompt-textarea {
  transition:
    height 200ms ease,
    min-height 200ms ease,
    padding 200ms ease;
}
.chat-prompt-textarea::placeholder {
  color: var(--ui-text-muted);
}
.chat-prompt-footer {
  display: contents;
}
.chat-controls-left,
.chat-controls-right {
  position: absolute;
  bottom: 8px;
  height: 32px;
}
.chat-controls-left {
  left: 8px;
}
.chat-controls-right {
  right: 8px;
}
.chat-prompt.is-expanded {
  border-radius: 20px;
  padding-bottom: 48px;
}
.is-expanded .chat-prompt-textarea {
  min-height: 64px;
}
.chat-send {
  cursor: pointer;
  transition: opacity 150ms ease;
}
.chat-send:disabled {
  cursor: default;
}
.chat-send:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .chat-prompt,
  .chat-prompt-textarea,
  .animate-layout .chat-prompt-textarea {
    transition: none;
  }
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-spring),
    transform var(--duration-base) var(--ease-spring),
    filter var(--duration-base) var(--ease-spring);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(4px);
  filter: blur(4px);
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
    opacity 200ms ease,
    filter 200ms ease,
    transform 220ms var(--ease-spring);
}

.attachment-chip-enter-from,
.attachment-chip-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.98);
  filter: blur(4px);
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
.input-panel {
  grid-template-rows: 1fr;
}

.input-panel-enter-active,
.input-panel-leave-active {
  transition:
    grid-template-rows 240ms var(--ease-spring),
    opacity 200ms ease,
    filter 200ms ease;
}

.input-panel-enter-from,
.input-panel-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
  filter: blur(4px);
}

.input-change-enter-active,
.input-change-leave-active,
.input-change-move {
  transition:
    opacity 200ms ease,
    filter 200ms ease,
    transform 240ms var(--ease-spring);
}

.input-change-enter-from,
.input-change-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(4px);
}

.input-change-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .input-panel-enter-active,
  .input-panel-leave-active,
  .input-change-enter-active,
  .input-change-leave-active,
  .input-change-move,
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: none;
  }
}
</style>
