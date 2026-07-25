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
      <Button size="sm" variant="outline" as-child>
        <NuxtLink to="/logga-in">Logga in</NuxtLink>
      </Button>
      <Button size="sm" variant="default" as-child>
        <NuxtLink to="/skapa-konto">Skapa konto</NuxtLink>
      </Button>
    </template>
  </div>
</template>
