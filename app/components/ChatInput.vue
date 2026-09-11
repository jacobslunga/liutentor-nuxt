<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { useChatStore, type ChatAttachment } from "@/stores/chat";
import {
  matchSkills,
  getSkillById,
  type ChatSkill,
  type ChatSkillId,
} from "@/lib/chat-skills";
import { onClickOutside, useResizeObserver } from "@vueuse/core";

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
    webSearch?: boolean;
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
    webSearch: false,
  },
);

const emit = defineEmits<{
  send: [];
  cancel: [];
  "update:selectedModelId": [value: string];
  "update:webSearch": [value: boolean];
  clearSelectionContext: [];
}>();

const shellRef = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const fileInputRef = ref<HTMLInputElement | null>(null);
const text = ref(props.initialText ?? "");
const pendingAttachments = ref<ChatAttachment[]>([...props.initialAttachments]);
const chatStore = useChatStore();
const MAX_LENGTH = 4000;

// Fältet börjar på en rad och växer med innehållet upp till ett tak.
const MIN_ROWS = 1;
const MAX_HEIGHT = 220;

function autoResize() {
  const el = textareaRef.value;
  if (!el || !props.autoResize) return;
  el.style.height = "auto";
  const height = Math.min(el.scrollHeight, MAX_HEIGHT);
  el.style.height = `${height}px`;
  el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
}

watch(() => text.value, () => nextTick(autoResize));
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

// Kryssposter markerar den valda nivån; hint blir postens description.
const modelItems = computed<DropdownMenuItem[][]>(() => [
  [
    { label: "Tankenivå", type: "label" },
    ...availableModels.value.map((model) => ({
      label: model.label,
      description: model.hint,
      type: "checkbox" as const,
      checked: model.id === props.selectedModelId,
      onSelect: () => {
        emit("update:selectedModelId", model.id);
        modelMenuOpen.value = false;
      },
    })),
  ],
]);

const activeSkill = ref<ChatSkill | null>(null);
const menuOpen = ref(false);
const menuQuery = ref("");
const highlightedIndex = ref(0);
const skillPillRef = ref<HTMLElement | null>(null);
const skillMenuRef = ref<HTMLElement | null>(null);

const filteredSkills = computed(() => matchSkills(menuQuery.value));

onClickOutside(skillMenuRef, () => {
  menuOpen.value = false;
});

useResizeObserver(skillPillRef, () => {
  const width = skillPillRef.value?.offsetWidth ?? 0;
  const el = textareaRef.value;
  if (el) el.style.textIndent = width ? `${width + 8}px` : "";
});

function syncSlashMenu(value: string) {
  const match = activeSkill.value ? null : /^\/(\S*)$/.exec(value);
  menuQuery.value = match?.[1] ?? "";
  menuOpen.value = !!match && filteredSkills.value.length > 0;
  if (menuOpen.value) highlightedIndex.value = 0;
}

function selectSkill(skill: ChatSkill | undefined) {
  if (!skill) return;
  activeSkill.value = skill;
  menuOpen.value = false;
  menuQuery.value = "";
  setText("");
  nextTick(() => textareaRef.value?.focus());
}

const SKILL_ICONS: Record<ChatSkillId, string> = {
  explain: "i-lucide-graduation-cap",
  theory: "i-lucide-book-open",
  solution: "i-lucide-list-checks",
  hint: "i-lucide-lightbulb",
  summary: "i-lucide-list",
};

function clearSkill() {
  activeSkill.value = null;
  if (textareaRef.value) textareaRef.value.style.textIndent = "";
  nextTick(() => textareaRef.value?.focus());
}

const handleInput = (event: Event) => {
  const el = event.target as HTMLTextAreaElement;
  text.value = el.value;
  syncSlashMenu(el.value);
  autoResize();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (menuOpen.value) {
    const count = filteredSkills.value.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlightedIndex.value = (highlightedIndex.value + 1) % count;
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightedIndex.value = (highlightedIndex.value - 1 + count) % count;
      return;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectSkill(filteredSkills.value[highlightedIndex.value]);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      menuOpen.value = false;
      return;
    }
  }

  // Backsteg längst till vänster äter pillen istället för ett tecken.
  if (e.key === "Backspace" && activeSkill.value) {
    const el = e.target as HTMLTextAreaElement;
    if (el.selectionStart === 0 && el.selectionEnd === 0) {
      e.preventDefault();
      clearSkill();
      return;
    }
  }

  if (!props.submitOnEnter) return;
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (canSend.value && !props.isLoading) emit("send");
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

onMounted(() => {
  autoResize();
  if (props.autofocus) textareaRef.value?.focus();
});

defineExpose({
  focus: () => textareaRef.value?.focus(),
  getShellTop: () => shellRef.value?.getBoundingClientRect().top ?? null,
  getText: () => text.value,
  setText,
  getSkill: () => activeSkill.value?.id ?? null,
  setSkill: (id: string | null) => {
    const skill = getSkillById(id);
    if (skill) {
      activeSkill.value = skill;
    } else {
      activeSkill.value = null;
      if (textareaRef.value) textareaRef.value.style.textIndent = "";
    }
  },
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
    <div ref="shellRef"
      class="chat-shell relative mx-auto max-w-2xl cursor-text rounded-xl border border-default bg-default shadow-sm 3xl:max-w-3xl"
      @click="textareaRef?.focus()">
      <Transition name="fade-up">
        <div v-if="menuOpen" id="chat-skill-menu" ref="skillMenuRef" role="listbox" aria-label="Skills"
          class="absolute inset-x-0 bottom-full z-30 mb-2 overflow-hidden rounded-lg bg-default p-1 shadow-lg ring ring-default">
          <p class="px-2 pb-1 pt-1 text-2xs text-muted">Skills</p>
          <button v-for="(skill, index) in filteredSkills" :id="`chat-skill-${skill.id}`" :key="skill.id" type="button"
            role="option" :aria-selected="index === highlightedIndex"
            class="flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-left"
            :class="index === highlightedIndex ? 'bg-elevated' : ''" @mouseenter="highlightedIndex = index"
            @mousedown.prevent="selectSkill(skill)">
            <UIcon :name="SKILL_ICONS[skill.id]" class="mt-0.5 size-3.5 shrink-0 text-muted" />
            <span class="flex min-w-0 flex-col gap-0.5">
              <span class="flex items-baseline gap-1.5">
                <span class="text-xs font-medium text-highlighted">{{ skill.label }}</span>
                <span class="text-2xs text-muted">/{{ skill.command }}</span>
              </span>
              <span class="text-2xs leading-snug text-muted">{{ skill.description }}</span>
            </span>
          </button>
        </div>
      </Transition>

      <div v-if="selectionContext || pendingAttachments.length || activeSkill"
        class="flex min-w-0 flex-col gap-2 border-b border-default px-3 py-2.5">
        <div v-if="selectionContext" class="flex w-full items-center gap-2">
          <UIcon name="i-lucide-reply" class="size-3.5 shrink-0 text-muted" />
          <span class="min-w-0 flex-1 truncate text-sm italic text-muted">"{{ selectionContext }}"</span>
          <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-x" aria-label="Ta bort citatet"
            @click.prevent="emit('clearSelectionContext')" />
        </div>

        <div v-if="activeSkill" class="flex">
          <UBadge :label="activeSkill.label" color="primary" variant="solid" size="sm" trailing-icon="i-lucide-x"
            class="cursor-pointer" :aria-label="`Ta bort ${activeSkill.label}`" @mousedown.prevent="clearSkill()" />
        </div>

        <TransitionGroup v-if="pendingAttachments.length" name="attachment-chip" tag="div" appear
          class="flex flex-wrap gap-2">
          <div v-for="attachment in pendingAttachments" :key="attachment.id"
            class="flex min-w-0 max-w-full items-center gap-2 rounded-sm bg-elevated px-2.5 py-1.5 text-xs">
            <UIcon v-if="attachment.mediaType === 'application/pdf'" name="i-lucide-file-text"
              class="size-3.5 shrink-0 text-muted" />
            <img v-else-if="attachment.previewUrl" :src="attachment.previewUrl" alt=""
              class="size-10 shrink-0 rounded-sm object-cover" />
            <UIcon v-else name="i-lucide-image" class="size-3.5 shrink-0 text-muted" />
            <span class="max-w-20 truncate" :title="attachment.name">{{ attachment.name }}</span>
            <span class="shrink-0 text-muted">{{ formatFileSize(attachment.size) }}</span>
            <UButton color="neutral" variant="link" size="xs" icon="i-lucide-x"
              :aria-label="`Ta bort ${attachment.name}`" @click="removePendingAttachment(attachment.id)" />
          </div>
        </TransitionGroup>
      </div>

      <textarea ref="textareaRef" v-model="text" :rows="MIN_ROWS"
        :placeholder="activeSkill ? 'Fråga vad som helst' : 'Fråga vad som helst, skriv / för skills'" role="combobox"
        :aria-expanded="menuOpen" aria-controls="chat-skill-menu"
        :aria-activedescendant="menuOpen ? `chat-skill-${filteredSkills[highlightedIndex]?.id}` : undefined"
        class="chat-textarea block w-full resize-none bg-transparent px-4 py-2.5 text-[0.9375rem] leading-6 text-highlighted outline-none placeholder:text-muted sm:py-3"
        @input="handleInput" @keydown="handleKeyDown" />

      <div class="flex min-w-0 items-center justify-between gap-2 px-2 pb-2">
        <div class="flex min-w-0 items-center gap-1">
          <input ref="fileInputRef" type="file" multiple class="hidden" :accept="FILE_INPUT_ACCEPT"
            @change="handleFileInput" />
          <UTooltip text="Bifoga filer">
            <UButton color="neutral" variant="ghost" icon="i-lucide-plus" aria-label="Bifoga filer"
              :disabled="isLoading || attachmentCapacityReached" @click="fileInputRef?.click()" />
          </UTooltip>
          <UTooltip :text="webSearch ? 'Webbsökning på' : 'Sök på webben'">
            <UButton :color="webSearch ? 'primary' : 'neutral'" :variant="webSearch ? 'soft' : 'ghost'"
              icon="i-lucide-globe" :label="webSearch ? 'Webb' : undefined" aria-label="Sök på webben"
              :aria-pressed="webSearch" @click="emit('update:webSearch', !webSearch)" />
          </UTooltip>
          <UDropdownMenu v-model:open="modelMenuOpen" :items="modelItems" :content="{ align: 'start' }">
            <UButton color="neutral" variant="ghost" :label="`Gemini • ${selectedModelLabel}`" class="min-w-0" />
          </UDropdownMenu>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <p v-if="text.length > MAX_LENGTH * 0.8" class="text-2xs"
            :class="text.length > MAX_LENGTH ? 'font-medium text-error' : 'text-muted'">{{ text.length }} / {{
              MAX_LENGTH }}</p>
          <UButton v-if="isLoading" color="neutral" variant="soft" icon="i-lucide-square" aria-label="Avbryt svar"
            @click="emit('cancel')" />
          <UButton v-else color="primary" icon="i-lucide-arrow-up" aria-label="Skicka meddelande" :disabled="!canSend"
            @click="emit('send')" />
        </div>
      </div>
    </div>
    <p v-if="showDisclaimer" class="pointer-events-auto px-4 pb-2 pt-1 text-center text-2xs text-dimmed">
      AI kan göra misstag. Kontrollera svaren.
    </p>
  </div>
</template>

<style scoped>
.chat-shell {
  transition: border-color var(--duration-fast) ease;
}

.chat-shell:has(.chat-textarea:focus) {
  border-color: var(--ui-border-accented);
}

.chat-textarea {
  transition: height 130ms var(--ease-spring);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@media (prefers-reduced-motion: reduce) {
  .chat-textarea {
    transition: none;
  }
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
