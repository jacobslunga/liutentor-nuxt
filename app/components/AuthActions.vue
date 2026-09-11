<script setup lang="ts">
withDefaults(
  defineProps<{
    showSettings?: boolean;
  }>(),
  {
    showSettings: false,
  },
);

const isMounted = useIsMounted();
const user = useSupabaseUser();
</script>

<template>
  <div class="flex items-center gap-2">
    <SettingsDialog v-if="showSettings && isMounted" />
    <UserDropdown v-if="isMounted && user" />
    <template v-else-if="isMounted">
      <UButton to="/logga-in" size="sm" color="neutral" variant="outline">
        Logga in
      </UButton>
      <UButton to="/logga-in?tab=skapa-konto" size="sm">Skapa konto</UButton>
    </template>
  </div>
</template>
