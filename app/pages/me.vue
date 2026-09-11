<script setup lang="ts">
import {
    COLORS,
    COLOR_BG_MAP,
    COLOR_BORDER_MAP,
} from "@/constants/avatarColors";

const toast = useToast();

definePageMeta({
    layout: "profile",
});

useSeoMeta({
    title: "Min profil",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const chatStore = useChatStore();

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

async function loadActivity(userId: string) {
    activityLoading.value = true;

    try {
        const [quizRes, conversationsRes] = await Promise.all([
            (supabase as any)
                .from("ai_quiz_logs")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId),
            (supabase as any)
                .from("conversations")
                .select("id", { count: "exact" })
                .eq("user_id", userId),
        ]);

        quizCount.value = quizRes.count ?? 0;
        conversationCount.value = conversationsRes.count ?? 0;

        const conversationIds = (
            Array.isArray(conversationsRes.data) ? conversationsRes.data : []
        )
            .map((row: any) => row.id)
            .filter(Boolean);

        if (conversationIds.length === 0) {
            chatMessageCount.value = 0;
            return;
        }

        const chatLogsRes = await (supabase as any)
            .from("ai_chat_logs")
            .select("id", { count: "exact", head: true })
            .in("conversation_id", conversationIds);

        chatMessageCount.value = chatLogsRes.count ?? 0;
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
        toast.add({
            title: "Kunde inte spara profilen",
            description: "Försök igen om en stund.",
            color: "error",
        });
        return;
    }

    firstName.value = firstNameInput.value.trim();
    lastName.value = lastNameInput.value.trim();
    profileSaved.value = true;
    setTimeout(() => (profileSaved.value = false), 2000);
    toast.add({ title: "Profilen sparad!", color: "success" });
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
        toast.add({
            title: "Kunde inte ladda upp bilden",
            description: "Försök igen om en stund.",
            color: "error",
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
    toast.add({ title: "Profilbild uppdaterad!", color: "success" });
}

async function handleSignOut() {
    signOutLoading.value = true;
    chatStore.resetOnLogout();
    await supabase.auth.signOut();
    await navigateTo("/", { replace: true });
}
</script>

<template>
    <div class="flex flex-col gap-8">
        <template v-if="profileLoading">
            <section
                class="relative overflow-hidden rounded-3xl bg-elevated p-8"
            >
                <div class="h-8 w-40 rounded-md bg-muted animate-pulse mx-auto" />
                <div
                    class="h-28 w-28 rounded-full bg-muted animate-pulse mx-auto mt-5"
                />
                <div
                    class="h-4 w-56 rounded-md bg-muted animate-pulse mx-auto mt-4"
                />
                <div class="grid grid-cols-3 gap-3 mt-6">
                    <div
                        v-for="i in 3"
                        :key="i"
                        class="h-18 rounded-md bg-muted animate-pulse"
                    />
                </div>
            </section>
        </template>

        <template v-else>
            <section class="relative p-6 sm:p-8">
                <div
                    class="relative z-10 flex flex-col items-center text-center"
                >
                    <button
                        class="relative mt-4 cursor-pointer shrink-0 group"
                        :disabled="avatarUploading"
                        @click="handleAvatarClick"
                    >
                        <div
                            v-if="avatarUrl"
                            :class="[
                                'relative h-30 w-30 sm:h-36 sm:w-36 rounded-full overflow-hidden border-4',
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
                                'relative h-30 w-30 sm:h-36 sm:w-36 rounded-full flex items-center justify-center text-white text-5xl font-medium border-4',
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
                            class="absolute inset-0 flex items-center justify-center z-10"
                        >
                            <UIcon name="i-lucide-loader-circle"
                                class="h-7 w-7 text-white animate-spin" />
                        </div>

                        <div
                            class="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-default border border-default flex items-center justify-center z-10"
                        >
                            <UIcon name="i-lucide-loader-circle"
                                v-if="avatarUploading"
                                class="h-4 w-4 animate-spin text-muted" />
                            <UIcon name="i-lucide-plus"
                                v-else
                                class="h-4 w-4 text-highlighted" />
                        </div>
                    </button>

                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="hidden"
                        @change="handleFileChange"
                    />

                    <h1 class="mt-4 text-2xl font-medium">
                        {{
                            [firstName, lastName].filter(Boolean).join(" ") ||
                            "Din profil"
                        }}
                    </h1>

                    <p class="mt-2 text-sm text-muted">
                        {{ user?.email }}
                    </p>
                    <p class="text-xs text-muted/80">
                        Medlem sedan {{ memberSince }}
                    </p>

                    <div class="mt-6 w-full max-w-2xl">
                        <div
                            class="rounded-md border border-default bg-elevated p-5 sm:p-6"
                        >
                            <div class="grid grid-cols-3 gap-2 sm:gap-3">
                                <div
                                    class="rounded-md border border-default bg-default/70 p-3 sm:p-4"
                                >
                                    <p
                                        class="text-2xs text-muted"
                                    >
                                        Quiz
                                    </p>
                                    <p
                                        class="mt-1 text-xl sm:text-2xl font-medium tabular-nums"
                                    >
                                        {{
                                            activityLoading ? "..." : quizCount
                                        }}
                                    </p>
                                </div>
                                <div
                                    class="rounded-md border border-default bg-default/70 p-3 sm:p-4"
                                >
                                    <p
                                        class="text-2xs text-muted"
                                    >
                                        AI Chattar
                                    </p>
                                    <p
                                        class="mt-1 text-xl sm:text-2xl font-medium tabular-nums"
                                    >
                                        {{
                                            activityLoading
                                                ? "..."
                                                : conversationCount
                                        }}
                                    </p>
                                </div>
                                <div
                                    class="rounded-md border border-default bg-default/70 p-3 sm:p-4"
                                >
                                    <p
                                        class="text-2xs text-muted"
                                    >
                                        Meddelanden
                                    </p>
                                    <p
                                        class="mt-1 text-xl sm:text-2xl font-medium tabular-nums"
                                    >
                                        {{
                                            activityLoading
                                                ? "..."
                                                : chatMessageCount
                                        }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="flex flex-col gap-3">
                <h2
                    class="text-xs font-medium text-muted uppercase tracking-wide"
                >
                    Inställningar
                </h2>

                <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div class="rounded-md border border-default bg-elevated p-5">
                        <p class="text-sm font-medium mb-3">Namn</p>
                        <div class="space-y-3">
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs text-muted"
                                    >Förnamn</label
                                >
                                <input
                                    v-model="firstNameInput"
                                    type="text"
                                    placeholder="Ditt förnamn"
                                    class="h-10 rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-inverted/30"
                                />
                            </div>
                            <div class="flex flex-col gap-1.5">
                                <label class="text-xs text-muted"
                                    >Efternamn</label
                                >
                                <input
                                    v-model="lastNameInput"
                                    type="text"
                                    placeholder="Ditt efternamn"
                                    class="h-10 rounded-md border border-default bg-default px-3 text-sm outline-none focus:border-inverted/30"
                                />
                            </div>
                        </div>

                        <div class="mt-4 flex justify-end">
                            <UButton
                                size="sm"
                                :disabled="profileSaving || !hasChanges"
                                @click="saveProfile"
                            >
                                <UIcon name="i-lucide-loader-circle"
                                    v-if="profileSaving"
                                    class="w-4 h-4 animate-spin" />
                                <UIcon name="i-lucide-check"
                                    v-else-if="profileSaved"
                                    class="w-4 h-4" />
                                <span>{{
                                    profileSaved ? "Sparat!" : "Spara"
                                }}</span>
                            </UButton>
                        </div>
                    </div>

                    <div
                        class="rounded-md border border-default bg-elevated divide-y divide-default/60"
                    >
                        <div class="p-5">
                            <p class="text-sm font-medium mb-3">
                                Kontodetaljer
                            </p>
                            <div class="space-y-2 text-sm">
                                <p
                                    class="flex items-center justify-between gap-3"
                                >
                                    <span class="text-muted"
                                        >E-post</span
                                    >
                                    <span class="font-medium truncate">{{
                                        user?.email ?? "—"
                                    }}</span>
                                </p>
                                <p
                                    class="flex items-center justify-between gap-3"
                                >
                                    <span class="text-muted"
                                        >Registrerad</span
                                    >
                                    <span class="font-medium">{{
                                        memberSince
                                    }}</span>
                                </p>
                                <p
                                    class="flex items-center justify-between gap-3"
                                >
                                    <span class="text-muted"
                                        >Kontostatus</span
                                    >
                                    <span
                                        class="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-sm"
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
                                        'w-6 h-6 rounded-full cursor-pointer transition-colors duration-150 ease-spring',
                                        COLOR_BG_MAP[color],
                                        colorCookie === color
                                            ? 'ring-2 ring-offset-2 ring-offset-background ring-inverted scale-110'
                                            : 'opacity-60 hover:opacity-100',
                                    ]"
                                    @click="setColor(color)"
                                />
                            </div>
                        </div>

                        <div
                            class="p-5 flex items-center justify-between gap-3"
                        >
                            <div>
                                <p class="text-sm font-medium">Logga ut</p>
                                <p class="text-xs text-muted">
                                    Avsluta din nuvarande session
                                </p>
                            </div>
                            <UButton
                                color="neutral"
                                variant="outline"
                                size="sm"
                                :disabled="signOutLoading"
                                @click="handleSignOut"
                            >
                                <UIcon name="i-lucide-loader-circle"
                                    v-if="signOutLoading"
                                    class="w-4 h-4 animate-spin" />
                                <UIcon name="i-lucide-log-out" v-else class="w-4 h-4" />
                                <span v-if="!signOutLoading">Logga ut</span>
                            </UButton>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>
