<script setup lang="ts">
const { codes, nameByCode } = useCourseCodes();

const props = defineProps<{
  focusInput: boolean;
}>();

const emit = defineEmits<{
  "update:focusInput": [value: boolean];
}>();

const router = useRouter();
const { add } = useRecentSearches();

type CourseItem = { label: string; name: string };

const searchTerm = ref("");
const selected = ref<CourseItem | undefined>(undefined);
const inputMenuRef = useTemplateRef("inputMenuRef");

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
  selected.value = undefined;
  inputMenuRef.value?.inputRef?.blur();
  router.push(`/search/${searchCode}`);
}

function onSelect(item: CourseItem | undefined) {
  nextTick(() => {
    selected.value = undefined;
    searchTerm.value = "";
  });

  if (item?.label) goToCourse(item.label);
}

function onEnter() {
  setTimeout(() => {
    if (searchTerm.value.trim()) goToCourse(searchTerm.value);
  }, 0);
}

const typed = ref("");
const exIndex = ref(0);
const charIndex = ref(0);
const deleting = ref(false);
let typingTimer: ReturnType<typeof setTimeout> | null = null;
const shuffledExamples = ref<string[]>([]);

function runTyping() {
  if (searchTerm.value) return;

  const current =
    shuffledExamples.value[exIndex.value % shuffledExamples.value.length] ?? "";
  if (!current) return;

  const doneTyping = charIndex.value === current.length && !deleting.value;
  const doneDeleting = charIndex.value === 0 && deleting.value;
  const speed = deleting.value ? 30 : 55;
  const pause = doneTyping ? 1200 : doneDeleting ? 500 : 0;

  typingTimer = setTimeout(() => {
    if (doneTyping) {
      deleting.value = true;
    } else if (doneDeleting) {
      deleting.value = false;
      exIndex.value = (exIndex.value + 1) % shuffledExamples.value.length;
    } else {
      charIndex.value += deleting.value ? -1 : 1;
      typed.value = current.slice(0, charIndex.value);
    }
    runTyping();
  }, pause || speed);
}

watch(
  codes,
  (list) => {
    if (!list.length || shuffledExamples.value.length) return;
    shuffledExamples.value = [...list].sort(() => Math.random() - 0.5);
    exIndex.value = Math.floor(Math.random() * shuffledExamples.value.length);
    if (!typingTimer) runTyping();
  },
  { immediate: true },
);

watch(searchTerm, (value) => {
  if (value && typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  } else if (!value && !typingTimer) {
    runTyping();
  }
});

onMounted(() => {
  runTyping();
  inputMenuRef.value?.inputRef?.focus();
});

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer);
});
</script>

<template>
  <UInputMenu
    ref="inputMenuRef"
    v-model="selected"
    v-model:search-term="searchTerm"
    :items="items"
    :placeholder="`Sök efter ${typed}`"
    icon="i-lucide-search"
    variant="none"
    trailing-icon=""
    ignore-filter
    :ui="{
      root: 'w-full',
      base: 'min-w-0 w-full py-4 ps-14 pe-12 border-none bg-transparent text-md text-highlighted/80 outline-none uppercase placeholder:normal-case',
      leading: 'pl-5',
      leadingIcon: 'size-6 text-muted',
      trailing: 'pr-2',
    }"
    @focus="emit('update:focusInput', true)"
    @blur="emit('update:focusInput', false)"
    @update:model-value="onSelect"
    @keydown.enter="onEnter"
  >
    <template #item="{ item }">
      <span class="flex min-w-0 flex-1 items-baseline gap-2">
        <span class="shrink-0 font-medium text-highlighted">
          {{ (item as CourseItem).label }}
        </span>
        <span class="truncate text-xs text-muted">
          {{ (item as CourseItem).name }}
        </span>
      </span>
      <UIcon
        name="i-lucide-corner-down-left"
        class="size-3.5 shrink-0 text-dimmed"
      />
    </template>

    <template #empty>
      <span v-if="searchTerm.trim()">
        Ingen kurs matchar "{{ searchTerm.trim().toUpperCase() }}"
      </span>
      <span v-else>Skriv en kurskod</span>
    </template>
  </UInputMenu>
</template>
