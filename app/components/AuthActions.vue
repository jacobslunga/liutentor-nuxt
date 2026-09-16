<script setup lang="ts">
withDefaults(
  defineProps<{
    showSettings?: boolean;
    largerOnDesktop?: boolean;
  }>(),
  {
    showSettings: false,
    largerOnDesktop: false,
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
      <UButton
        to="/logga-in"
        size="sm"
        color="neutral"
        variant="outline"
        :class="largerOnDesktop ? 'lg:px-4 lg:py-2 lg:text-sm' : undefined"
      >
        Logga in
      </UButton>
      <UButton
        to="/logga-in?tab=skapa-konto"
        size="sm"
        :class="largerOnDesktop ? 'lg:px-4 lg:py-2 lg:text-sm' : undefined"
      >Skapa konto</UButton>
    </template>
  </div>
</template>
