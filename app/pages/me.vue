<script setup lang="ts">
import { toast } from "vue-sonner";
import { COLORS } from "@/constants/avatarColors";

definePageMeta({
  layout: "profile",
});

useSeoMeta({
  title: "Min profil",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

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

  if (!user.value?.sub) {
    profileLoading.value = false;
    return;
  }

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("first_name, last_name, avatar_color, avatar_url")
    .eq("id", user.value.sub)
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

  profileLoading.value = false;
});

const setColor = async (color: string) => {
  colorCookie.value = color;
  if (!user.value?.sub) return;
  await (supabase as any)
    .from("profiles")
    .update({ avatar_color: color })
    .eq("id", user.value.sub);
};

async function saveProfile() {
  if (!user.value?.sub || !hasChanges.value) return;
  profileSaving.value = true;

  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      first_name: firstNameInput.value.trim() || null,
      last_name: lastNameInput.value.trim() || null,
    })
    .eq("id", user.value.sub);

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
  if (!file || !user.value?.sub) return;

  avatarUploading.value = true;

  const ext = file.name.split(".").pop();
  const path = `${user.value.sub}/avatar.${ext}`;

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
    .eq("id", user.value.sub);

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
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold">Min profil</h1>
      <p class="text-sm text-muted-foreground">
        Hantera ditt konto och inställningar
      </p>
    </div>

    <template v-if="profileLoading">
      <section class="flex flex-col gap-3">
        <div class="h-3.5 w-16 rounded bg-muted animate-pulse" />
        <div
          class="border border-border rounded-xl p-5 flex items-center gap-4"
        >
          <div class="w-14 h-14 rounded-full bg-muted animate-pulse shrink-0" />
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <div class="h-4 w-32 rounded bg-muted animate-pulse" />
            <div class="h-3.5 w-48 rounded bg-muted animate-pulse" />
            <div class="h-3 w-36 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <div class="h-3.5 w-12 rounded bg-muted animate-pulse" />
        <div class="border border-border rounded-xl divide-y divide-border">
          <div class="flex items-center justify-between px-5 py-3.5">
            <div class="h-3.5 w-20 rounded bg-muted animate-pulse" />
            <div class="h-3.5 w-28 rounded bg-muted animate-pulse" />
          </div>
          <div class="flex items-center justify-between px-5 py-3.5">
            <div class="h-3.5 w-20 rounded bg-muted animate-pulse" />
            <div class="h-3.5 w-28 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <div class="h-3.5 w-24 rounded bg-muted animate-pulse" />
        <div class="border border-border rounded-xl divide-y divide-border">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center justify-between px-5 py-3.5"
          >
            <div class="h-3.5 w-24 rounded bg-muted animate-pulse" />
            <div class="h-3.5 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="flex flex-col gap-3">
        <h2
          class="text-xs font-medium text-muted-foreground uppercase tracking-wide"
        >
          Konto
        </h2>
        <div
          class="border border-border rounded-xl p-5 flex items-center gap-4"
        >
          <button
            class="relative cursor-pointer shrink-0 group"
            :disabled="avatarUploading"
            @click="handleAvatarClick"
          >
            <div
              v-if="avatarUrl"
              class="w-14 h-14 rounded-full overflow-hidden"
            >
              <img
                :src="avatarUrl"
                alt="Avatar"
                class="w-full h-full object-cover"
                :class="[
                  avatarUploading
                    ? 'opacity-40'
                    : 'group-hover:opacity-80 transition-opacity',
                ]"
              />
            </div>
            <div
              v-else
              :class="[
                'w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold',
                avatarUploading
                  ? 'opacity-40'
                  : 'group-hover:opacity-80 transition-opacity',
                `bg-${avatarColor}`,
              ]"
            >
              {{ initial }}
            </div>

            <div
              v-if="avatarUploading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <LucideLoader2
                class="w-5 h-5 text-white animate-spin drop-shadow"
              />
            </div>

            <div
              class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center shadow-sm"
            >
              <LucideLoader2
                v-if="avatarUploading"
                class="w-3 h-3 animate-spin text-muted-foreground"
              />
              <LucidePlus v-else class="w-3 h-3 text-foreground" />
            </div>
          </button>

          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />

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
          <div class="flex flex-col gap-1.5 px-5 py-3.5">
            <label class="text-xs text-muted-foreground">Förnamn</label>
            <input
              v-model="firstNameInput"
              type="text"
              placeholder="Ditt förnamn"
              class="text-sm font-medium bg-transparent outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          <div class="flex flex-col gap-1.5 px-5 py-3.5">
            <label class="text-xs text-muted-foreground">Efternamn</label>
            <input
              v-model="lastNameInput"
              type="text"
              placeholder="Ditt efternamn"
              class="text-sm font-medium bg-transparent outline-none placeholder:text-muted-foreground/40"
            />
          </div>
        </div>
        <div class="flex justify-end">
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
                  'w-5 h-5 rounded-full cursor-pointer transition-all',
                  `bg-${color}`,
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
    </template>
  </div>
</template>
