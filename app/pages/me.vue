<script setup lang="ts">
import { toast } from "vue-sonner";
import {
  COLORS,
  COLOR_BG_MAP,
  COLOR_BORDER_MAP,
} from "@/constants/avatarColors";

definePageMeta({
  layout: "profile",
});

useSeoMeta({
  title: "Min profil",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

type QuizActivityItem = {
  id: string;
  createdAt: string;
  courseCode: string;
  sourceCount: number;
  questionCount: number;
};

type ConversationActivityItem = {
  id: string;
  title: string;
  createdAt: string;
  courseCode: string | null;
  preview: string | null;
  messageCount: number;
};

const colorCookie = useCookie<string>("user-avatar-color");

const firstName = ref("");
const lastName = ref("");
const firstNameInput = ref("");
const lastNameInput = ref("");
const profileSaving = ref(false);
const profileSaved = ref(false);
const signOutLoading = ref(false);
const createdAt = ref<string | null>(null);
const profileLoading = ref(true);
const avatarUrl = ref<string | null>(null);
const avatarUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const activityLoading = ref(false);
const quizCount = ref(0);
const conversationCount = ref(0);
const chatMessageCount = ref(0);
const recentQuizzes = ref<QuizActivityItem[]>([]);
const recentConversations = ref<ConversationActivityItem[]>([]);

const currentUserId = computed(
  () =>
    ((user.value as any)?.id ?? (user.value as any)?.sub ?? null) as
      | string
      | null,
);

const avatarColor = computed(() => colorCookie.value as string);

const initial = computed(() => {
  if (firstName.value && lastName.value) {
    return (
      (firstName.value[0] ?? "") + (lastName.value[0] ?? "")
    ).toUpperCase();
  }
  if (firstName.value) return (firstName.value[0] ?? "").toUpperCase();
  return user.value?.email?.[0]?.toUpperCase() ?? "?";
});

const memberSince = computed(() => {
  if (!createdAt.value) return "—";
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(createdAt.value));
});

const hasChanges = computed(() => {
  return (
    firstNameInput.value.trim() !== firstName.value ||
    lastNameInput.value.trim() !== lastName.value
  );
});

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function loadActivity(userId: string) {
  activityLoading.value = true;

  try {
    const [quizRes, conversationsRes] = await Promise.all([
      (supabase as any)
        .from("ai_quiz_logs")
        .select("id, created_at, course_code, source_count, quiz", {
          count: "exact",
        })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
      (supabase as any)
        .from("conversations")
        .select("id, title, created_at", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    quizCount.value = quizRes.count ?? 0;
    conversationCount.value = conversationsRes.count ?? 0;

    const quizRows = Array.isArray(quizRes.data) ? quizRes.data : [];
    recentQuizzes.value = quizRows.map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      courseCode: row.course_code ?? "—",
      sourceCount: row.source_count ?? 0,
      questionCount: row.quiz?.quiz?.questions?.length ?? 0,
    }));

    const conversationRows = Array.isArray(conversationsRes.data)
      ? conversationsRes.data
      : [];
    const conversationIds = conversationRows
      .map((row: any) => row.id)
      .filter(Boolean);

    if (conversationIds.length === 0) {
      chatMessageCount.value = 0;
      recentConversations.value = [];
      return;
    }

    const chatLogsRes = await (supabase as any)
      .from("ai_chat_logs")
      .select("conversation_id, content, role, created_at, course_code", {
        count: "exact",
      })
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    chatMessageCount.value = chatLogsRes.count ?? 0;

    const conversationMeta = new Map<
      string,
      {
        courseCode: string | null;
        preview: string | null;
        messageCount: number;
      }
    >();

    const logs = Array.isArray(chatLogsRes.data) ? chatLogsRes.data : [];
    for (const row of logs) {
      const id = row.conversation_id;
      if (!id) continue;

      const existing = conversationMeta.get(id) ?? {
        courseCode: null,
        preview: null,
        messageCount: 0,
      };

      existing.messageCount += 1;

      if (!existing.courseCode && row.course_code) {
        existing.courseCode = row.course_code;
      }

      if (!existing.preview && row.role === "user" && row.content) {
        existing.preview = row.content;
      }

      conversationMeta.set(id, existing);
    }

    recentConversations.value = conversationRows.map((row: any) => {
      const meta = conversationMeta.get(row.id);
      return {
        id: row.id,
        title: row.title || "Ny konversation",
        createdAt: row.created_at,
        courseCode: meta?.courseCode ?? null,
        preview: meta?.preview ?? null,
        messageCount: meta?.messageCount ?? 0,
      };
    });
  } finally {
    activityLoading.value = false;
  }
}

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser();
  createdAt.value = authData.user?.created_at ?? null;

  if (!currentUserId.value) {
    profileLoading.value = false;
    return;
  }

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("first_name, last_name, avatar_color, avatar_url")
    .eq("id", currentUserId.value)
    .single();

  if (profile) {
    firstName.value = profile.first_name ?? "";
    lastName.value = profile.last_name ?? "";
    firstNameInput.value = firstName.value;
    lastNameInput.value = lastName.value;
    if (profile.avatar_color) colorCookie.value = profile.avatar_color;
    avatarUrl.value = profile.avatar_url ?? null;
  }

  if (!colorCookie.value) {
    colorCookie.value = COLORS[
      Math.floor(Math.random() * COLORS.length)
    ] as string;
  }

  await loadActivity(currentUserId.value);

  profileLoading.value = false;
});

const setColor = async (color: string) => {
  colorCookie.value = color;
  if (!currentUserId.value) return;
  await (supabase as any)
    .from("profiles")
    .update({ avatar_color: color })
    .eq("id", currentUserId.value);
};

async function saveProfile() {
  if (!currentUserId.value || !hasChanges.value) return;
  profileSaving.value = true;

  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      first_name: firstNameInput.value.trim() || null,
      last_name: lastNameInput.value.trim() || null,
    })
    .eq("id", currentUserId.value);

  profileSaving.value = false;

  if (error) {
    toast.error("Kunde inte spara profilen", {
      description: "Försök igen om en stund.",
    });
    return;
  }

  firstName.value = firstNameInput.value.trim();
  lastName.value = lastNameInput.value.trim();
  profileSaved.value = true;
  setTimeout(() => (profileSaved.value = false), 2000);
  toast.success("Profilen sparad!");
}

async function handleAvatarClick() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file || !currentUserId.value) return;

  avatarUploading.value = true;

  const ext = file.name.split(".").pop();
  const path = `${currentUserId.value}/avatar.${ext}`;

  const { error: uploadError } = await (supabase as any).storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    avatarUploading.value = false;
    toast.error("Kunde inte ladda upp bilden", {
      description: "Försök igen om en stund.",
    });
    return;
  }

  const { data: urlData } = (supabase as any).storage
    .from("avatars")
    .getPublicUrl(path);

  const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
  avatarUrl.value = publicUrl;

  await (supabase as any)
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", currentUserId.value);

  avatarUploading.value = false;
  toast.success("Profilbild uppdaterad!");
}

async function handleSignOut() {
  signOutLoading.value = true;
  await supabase.auth.signOut();
  await navigateTo("/", { replace: true });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <template v-if="profileLoading">
      <section
        class="relative overflow-hidden rounded-3xl border border-border/70 p-8"
      >
        <div class="h-8 w-40 rounded bg-muted animate-pulse mx-auto" />
        <div
          class="h-28 w-28 rounded-full bg-muted animate-pulse mx-auto mt-5"
        />
        <div class="h-4 w-56 rounded bg-muted animate-pulse mx-auto mt-4" />
        <div class="grid grid-cols-3 gap-3 mt-6">
          <div
            v-for="i in 3"
            :key="i"
            class="h-18 rounded-xl bg-muted animate-pulse"
          />
        </div>
      </section>
    </template>

    <template v-else>
      <section
        class="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-8"
      >
        <div class="relative z-10 flex flex-col items-center text-center">
          <button
            class="relative mt-4 cursor-pointer shrink-0 group"
            :disabled="avatarUploading"
            @click="handleAvatarClick"
          >
            <div
              v-if="avatarUrl"
              :class="[
                'h-30 w-30 sm:h-36 sm:w-36 rounded-full overflow-hidden border-4 shadow-lg',
                COLOR_BORDER_MAP[avatarColor],
              ]"
            >
              <img
                :src="avatarUrl"
                alt="Avatar"
                class="h-full w-full object-cover"
                :class="[
                  avatarUploading
                    ? 'opacity-40'
                    : 'group-hover:opacity-85 transition-opacity',
                ]"
              />
            </div>

            <div
              v-else
              :class="[
                'h-30 w-30 sm:h-36 sm:w-36 rounded-full flex items-center justify-center text-white text-5xl font-semibold border-4 shadow-lg',
                avatarUploading
                  ? 'opacity-40'
                  : 'group-hover:opacity-85 transition-opacity',
                COLOR_BG_MAP[avatarColor],
                COLOR_BORDER_MAP[avatarColor],
              ]"
            >
              {{ initial }}
            </div>

            <div
              v-if="avatarUploading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <LucideLoader2
                class="h-7 w-7 text-white animate-spin drop-shadow"
              />
            </div>

            <div
              class="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm"
            >
              <LucideLoader2
                v-if="avatarUploading"
                class="h-4 w-4 animate-spin text-muted-foreground"
              />
              <LucidePlus v-else class="h-4 w-4 text-foreground" />
            </div>
          </button>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />

          <h1 class="mt-4 text-2xl font-semibold">
            {{
              [firstName, lastName].filter(Boolean).join(" ") || "Din profil"
            }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ user?.email }}</p>
          <p class="mt-1 text-xs text-muted-foreground/80">
            Medlem sedan {{ memberSince }}
          </p>

          <div
            class="mt-6 grid w-full max-w-2xl grid-cols-3 gap-2 sm:gap-3"
            :class="activityLoading ? 'opacity-70' : ''"
          >
            <div
              class="rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4"
            >
              <p class="text-[11px] text-muted-foreground">Quiz</p>
              <p class="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
                {{ activityLoading ? "..." : quizCount }}
              </p>
            </div>
            <div
              class="rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4"
            >
              <p class="text-[11px] text-muted-foreground">Samtal</p>
              <p class="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
                {{ activityLoading ? "..." : conversationCount }}
              </p>
            </div>
            <div
              class="rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4"
            >
              <p class="text-[11px] text-muted-foreground">Meddelanden</p>
              <p class="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
                {{ activityLoading ? "..." : chatMessageCount }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-border/70 bg-card">
          <div class="px-4 py-3 border-b border-border/70">
            <p class="text-sm font-medium">Senaste quiz</p>
            <p class="text-xs text-muted-foreground">
              Snabbt tillbaka till tidigare quiz
            </p>
          </div>

          <div v-if="recentQuizzes.length === 0" class="px-4 py-5">
            <p class="text-xs text-muted-foreground">Inga quiz sparade ännu.</p>
          </div>

          <div v-else class="divide-y divide-border/60">
            <NuxtLink
              v-for="item in recentQuizzes"
              :key="item.id"
              :to="`/quiz/${item.courseCode}`"
              class="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium">{{ item.courseCode }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ item.sourceCount }} tentor ·
                  {{ item.questionCount }} frågor
                </p>
              </div>
              <p class="text-[11px] text-muted-foreground whitespace-nowrap">
                {{ formatDateTime(item.createdAt) }}
              </p>
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-2xl border border-border/70 bg-card">
          <div class="px-4 py-3 border-b border-border/70">
            <p class="text-sm font-medium">Senaste konversationer</p>
            <p class="text-xs text-muted-foreground">
              Vad du nyligen har frågat om
            </p>
          </div>

          <div v-if="recentConversations.length === 0" class="px-4 py-5">
            <p class="text-xs text-muted-foreground">
              Inga konversationer ännu.
            </p>
          </div>

          <div v-else class="divide-y divide-border/60">
            <div
              v-for="item in recentConversations"
              :key="item.id"
              class="px-4 py-3"
            >
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium truncate">{{ item.title }}</p>
                <span
                  v-if="item.courseCode"
                  class="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {{ item.courseCode }}
                </span>
              </div>
              <p class="mt-1 text-xs text-muted-foreground line-clamp-2">
                {{ item.preview || "Ingen förhandsvisning tillgänglig." }}
              </p>
              <p class="mt-1 text-[11px] text-muted-foreground">
                {{ item.messageCount }} meddelanden ·
                {{ formatDateTime(item.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h2
          class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          Inställningar
        </h2>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="rounded-2xl border border-border/70 bg-card p-5">
            <p class="text-sm font-medium mb-3">Namn</p>
            <div class="space-y-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-muted-foreground">Förnamn</label>
                <input
                  v-model="firstNameInput"
                  type="text"
                  placeholder="Ditt förnamn"
                  class="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs text-muted-foreground">Efternamn</label>
                <input
                  v-model="lastNameInput"
                  type="text"
                  placeholder="Ditt efternamn"
                  class="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                />
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <Button
                size="sm"
                :disabled="profileSaving || !hasChanges"
                @click="saveProfile"
              >
                <LucideLoader2
                  v-if="profileSaving"
                  class="w-4 h-4 animate-spin"
                />
                <LucideCheck v-else-if="profileSaved" class="w-4 h-4" />
                <span>{{ profileSaved ? "Sparat!" : "Spara" }}</span>
              </Button>
            </div>
          </div>

          <div
            class="rounded-2xl border border-border/70 bg-card divide-y divide-border/70"
          >
            <div class="p-5">
              <p class="text-sm font-medium mb-3">Kontodetaljer</p>
              <div class="space-y-2 text-sm">
                <p class="flex items-center justify-between gap-3">
                  <span class="text-muted-foreground">E-post</span>
                  <span class="font-medium truncate">{{
                    user?.email ?? "—"
                  }}</span>
                </p>
                <p class="flex items-center justify-between gap-3">
                  <span class="text-muted-foreground">Registrerad</span>
                  <span class="font-medium">{{ memberSince }}</span>
                </p>
                <p class="flex items-center justify-between gap-3">
                  <span class="text-muted-foreground">Kontostatus</span>
                  <span
                    class="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full"
                    >Aktiv</span
                  >
                </p>
              </div>
            </div>

            <div class="p-5">
              <p class="text-sm font-medium mb-3">Avatarfärg</p>
              <div class="flex items-center gap-2">
                <button
                  v-for="color in COLORS"
                  :key="color"
                  :class="[
                    'w-6 h-6 rounded-full cursor-pointer transition-all',
                    COLOR_BG_MAP[color],
                    colorCookie === color
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                      : 'opacity-60 hover:opacity-100',
                  ]"
                  @click="setColor(color)"
                />
              </div>
            </div>

            <div class="p-5 flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium">Logga ut</p>
                <p class="text-xs text-muted-foreground">
                  Avsluta din nuvarande session
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                :disabled="signOutLoading"
                @click="handleSignOut"
              >
                <LucideLoader2
                  v-if="signOutLoading"
                  class="w-4 h-4 animate-spin"
                />
                <LucideLogOut v-else class="w-4 h-4" />
                <span v-if="!signOutLoading">Logga ut</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
