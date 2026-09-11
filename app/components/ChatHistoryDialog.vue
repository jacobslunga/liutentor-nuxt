<script setup lang="ts">
import type { Message } from "@/stores/chat";
import { useChatStore } from "@/stores/chat";

const toast = useToast();

type ConversationItem = {
  id: string;
  title: string;
  createdAt: string;
};

type ConversationMeta = {
  courseCode: string | null;
  examId: number | null;
  examDate: string | null;
};

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  select: [id: string];
}>();

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const chatStore = useChatStore();

const conversations = useState<ConversationItem[]>(
  "chat-history-conversations",
  () => [],
);
const conversationMeta = useState<Record<string, ConversationMeta>>(
  "chat-history-meta",
  () => ({}),
);
const searchQuery = ref("");
const searchInputRef = useTemplateRef("searchInputRef");
const isLoading = ref(false);
const isOpeningConversation = ref(false);
const isDeletingConversation = ref(false);
const isDeletingAll = ref(false);
const loadError = ref<string | null>(null);
const showDeleteConfirm = ref(false);
const showDeleteAllConfirm = ref(false);
const pendingDeleteConversation = ref<ConversationItem | null>(null);

const userId = computed(
  () =>
    ((user.value as any)?.id ?? (user.value as any)?.sub ?? null) as
    | string
    | null,
);

const requiresLoginMessage = computed(
  () => !userId.value && !isLoading.value && !loadError.value,
);

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const distanceToMonday = day === 0 ? 6 : day - 1;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - distanceToMonday);
  return result;
}

function getGroupLabel(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (sameDay(date, now)) return "Idag";
  if (sameDay(date, yesterday)) return "Igår";

  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

  if (date >= thisWeekStart && date < thisWeekEnd) return "Denna veckan";

  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  ) {
    return "Denna månaden";
  }

  return "Äldre";
}

function metaLabel(id: string): string {
  const meta = conversationMeta.value[id];
  if (!meta) return "";
  const parts: string[] = [];
  if (meta.courseCode) parts.push(meta.courseCode);
  if (meta.examDate) parts.push(`Tenta ${meta.examDate}`);
  return parts.join(" · ");
}

const filteredConversations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return conversations.value;
  return conversations.value.filter((item) => {
    if (item.title.toLowerCase().includes(query)) return true;
    return metaLabel(item.id).toLowerCase().includes(query);
  });
});

const groupedConversations = computed(() => {
  const order = ["Idag", "Igår", "Denna veckan", "Denna månaden", "Äldre"];
  const groups = new Map<string, ConversationItem[]>();

  for (const item of filteredConversations.value) {
    const key = getGroupLabel(item.createdAt);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  return order
    .map((label) => ({ label, items: groups.get(label) ?? [] }))
    .filter((group) => group.items.length > 0);
});

async function loadConversations() {
  if (!userId.value) {
    conversations.value = [];
    return;
  }

  const isInitialLoad = conversations.value.length === 0;
  if (isInitialLoad) isLoading.value = true;
  loadError.value = null;

  try {
    const { data, error } = await (supabase as any)
      .from("conversations")
      .select("id, title, created_at")
      .eq("user_id", userId.value)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    conversations.value = rows
      .filter((row: any) => row?.id && row?.created_at)
      .map((row: any) => ({
        id: row.id as string,
        title: (row.title as string) || "Ny chatt",
        createdAt: row.created_at as string,
      }));

    loadConversationMeta(conversations.value.map((c) => c.id));
  } catch {
    if (isInitialLoad) {
      loadError.value = "Kunde inte hämta konversationshistorik.";
      conversations.value = [];
      conversationMeta.value = {};
    }
  } finally {
    isLoading.value = false;
  }
}

async function loadConversationMeta(ids: string[]) {
  if (ids.length === 0) {
    conversationMeta.value = {};
    return;
  }

  try {
    const { data, error } = await (supabase as any)
      .from("ai_chat_logs")
      .select("conversation_id, course_code, exam_id, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const meta: Record<string, ConversationMeta> = {};
    for (const row of Array.isArray(data) ? data : []) {
      if (!row?.conversation_id || meta[row.conversation_id]) continue;
      meta[row.conversation_id as string] = {
        courseCode: (row.course_code as string) || null,
        examId: typeof row.exam_id === "number" ? row.exam_id : null,
        examDate: null,
      };
    }

    const examIds = [
      ...new Set(
        Object.values(meta)
          .map((m) => m.examId)
          .filter((id): id is number => id !== null),
      ),
    ];

    if (examIds.length > 0) {
      const { data: exams } = await (supabase as any)
        .from("exams")
        .select("id, exam_date")
        .in("id", examIds);

      const dateById = new Map(
        (Array.isArray(exams) ? exams : [])
          .filter((e: any) => e?.id && e?.exam_date)
          .map((e: any) => [e.id as number, e.exam_date as string]),
      );

      for (const m of Object.values(meta)) {
        if (m.examId !== null) m.examDate = dateById.get(m.examId) ?? null;
      }
    }

    conversationMeta.value = meta;
  } catch {
    // Metadata är bara pynt; listan fungerar utan.
  }
}

async function openConversation(item: ConversationItem) {
  if (isOpeningConversation.value) return;

  isOpeningConversation.value = true;
  loadError.value = null;

  try {
    const { data, error } = await (supabase as any)
      .from("ai_chat_logs")
      .select("role, content, created_at")
      .eq("conversation_id", item.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    const loadedMessages: Message[] = rows
      .map((row: any) => {
        const normalizedRole = String(row?.role ?? "")
          .trim()
          .toLowerCase();

        let role: Message["role"] | null = null;
        if (["user", "human"].includes(normalizedRole)) role = "user";
        if (["assistant", "ai", "bot", "model"].includes(normalizedRole)) {
          role = "assistant";
        }

        if (!role || typeof row?.content !== "string") return null;

        return {
          role,
          content: row.content,
        };
      })
      .filter((msg: Message | null): msg is Message => !!msg);

    if (loadedMessages.length === 0) {
      loadError.value = "Den här chatten har inga sparade meddelanden än.";
      return;
    }

    chatStore.releaseMessageAttachmentPreviews();
    chatStore.messages = [...loadedMessages];
    chatStore.currentConversationId = item.id;
    chatStore.currentConversationTitle = item.title;
    chatStore.savedScrollPosition = 0;
    emit("update:open", false);
    emit("select", item.id);
  } catch {
    loadError.value = "Kunde inte öppna konversationen.";
  } finally {
    isOpeningConversation.value = false;
  }
}

function askDeleteConversation(item: ConversationItem) {
  pendingDeleteConversation.value = item;
  showDeleteConfirm.value = true;
}

async function confirmDeleteConversation() {
  const item = pendingDeleteConversation.value;
  if (!item || !userId.value || isDeletingConversation.value) return;

  isDeletingConversation.value = true;
  loadError.value = null;

  try {
    const { error: logsError } = await (supabase as any)
      .from("ai_chat_logs")
      .delete()
      .eq("conversation_id", item.id);

    if (logsError) throw logsError;

    const { error: conversationError } = await (supabase as any)
      .from("conversations")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId.value);

    if (conversationError) throw conversationError;

    conversations.value = conversations.value.filter((c) => c.id !== item.id);

    if (chatStore.currentConversationId === item.id) {
      chatStore.releaseMessageAttachmentPreviews();
      chatStore.messages = [];
      chatStore.currentConversationId = null;
      chatStore.currentConversationTitle = null;
      chatStore.savedScrollPosition = 0;
      chatStore.setLoading(false);
    }

    toast.add({ title: "Chatten raderades", color: "success" });

    showDeleteConfirm.value = false;
    pendingDeleteConversation.value = null;
  } catch {
    loadError.value = "Kunde inte radera chatten.";
  } finally {
    isDeletingConversation.value = false;
  }
}

async function confirmDeleteAllConversations() {
  if (!userId.value || isDeletingAll.value) return;

  isDeletingAll.value = true;
  loadError.value = null;

  try {
    const ids = conversations.value.map((c) => c.id);

    if (ids.length > 0) {
      const { error: logsError } = await (supabase as any)
        .from("ai_chat_logs")
        .delete()
        .in("conversation_id", ids);

      if (logsError) throw logsError;

      const { error: conversationsError } = await (supabase as any)
        .from("conversations")
        .delete()
        .eq("user_id", userId.value);

      if (conversationsError) throw conversationsError;
    }

    conversations.value = [];
    conversationMeta.value = {};
    chatStore.releaseMessageAttachmentPreviews();
    chatStore.messages = [];
    chatStore.currentConversationId = null;
    chatStore.currentConversationTitle = null;
    chatStore.savedScrollPosition = 0;
    chatStore.setLoading(false);

    toast.add({ title: "Alla chattar raderades", color: "success" });
    showDeleteAllConfirm.value = false;
  } catch {
    loadError.value = "Kunde inte radera alla chattar.";
  } finally {
    isDeletingAll.value = false;
  }
}

watch(
  [() => props.open, userId],
  ([open]) => {
    if (!open) return;
    searchQuery.value = "";
    loadConversations();
  },
  { immediate: true },
);

function focusSearch() {
  // Autofokus bara på pekdon med hover, annars slår mobiltangentbordet upp.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    searchInputRef.value?.inputRef?.focus();
  }
}
</script>

<template>
  <UModal :open="open" title="Chatthistorik" description="Sök och öppna tidigare chattar"
    :ui="{ content: 'h-[36rem]', body: 'flex flex-col min-h-0 overflow-hidden' }"
    @update:open="emit('update:open', $event)" @after:enter="focusSearch">
    <template #body>
      <div class="flex shrink-0 items-center gap-2">
        <UInput ref="searchInputRef" v-model="searchQuery" icon="i-lucide-search" placeholder="Sök bland chattar..."
          class="flex-1" />
        <UButton v-if="conversations.length > 0" color="error" variant="ghost" icon="i-lucide-trash-2"
          :disabled="isDeletingAll || isDeletingConversation" aria-label="Radera alla chattar"
          @click="showDeleteAllConfirm = true" />
      </div>

      <div class="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain -mx-2 px-2">
        <div v-if="isLoading" class="px-2 py-4 text-sm text-muted">
          Hämtar historik...
        </div>

        <div v-else-if="loadError" class="px-2 py-4 text-sm text-error">
          {{ loadError }}
        </div>

        <div v-else-if="requiresLoginMessage" class="px-2 py-4 text-sm text-muted">
          Logga in för att se din chatthistorik.
        </div>

        <div v-else-if="groupedConversations.length === 0" class="px-2 py-4 text-sm text-muted">
          {{
            searchQuery.trim()
              ? `Inga chattar matchar "${searchQuery.trim()}".`
              : "Inga chattar hittades."
          }}
        </div>

        <div v-else class="space-y-4">
          <section v-for="group in groupedConversations" :key="group.label">
            <h3 class="px-3 pb-1.5 text-sm font-normal text-muted/60">
              {{ group.label }}
            </h3>

            <div class="space-y-0.5">
              <div v-for="item in group.items" :key="item.id"
                class="group flex items-center gap-1 rounded-md px-1 transition-colors" :class="item.id === chatStore.currentConversationId
                  ? 'bg-elevated'
                  : 'bg-transparent hover:bg-accented'
                  ">
                <button type="button" class="min-w-0 flex-1 cursor-pointer text-left px-2 py-1.5"
                  :disabled="isOpeningConversation || isDeletingConversation" @click="openConversation(item)">
                  <p class="text-sm truncate text-highlighted/90" :class="item.id === chatStore.currentConversationId
                    ? 'font-medium'
                    : 'font-normal'
                    ">
                    {{ item.title || "Ny chatt" }}
                  </p>
                  <p v-if="metaLabel(item.id)" class="text-xs truncate text-muted/70">
                    {{ metaLabel(item.id) }}
                  </p>
                </button>

                <UButton color="neutral" variant="ghost" square
                  class="size-7 shrink-0 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto transition-opacity hover:bg-transparent"
                  :disabled="isDeletingConversation" aria-label="Radera chatt" @click="askDeleteConversation(item)">
                  <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5 text-muted/60 hover:text-error" />
                </UButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
  </UModal>

  <UModal v-model:open="showDeleteConfirm" :dismissible="false" :close="false" title="Är du säker?"
    description="Den här chatten kommer att raderas permanent och kan inte ångras.">
    <template #footer="{ close }">
      <UButton color="neutral" variant="outline" :disabled="isDeletingConversation" @click="close()">
        Avbryt
      </UButton>
      <UButton color="error" :disabled="isDeletingConversation" @click="confirmDeleteConversation">
        {{ isDeletingConversation ? "Raderar..." : "Radera" }}
      </UButton>
    </template>
  </UModal>

  <UModal v-model:open="showDeleteAllConfirm" :dismissible="false" :close="false" title="Radera all historik?"
    :description="`Alla ${conversations.length} chattar kommer att raderas permanent. Det går inte att ångra.`">
    <template #footer="{ close }">
      <UButton color="neutral" variant="outline" :disabled="isDeletingAll" @click="close()">Avbryt</UButton>
      <UButton color="error" :disabled="isDeletingAll" @click="confirmDeleteAllConversations">
        {{ isDeletingAll ? "Raderar..." : `Radera alla` }}
      </UButton>
    </template>
  </UModal>
</template>
