<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import courseCodes from "~/data/courseCodes.json";
import Button from "./ui/button/Button.vue";

const upperCourseCodes = computed(() =>
  courseCodes.map((c: string) => c.toUpperCase()),
);

const isLoading = ref(false);

const props = defineProps<{
  focusInput: boolean;
}>();

const emit = defineEmits<{
  "update:focusInput": [value: boolean];
}>();

const router = useRouter();

const courseCode = ref("");
const suggestions = ref<string[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const searchMethod = ref<"tentor" | "stats">("tentor");
const { add } = useRecentSearches();

const inputRef = ref<HTMLInputElement | null>(null);
const listParentRef = ref<HTMLDivElement | null>(null);

watch([courseCode, () => props.focusInput], () => {
  const q = courseCode.value.toUpperCase().trim();
  if (!q) {
    showSuggestions.value = false;
    return;
  }
  if (props.focusInput) showSuggestions.value = true;
  suggestions.value = upperCourseCodes.value
    .filter((code) => code.includes(q))
    .slice(0, 60);
  selectedIndex.value = -1;
});

const ITEM_HEIGHT = 36;
const OVERSCAN = 5;

const scrollTop = ref(0);

const virtualItems = computed(() => {
  const containerHeight = 256;
  const start = Math.max(
    0,
    Math.floor(scrollTop.value / ITEM_HEIGHT) - OVERSCAN,
  );
  const end = Math.min(
    suggestions.value.length - 1,
    Math.ceil((scrollTop.value + containerHeight) / ITEM_HEIGHT) + OVERSCAN,
  );
  return Array.from({ length: end - start + 1 }, (_, i) => ({
    index: start + i,
    item: suggestions.value[start + i],
    top: (start + i) * ITEM_HEIGHT,
  })).filter(
    (row): row is { index: number; item: string; top: number } =>
      row.item !== undefined,
  );
});

const totalHeight = computed(() => suggestions.value.length * ITEM_HEIGHT);

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLDivElement).scrollTop;
}

function scrollToIndex(index: number) {
  if (!listParentRef.value) return;
  const itemTop = index * ITEM_HEIGHT;
  const itemBottom = itemTop + ITEM_HEIGHT;
  const { scrollTop: st, clientHeight } = listParentRef.value;
  if (itemTop < st) listParentRef.value.scrollTop = itemTop;
  else if (itemBottom > st + clientHeight)
    listParentRef.value.scrollTop = itemBottom - clientHeight;
}

function handleSelectCourse(course: string) {
  const searchCode = course.toUpperCase();
  if (!searchCode) return;
  add(courseCode.value);
  courseCode.value = "";
  showSuggestions.value = false;
  router.push(
    searchMethod.value === "stats"
      ? `/search/${searchCode}/stats`
      : `/search/${searchCode}`,
  );
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    const suggestion = suggestions.value[selectedIndex.value];
    if (selectedIndex.value >= 0 && suggestion) {
      handleSelectCourse(suggestion);
    } else {
      handleSelectCourse(courseCode.value);
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const newIndex = Math.min(
      selectedIndex.value + 1,
      suggestions.value.length - 1,
    );
    selectedIndex.value = newIndex;
    scrollToIndex(newIndex);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const newIndex = Math.max(selectedIndex.value - 1, 0);
    selectedIndex.value = newIndex;
    scrollToIndex(newIndex);
  } else if (e.key === "Escape") {
    showSuggestions.value = false;
    selectedIndex.value = -1;
    inputRef.value?.blur();
  }
}

const typed = ref("");
const exIndex = ref(Math.floor(Math.random() * courseCodes.length));
const charIndex = ref(0);
const deleting = ref(false);
let typingTimer: ReturnType<typeof setTimeout> | null = null;

const shuffledExamples = [...courseCodes].sort(() => Math.random() - 0.5);

function runTyping() {
  if (courseCode.value) return;
  const current =
    shuffledExamples[exIndex.value % shuffledExamples.length] ?? "";
  const doneTyping = charIndex.value === current.length && !deleting.value;
  const doneDeleting = charIndex.value === 0 && deleting.value;
  const speed = deleting.value ? 30 : 55;
  const pause = doneTyping ? 1200 : doneDeleting ? 500 : 0;

  typingTimer = setTimeout(() => {
    if (doneTyping) {
      deleting.value = true;
    } else if (doneDeleting) {
      deleting.value = false;
      exIndex.value = (exIndex.value + 1) % shuffledExamples.length;
    } else {
      charIndex.value += deleting.value ? -1 : 1;
      typed.value = current.slice(0, charIndex.value);
    }
    runTyping();
  }, pause || speed);
}

onMounted(() => {
  runTyping();
  document.addEventListener("mousedown", handleClickOutside);
  inputRef.value?.focus();
});

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer);
  document.removeEventListener("mousedown", handleClickOutside);
});

watch(courseCode, (val) => {
  if (val && typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  } else if (!val && !typingTimer) {
    runTyping();
  }
});

function handleClickOutside(event: MouseEvent) {
  if (
    listParentRef.value &&
    !listParentRef.value.contains(event.target as Node) &&
    inputRef.value &&
    !inputRef.value.contains(event.target as Node)
  ) {
    showSuggestions.value = false;
  }
}
</script>

<template>
  <div class="relative w-full">
    <div class="w-full relative flex flex-row items-center justify-center px-4">
      <select
        v-model="searchMethod"
        class="shrink-0 w-20 rounded-full text-foreground/60 hover:text-foreground bg-transparent border-none outline-none cursor-pointer"
        @change="inputRef?.focus()"
      >
        <option value="tentor">Tentor</option>
        <option value="stats">Statistik</option>
      </select>

      <div class="shrink-0 h-6.25 w-px bg-foreground/10 ml-4" />

      <input
        ref="inputRef"
        :value="courseCode.toUpperCase()"
        class="min-w-0 w-full p-4 border-none bg-transparent text-md text-foreground/80 outline-none"
        :placeholder="`Sök efter ${typed}`"
        @input="courseCode = ($event.target as HTMLInputElement).value"
        @keydown="handleKeyDown"
        @focus="emit('update:focusInput', true)"
        @blur="emit('update:focusInput', false)"
      />

      <Button
        class="absolute right-3"
        variant="outline"
        size="icon-sm"
        :disabled="!courseCode"
        aria-label="Search"
        @click="handleSelectCourse(courseCode)"
      >
        <LucideArrowUp class="w-5 h-5" />
      </Button>
    </div>

    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute w-full left-0 mt-2 bg-background rounded-2xl border shadow-md z-40 max-h-72 overflow-hidden text-sm"
    >
      <div v-if="isLoading" class="p-3 text-sm text-muted-foreground">
        Laddar...
      </div>

      <div class="px-3 pt-3 pb-1 text-muted-foreground font-medium">
        Alla kurser
      </div>

      <div
        ref="listParentRef"
        class="overflow-y-auto max-h-64 scrollbar-hide"
        @scroll="handleScroll"
      >
        <div
          :style="{
            height: `${totalHeight}px`,
            position: 'relative',
            width: '100%',
          }"
        >
          <div
            v-for="{ index, item, top } in virtualItems"
            :key="item"
            :class="[
              'flex items-center px-4 py-2 cursor-pointer transition-colors',
              index === selectedIndex
                ? 'bg-muted text-foreground'
                : 'hover:bg-muted/50',
            ]"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${ITEM_HEIGHT}px`,
              transform: `translateY(${top}px)`,
            }"
            @mousedown.prevent="handleSelectCourse(item)"
          >
            <span class="flex-1 font-normal">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
