<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: "sm" | "md" | "lg";
    class?: string;
  }>(),
  { size: "md", class: "" },
);

const router = useRouter();
const route = useRoute();
const { add } = useRecentSearches();
const { codes, nameByCode } = useCourseCodes();

type CourseItem = { label: string; name: string };

const searchTerm = ref("");
/**
 * Fältet är en sökruta, inte ett val: värdet hålls styrt och nollas direkt
 * efter varje val så att combobox:en aldrig skriver tillbaka kurskoden.
 */
const selected = ref<CourseItem | undefined>(undefined);
const inputMenuRef = useTemplateRef("inputMenuRef");

/**
 * Filtreringen görs här i stället för i UInputMenu: kurskoder matchas som
 * versaler och listan ska aldrig växa förbi tio träffar.
 */
const items = computed<CourseItem[]>(() => {
  const q = searchTerm.value.trim().toUpperCase();
  if (!q) return [];
  return codes.value
    .filter((code) => code.includes(q))
    .slice(0, 10)
    .map((code) => ({ label: code, name: nameByCode.value.get(code) ?? "" }));
});

function goToCourse(code: string) {
  const searchCode = code.trim().toUpperCase();
  if (!searchCode) return;
  add(searchCode);
  searchTerm.value = "";
  inputMenuRef.value?.inputRef?.blur();
  router.push(
    route.path.includes("stats")
      ? `/search/${searchCode}/stats`
      : `/search/${searchCode}`,
  );
}

function onSelect(item: CourseItem | undefined) {
  nextTick(() => {
    selected.value = undefined;
    searchTerm.value = "";
  });
  if (item?.label) goToCourse(item.label);
}

/**
 * Enter på en markerad rad hanteras av menyn via onSelect. Väntar ett varv så
 * att fältet redan är tömt i det fallet och bara fri text söks här.
 */
function onEnter() {
  setTimeout(() => {
    if (searchTerm.value.trim()) goToCourse(searchTerm.value);
  }, 0);
}

defineShortcuts({
  "/": () => inputMenuRef.value?.inputRef?.focus(),
});
</script>

<template>
  <UInputMenu
    ref="inputMenuRef"
    v-model="selected"
    v-model:search-term="searchTerm"
    :items="items"
    :size="size"
    :class="props.class"
    icon="i-lucide-search"
    placeholder="Sök kurskod..."
    ignore-filter
    :trailing-icon="undefined"
    :ui="{ base: 'uppercase placeholder:normal-case' }"
    @update:model-value="onSelect"
    @keydown.enter="onEnter"
  >
    <template #trailing>
      <UKbd value="/" variant="subtle" class="hidden sm:inline-flex" />
    </template>

    <template #item="{ item }">
      <span class="flex min-w-0 flex-1 items-baseline gap-2">
        <span class="shrink-0 font-medium text-highlighted">{{ (item as CourseItem).label }}</span>
        <span class="truncate text-xs text-muted">{{ (item as CourseItem).name }}</span>
      </span>
      <UIcon name="i-lucide-corner-down-left" class="size-3.5 shrink-0 text-dimmed" />
    </template>

    <template #empty>
      <span v-if="searchTerm.trim()">Ingen kurs matchar "{{ searchTerm.trim().toUpperCase() }}"</span>
      <span v-else>Skriv en kurskod</span>
    </template>
  </UInputMenu>
</template>
