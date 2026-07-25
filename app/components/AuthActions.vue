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
  <ClientOnly>
    <div class="flex items-center gap-2">
      <SettingsDialog v-if="showSettings" />
      <UserDropdown v-if="user" />
      <template v-else>
        <Button size="sm" variant="outline" as-child>
          <NuxtLink to="/logga-in">Logga in</NuxtLink>
        </Button>
        <Button size="sm" variant="default" as-child>
          <NuxtLink to="/skapa-konto">Skapa konto</NuxtLink>
        </Button>
      </template>
    </div>
  </ClientOnly>
</template>
