<script setup lang="ts">
definePageMeta({
  layout: "profile",
});

useSeoMeta({
  title: "Min profil",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

const COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
];

const colorCookie = useCookie<string>("user-avatar-color");

const firstName = ref("");
const lastName = ref("");
const firstNameInput = ref("");
const lastNameInput = ref("");
const profileSaving = ref(false);
const profileSaved = ref(false);
const signOutLoading = ref(false);
const createdAt = ref<string | null>(null);

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

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser();
  createdAt.value = authData.user?.created_at ?? null;

  if (!user.value?.id) return;

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("first_name, last_name, avatar_color")
    .eq("id", user.value.id)
    .single();

  if (profile) {
    firstName.value = profile.first_name ?? "";
    lastName.value = profile.last_name ?? "";
    firstNameInput.value = firstName.value;
    lastNameInput.value = lastName.value;
    if (profile.avatar_color) colorCookie.value = profile.avatar_color;
  }

  if (!colorCookie.value) {
    colorCookie.value = COLORS[
      Math.floor(Math.random() * COLORS.length)
    ] as string;
  }
});

const setColor = async (color: string) => {
  colorCookie.value = color;
  if (!user.value?.id) return;
  await (supabase as any)
    .from("profiles")
    .update({ avatar_color: color })
    .eq("id", user.value.id);
};

async function saveProfile() {
  if (!user.value?.id || !hasChanges.value) return;
  profileSaving.value = true;

  await (supabase as any)
    .from("profiles")
    .update({
      first_name: firstNameInput.value.trim() || null,
      last_name: lastNameInput.value.trim() || null,
    })
    .eq("id", user.value.id);

  firstName.value = firstNameInput.value.trim();
  lastName.value = lastNameInput.value.trim();
  profileSaving.value = false;
  profileSaved.value = true;
  setTimeout(() => (profileSaved.value = false), 2000);
}

async function handleSignOut() {
  signOutLoading.value = true;
  await supabase.auth.signOut();
  await navigateTo("/", { replace: true });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold">Min profil</h1>
      <p class="text-sm text-muted-foreground">
        Hantera ditt konto och inställningar
      </p>
    </div>

    <section class="flex flex-col gap-3">
      <h2
        class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Konto
      </h2>
      <div class="border border-border rounded-xl p-5 flex items-center gap-4">
        <div
          :class="[
            'w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0',
            avatarColor,
          ]"
        >
          {{ initial }}
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <p
            v-if="firstName || lastName"
            class="text-base font-semibold truncate"
          >
            {{ [firstName, lastName].filter(Boolean).join(" ") }}
          </p>
          <p
            class="text-sm truncate"
            :class="
              firstName || lastName ? 'text-muted-foreground' : 'font-medium'
            "
          >
            {{ user?.email }}
          </p>
          <p class="text-xs text-muted-foreground">
            Medlem sedan {{ memberSince }}
          </p>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2
        class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Namn
      </h2>
      <div class="border border-border rounded-xl divide-y divide-border">
        <div class="flex items-center justify-between px-5 py-3.5 gap-4">
          <div
            class="flex items-center gap-3 text-sm text-muted-foreground shrink-0"
          >
            <LucideUser class="w-4 h-4 shrink-0" />
            <span>Förnamn</span>
          </div>
          <input
            v-model="firstNameInput"
            type="text"
            placeholder="Ditt förnamn"
            class="text-sm font-medium text-right bg-transparent outline-none min-w-0 flex-1 placeholder:text-muted-foreground/40"
          />
        </div>
        <div class="flex items-center justify-between px-5 py-3.5 gap-4">
          <div
            class="flex items-center gap-3 text-sm text-muted-foreground shrink-0"
          >
            <LucideUser class="w-4 h-4 shrink-0" />
            <span>Efternamn</span>
          </div>
          <input
            v-model="lastNameInput"
            type="text"
            placeholder="Ditt efternamn"
            class="text-sm font-medium text-right bg-transparent outline-none min-w-0 flex-1 placeholder:text-muted-foreground/40"
          />
        </div>
        <div class="px-5 py-3.5 flex justify-end">
          <Button
            size="sm"
            :disabled="profileSaving || !hasChanges"
            @click="saveProfile"
          >
            <LucideLoader2 v-if="profileSaving" class="w-4 h-4 animate-spin" />
            <LucideCheck v-else-if="profileSaved" class="w-4 h-4" />
            <span>{{ profileSaved ? "Sparat!" : "Spara" }}</span>
          </Button>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2
        class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Kontodetaljer
      </h2>
      <div class="border border-border rounded-xl divide-y divide-border">
        <div class="flex items-center justify-between px-5 py-3.5">
          <div class="flex items-center gap-3 text-sm text-muted-foreground">
            <LucideMail class="w-4 h-4 shrink-0" />
            <span>E-post</span>
          </div>
          <span class="text-sm font-medium">{{ user?.email ?? "—" }}</span>
        </div>
        <div class="flex items-center justify-between px-5 py-3.5">
          <div class="flex items-center gap-3 text-sm text-muted-foreground">
            <LucideCalendar class="w-4 h-4 shrink-0" />
            <span>Registrerad</span>
          </div>
          <span class="text-sm font-medium">{{ memberSince }}</span>
        </div>
        <div class="flex items-center justify-between px-5 py-3.5">
          <div class="flex items-center gap-3 text-sm text-muted-foreground">
            <LucideShieldCheck class="w-4 h-4 shrink-0" />
            <span>Kontostatus</span>
          </div>
          <span
            class="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full"
            >Aktiv</span
          >
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2
        class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Utseende
      </h2>
      <div class="border border-border rounded-xl divide-y divide-border">
        <div class="flex items-center justify-between px-5 py-3.5">
          <div class="flex items-center gap-3 text-sm">
            <LucidePalette class="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>Avatarfärg</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-for="color in COLORS"
              :key="color"
              :class="[
                'w-5 h-5 rounded-full transition-all',
                color,
                colorCookie === color
                  ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                  : 'opacity-60 hover:opacity-100',
              ]"
              @click="setColor(color)"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2
        class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
      >
        Sessionshantering
      </h2>
      <div
        class="border border-border rounded-xl p-5 flex items-center justify-between"
      >
        <div class="flex flex-col gap-0.5">
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
          <LucideLoader2 v-if="signOutLoading" class="w-4 h-4 animate-spin" />
          <LucideLogOut v-else class="w-4 h-4" />
          <span v-if="!signOutLoading">Logga ut</span>
        </Button>
      </div>
    </section>
  </div>
</template>
