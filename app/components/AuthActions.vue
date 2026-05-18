<script setup lang="ts">
withDefaults(
  defineProps<{
    showSettings?: boolean;
  }>(),
  {
    showSettings: false,
  },
);

const user = useSupabaseUser();
</script>

<template>
  <SettingsDialog v-if="showSettings" />
  <template v-if="user">
    <UserDropdown />
  </template>
  <template v-else>
    <Button size="sm" variant="outline" as-child>
      <NuxtLink to="/logga-in">Logga in</NuxtLink>
    </Button>
    <Button size="sm" variant="default" as-child>
      <NuxtLink to="/skapa-konto">Skapa konto</NuxtLink>
    </Button>
  </template>
</template>
