<script setup lang="ts">
import type { Message } from "@/stores/chat";
import { toast } from "vue-sonner";
import { useChatStore } from "@/stores/chat";

type ConversationItem = {
  id: string;
  title: string;
  createdAt: string;
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

const conversations = ref<ConversationItem[]>([]);
const isLoading = ref(false);
const isOpeningConversation = ref(false);
const isDeletingConversation = ref(false);
const isDeletingAll = ref(false);
const loadError = ref<string | null>(null);
const contentReady = ref(false);
const showDeleteConfirm = ref(false);
const showDeleteAllConfirm = ref(false);
const pendingDeleteConversation = ref<ConversationItem | null>(null);
let contentRevealTimer: ReturnType<typeof setTimeout> | null = null;

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

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const groupedConversations = computed(() => {
  const order = ["Idag", "Igår", "Denna veckan", "Denna månaden", "Äldre"];
  const groups = new Map<string, ConversationItem[]>();

  for (const item of conversations.value) {
    const key = getGroupLabel(item.createdAt);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }

  return order
    .map((label) => ({ label, items: groups.get(label) ?? [] }))
    .filter((group) => group.items.length > 0);
});

const itemDelayIndex = computed(() => {
  const indexMap = new Map<string, number>();
  let index = 0;

  for (const group of groupedConversations.value) {
    for (const item of group.items) {
      indexMap.set(item.id, index);
      index += 1;
    }
  }

  return indexMap;
});

function itemMotionStyle(id: string) {
  const index = itemDelayIndex.value.get(id) ?? 0;
  const baseDelay = 90;
  const delay =
    props.open && contentReady.value
      ? baseDelay + Math.min(index * 18, 180)
      : 0;
  const duration = 170;
  return {
    transitionDelay: `${delay}ms`,
    transitionDuration: `${duration}ms`,
  };
}

async function loadConversations() {
  if (!userId.value) {
    conversations.value = [];
    return;
  }

  isLoading.value = true;
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
  } catch {
    loadError.value = "Kunde inte hämta konversationshistorik.";
    conversations.value = [];
  } finally {
    isLoading.value = false;
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

const sidebarWidth = ref(320);
const isResizing = ref(false);

function startResizing(e: MouseEvent) {
  isResizing.value = true;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", stopResizing);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

function handleMouseMove(e: MouseEvent) {
  if (!isResizing.value) return;
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth > 240 && newWidth < 600) {
    sidebarWidth.value = newWidth;
  }
}

function stopResizing() {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", stopResizing);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

watch(
  [() => props.open, userId],
  ([open]) => {
    if (contentRevealTimer) {
      clearTimeout(contentRevealTimer);
      contentRevealTimer = null;
    }

    if (!open) {
      contentReady.value = false;
      return;
    }

    loadConversations();
    contentReady.value = false;
    contentRevealTimer = setTimeout(() => {
      contentReady.value = true;
    }, 110);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (contentRevealTimer) {
    clearTimeout(contentRevealTimer);
    contentRevealTimer = null;
  }
});
</script>

<template>
  <div class="absolute inset-0 z-90 transition-opacity duration-200 ease-out" :class="open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
    " aria-hidden="true" @click="emit('update:open', false)" />

  <aside
    class="absolute inset-y-0 right-0 z-100 h-full border-l border-border bg-background"
    :class="[
      open ? 'translate-x-0' : 'translate-x-full',
      !isResizing ? 'transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)]' : ''
    ]"
    :style="{ width: `${sidebarWidth}px` }"
    aria-label="Konversationshistorik">
    <!-- Resize Handler -->
    <div
      class="absolute left-0 top-0 bottom-0 w-4 cursor-col-resize z-[60] group/resizer -translate-x-1/2 flex items-center justify-center"
      @mousedown="startResizing"
    >
      <div class="absolute inset-y-0 left-1/2 w-[1px] opacity-0 group-hover/resizer:opacity-100 bg-primary/30 transition-opacity" />
      <div class="w-1 h-8 rounded-full bg-primary/40 group-hover/resizer:bg-primary transition-colors" />
    </div>
    <div class="flex h-full min-h-0 flex-col">
      <div class="border-b px-4 py-3 flex items-center justify-between gap-2">
        <h2 class="text-sm font-medium">Chatthistorik</h2>
        <div class="flex items-center gap-1">
          <Button v-if="conversations.length > 0" variant="ghost" size="icon"
            class="size-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            :disabled="isDeletingAll || isDeletingConversation" @click="showDeleteAllConfirm = true">
            <LucideTrash2 class="w-3.5 h-3.5"  />
          </Button>
          <Button variant="ghost" size="icon" class="size-7 shrink-0" @click="emit('update:open', false)">
            <LucideX class="w-4 h-4"  />
          </Button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto px-2 py-2 custom-scrollbar transition-opacity duration-150 ease-out"
        :class="open && contentReady ? 'opacity-100' : 'opacity-0'">
        <div v-if="isLoading" class="px-2 py-4 text-sm text-muted-foreground">
          Hämtar historik...
        </div>

        <div v-else-if="loadError" class="px-2 py-4 text-sm text-destructive">
          {{ loadError }}
        </div>

        <div v-else-if="requiresLoginMessage" class="px-2 py-4 text-sm text-muted-foreground">
          Logga in för att se din chatthistorik.
        </div>

        <div v-else-if="groupedConversations.length === 0" class="px-2 py-4 text-sm text-muted-foreground">
          Inga chattar hittades.
        </div>

        <div v-else class="space-y-6">
          <section v-for="group in groupedConversations" :key="group.label">
            <h3 class="px-4 pb-2 text-[13px] font-normal text-muted-foreground/60">
              {{ group.label }}
            </h3>

            <div class="space-y-0.5 px-2">
              <div v-for="item in group.items" :key="item.id"
                class="group rounded-full transition-[opacity,background-color] ease-out"
                :class="[
                  item.id === chatStore.currentConversationId
                    ? 'bg-secondary'
                    : 'bg-transparent hover:bg-secondary/40',
                  open && contentReady ? 'opacity-100' : 'opacity-0',
                ]" :style="itemMotionStyle(item.id)">
                <div class="flex items-center gap-1 px-2">
                  <button class="min-w-0 flex-1 cursor-pointer text-left rounded-full py-1.5 px-2"
                    :disabled="isOpeningConversation || isDeletingConversation" @click="openConversation(item)">
                    <p class="text-[13px] truncate text-foreground/90"
                      :class="item.id === chatStore.currentConversationId ? 'font-semibold' : 'font-normal'">
                      {{ item.title || "Ny chatt" }}
                    </p>
                  </button>

                  <Button variant="ghost" size="icon"
                    class="size-7 shrink-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity hover:bg-transparent"
                    :disabled="isDeletingConversation" @click="askDeleteConversation(item)">
                    <LucideTrash2 class="w-3.5 h-3.5 text-muted-foreground/60 hover:text-destructive"  />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </aside>

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
        <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" :disabled="isDeletingConversation"
          @click="confirmDeleteConversation">
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
        <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" :disabled="isDeletingAll"
          @click="confirmDeleteAllConversations">
          {{ isDeletingAll ? "Raderar..." : `Radera alla` }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
