<script setup lang="ts">
import { COLORS } from "@/constants/avatarColors";

const user = useSupabaseUser();
const supabase = useSupabaseClient();

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
    if (!id || id === "undefined") return;
    const { data } = await (supabase as any)
      .from("profiles")
      .select("first_name, last_name, avatar_url, avatar_color")
      .eq("id", id)
      .single();
    if (data) {
      firstName.value = data.first_name ?? "";
      lastName.value = data.last_name ?? "";
      avatarUrl.value = data.avatar_url ?? null;
      if (data.avatar_color) colorCookie.value = data.avatar_color;
    }
  },
  { immediate: true },
);
const signOut = async () => {
  await supabase.auth.signOut();
};
const gotoProfile = () => {
  navigateTo("/me");
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        :class="[
          'w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-80',
          !avatarUrl && `bg-${avatarColor}`,
        ]"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <span v-else>{{ initial }}</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <div class="px-2 py-1.5 mb-1">
        <p class="text-sm font-medium truncate">{{ displayName }}</p>
        <p
          v-if="firstName || lastName"
          class="text-xs text-muted-foreground truncate"
        >
          {{ user?.email }}
        </p>
        <p v-else class="text-xs text-muted-foreground">Inloggad</p>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="gotoProfile">
        <LucideUser class="w-4 h-4" />
        Profil
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="cursor-pointer"
        @click="signOut"
        variant="destructive"
      >
        <LucideLogOut class="w-4 h-4" />
        Logga ut
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
