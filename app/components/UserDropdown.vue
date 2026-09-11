<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { COLOR_BORDER_MAP, COLORS } from "@/constants/avatarColors";

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const chatStore = useChatStore();
const colorCookie = useCookie<string>("user-avatar-color");

if (!colorCookie.value) {
  colorCookie.value = COLORS[
    Math.floor(Math.random() * COLORS.length)
  ] as string;
}

const avatarColor = computed(() => colorCookie.value as string);
const firstName = ref("");
const lastName = ref("");
const avatarUrl = ref<string | null>(null);
const isPending = ref(true);
const isImageLoading = ref(false);

const initial = computed(() => {
  if (firstName.value && lastName.value) {
    return (
      (firstName.value[0] ?? "") + (lastName.value[0] ?? "")
    ).toUpperCase();
  }
  if (firstName.value) return (firstName.value[0] ?? "").toUpperCase();
  return user.value?.email?.[0]?.toUpperCase() ?? "?";
});

const displayName = computed(
  () =>
    [firstName.value, lastName.value].filter(Boolean).join(" ") ||
    user.value?.email,
);

watch(
  () => user.value?.sub,
  async (id) => {
    if (!id || id === "undefined") {
      isPending.value = false;
      return;
    }
    isPending.value = true;
    isImageLoading.value = false;
    const { data } = await (supabase as any)
      .from("profiles")
      .select("first_name, last_name, avatar_url, avatar_color")
      .eq("id", id)
      .single();
    if (data) {
      firstName.value = data.first_name ?? "";
      lastName.value = data.last_name ?? "";
      if (data.avatar_color) colorCookie.value = data.avatar_color;
      if (data.avatar_url) {
        isImageLoading.value = true;
        avatarUrl.value = data.avatar_url;
      } else {
        avatarUrl.value = null;
      }
    }
    isPending.value = false;
  },
  { immediate: true },
);

const signOut = async () => {
  chatStore.resetOnLogout();
  await supabase.auth.signOut();
};

const gotoProfile = () => {
  navigateTo("/me");
};

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [{ label: "Profil", icon: "i-lucide-user", onSelect: gotoProfile }],
  [
    {
      label: "Logga ut",
      icon: "i-lucide-log-out",
      color: "error",
      onSelect: signOut,
    },
  ],
]);
</script>

<template>
  <UDropdownMenu :items="menuItems" :content="{ align: 'end' }">
    <button :class="[
      'w-10 h-10 rounded-full border overflow-hidden flex items-center justify-center text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 relative',
      (!avatarUrl || isImageLoading) && `bg-${avatarColor}`,
      COLOR_BORDER_MAP[avatarColor],
    ]">
      <UIcon name="i-lucide-loader-circle" v-if="isPending || (avatarUrl && isImageLoading)"
        class="w-4 h-4 animate-spin absolute z-10" />

      <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" :class="[
        'w-full h-full object-cover transition-opacity duration-200',
        isImageLoading ? 'opacity-0' : 'opacity-100',
      ]" @load="isImageLoading = false" @error="isImageLoading = false" />

      <span v-else-if="!isPending">{{ initial }}</span>
    </button>

    <template #content-top>
      <div class="p-2">
        <p class="text-sm font-medium truncate">{{ displayName }}</p>
        <p v-if="firstName || lastName" class="text-xs text-muted truncate">
          {{ user?.email }}
        </p>
        <p v-else class="text-xs text-muted">Inloggad</p>
      </div>
    </template>
  </UDropdownMenu>
</template>
