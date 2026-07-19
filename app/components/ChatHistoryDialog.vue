<script setup lang="ts">
import type { Message } from "@/stores/chat";
import { toast } from "vue-sonner";
import { useChatStore } from "@/stores/chat";

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
}>();

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const chatStore = useChatStore();

// Global cache — kept i minne mellan öppningar och över komponent-remounts.
const conversations = useState<ConversationItem[]>(
  "chat-history-conversations",
  () => [],
);
const conversationMeta = useState<Record<string, ConversationMeta>>(
  "chat-history-meta",
  () => ({}),
);
const searchQuery = ref("");
const animateReveal = ref(false);
let revealTimer: ReturnType<typeof setTimeout> | null = null;
const searchInputRef = ref<HTMLInputElement | null>(null);
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

  // Med cachad data: uppdatera tyst i bakgrunden istället för att blanka listan.
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
    if (isInitialLoad) startReveal();
  } catch {
    // En misslyckad bakgrundsuppdatering behåller den cachade listan tyst.
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
    // Behåll ev. tidigare metadata vid fel.
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

    chatStore.messages = [...loadedMessages];
    chatStore.currentConversationId = item.id;
    chatStore.currentConversationTitle = item.title;
    chatStore.savedScrollPosition = 0;
    emit("update:open", false);
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
      chatStore.messages = [];
      chatStore.currentConversationId = null;
      chatStore.currentConversationTitle = null;
      chatStore.savedScrollPosition = 0;
      chatStore.setLoading(false);
    }

    toast.success("Chatten raderades", { position: "top-center" });

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
    chatStore.messages = [];
    chatStore.currentConversationId = null;
    chatStore.currentConversationTitle = null;
    chatStore.savedScrollPosition = 0;
    chatStore.setLoading(false);

    toast.success("Alla chattar raderades", { position: "top-center" });
    showDeleteAllConfirm.value = false;
  } catch {
    loadError.value = "Kunde inte radera alla chattar.";
  } finally {
    isDeletingAll.value = false;
  }
}

function startReveal() {
  animateReveal.value = true;
  if (revealTimer) clearTimeout(revealTimer);
  revealTimer = setTimeout(() => {
    animateReveal.value = false;
  }, 700);
}

const itemDelayIndex = computed(() => {
  const map: Record<string, number> = {};
  let index = 0;
  for (const group of groupedConversations.value) {
    for (const item of group.items) {
      map[item.id] = index;
      index += 1;
    }
  }
  return map;
});

function itemRevealStyle(id: string) {
  if (!animateReveal.value) return undefined;
  const index = itemDelayIndex.value[id] ?? 0;
  return { animationDelay: `${Math.min(index * 22, 260)}ms` };
}

watch(
  [() => props.open, userId],
  ([open]) => {
    if (!open) return;
    searchQuery.value = "";
    if (conversations.value.length > 0) startReveal();
    loadConversations();
  },
  { immediate: true },
);

// Ingen replay av intro-animationen medan användaren filtrerar.
watch(searchQuery, () => {
  animateReveal.value = false;
});

onUnmounted(() => {
  if (revealTimer) clearTimeout(revealTimer);
});

function focusSearch(event: Event) {
  event.preventDefault();
  searchInputRef.value?.focus();
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="sm:max-w-md p-0 gap-0 overflow-hidden"
      @open-auto-focus="focusSearch"
    >
      <DialogHeader class="px-4 pt-4 pb-0">
        <DialogTitle class="text-sm font-medium">Chatthistorik</DialogTitle>
        <DialogDescription class="sr-only">
          Sök och öppna tidigare chattar
        </DialogDescription>
      </DialogHeader>

      <div class="flex items-center gap-2 border-b px-4 py-2.5">
        <LucideSearch class="size-4 shrink-0 text-muted-foreground" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="Sök bland chattar..."
          class="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
        <Button
          v-if="conversations.length > 0"
          variant="ghost"
          size="icon"
          class="size-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          :disabled="isDeletingAll || isDeletingConversation"
          aria-label="Radera alla chattar"
          @click="showDeleteAllConfirm = true"
        >
          <LucideTrash2 class="w-3.5 h-3.5" />
        </Button>
      </div>

      <div class="max-h-[55vh] min-h-40 overflow-y-auto px-2 py-2 custom-scrollbar">
        <div v-if="isLoading" class="px-2 py-4 text-sm text-muted-foreground">
          Hämtar historik...
        </div>

        <div v-else-if="loadError" class="px-2 py-4 text-sm text-destructive">
          {{ loadError }}
        </div>

        <div
          v-else-if="requiresLoginMessage"
          class="px-2 py-4 text-sm text-muted-foreground"
        >
          Logga in för att se din chatthistorik.
        </div>

        <div
          v-else-if="groupedConversations.length === 0"
          class="px-2 py-4 text-sm text-muted-foreground"
        >
          {{
            searchQuery.trim()
              ? `Inga chattar matchar "${searchQuery.trim()}".`
              : "Inga chattar hittades."
          }}
        </div>

        <div v-else class="space-y-4">
          <section v-for="group in groupedConversations" :key="group.label">
            <h3
              class="px-3 pb-1.5 text-[13px] font-normal text-muted-foreground/60"
            >
              {{ group.label }}
            </h3>

            <div class="space-y-0.5">
              <div
                v-for="item in group.items"
                :key="item.id"
                class="group flex items-center gap-1 rounded-lg px-1 transition-colors"
                :class="[
                  item.id === chatStore.currentConversationId
                    ? 'bg-secondary'
                    : 'bg-transparent hover:bg-secondary/80',
                  animateReveal ? 'history-item-reveal' : '',
                ]"
                :style="itemRevealStyle(item.id)"
              >
                <button
                  type="button"
                  class="min-w-0 flex-1 cursor-pointer text-left px-2 py-1.5"
                  :disabled="isOpeningConversation || isDeletingConversation"
                  @click="openConversation(item)"
                >
                  <p
                    class="text-sm truncate text-foreground/90"
                    :class="
                      item.id === chatStore.currentConversationId
                        ? 'font-medium'
                        : 'font-normal'
                    "
                  >
                    {{ item.title || "Ny chatt" }}
                  </p>
                  <p
                    v-if="metaLabel(item.id)"
                    class="text-xs truncate text-muted-foreground/70"
                  >
                    {{ metaLabel(item.id) }}
                  </p>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  class="size-7 shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity hover:bg-transparent"
                  :disabled="isDeletingConversation"
                  aria-label="Radera chatt"
                  @click="askDeleteConversation(item)"
                >
                  <LucideTrash2
                    class="w-3.5 h-3.5 text-muted-foreground/60 hover:text-destructive"
                  />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="showDeleteConfirm">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Är du säker?</AlertDialogTitle>
        <AlertDialogDescription>
          Den här chatten kommer att raderas permanent och kan inte ångras.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeletingConversation">
          Avbryt
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          :disabled="isDeletingConversation"
          @click="confirmDeleteConversation"
        >
          {{ isDeletingConversation ? "Raderar..." : "Radera" }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog v-model:open="showDeleteAllConfirm">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Radera all historik?</AlertDialogTitle>
        <AlertDialogDescription>
          Alla {{ conversations.length }} chattar kommer att raderas permanent.
          Det går inte att ångra.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeletingAll">Avbryt</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          :disabled="isDeletingAll"
          @click="confirmDeleteAllConversations"
        >
          {{ isDeletingAll ? "Raderar..." : `Radera alla` }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<style scoped>
.history-item-reveal {
  opacity: 0;
  animation: history-item-in 240ms var(--ease-spring) forwards;
}

@keyframes history-item-in {
  from {
    opacity: 0;
    filter: blur(4px);
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}
</style>
