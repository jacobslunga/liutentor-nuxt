<script setup lang="ts">
import courseCodes from "~/data/courseCodes.json";

const props = defineProps<{
  size?: "sm" | "md" | "lg";
  class?: string;
}>();

const router = useRouter();
const route = useRoute();
const { add } = useRecentSearches();

const courseCode = ref("");
const suggestions = ref<string[]>([]);
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const suggestionsRef = ref<HTMLDivElement | null>(null);

const upperCodes = (courseCodes as string[]).map((c) => c.toUpperCase());

watch(courseCode, (val) => {
  const q = val.toUpperCase().trim();
  if (!q) {
    suggestions.value = [];
    return;
  }
  suggestions.value = upperCodes.filter((c) => c.includes(q)).slice(0, 10);
  showSuggestions.value = true;
  selectedIndex.value = -1;
});

function handleSelectCourse(course: string) {
  const searchCode = course.toUpperCase();
  if (!searchCode) return;
  add(courseCode.value);
  courseCode.value = "";
  showSuggestions.value = false;
  isFocused.value = false;
  inputRef.value?.blur();
  if (route.path.includes("stats")) {
    router.push(`/search/${searchCode}/stats`);
  } else {
    router.push(`/search/${searchCode}`);
  }
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
    showSuggestions.value = false;
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const newIndex = Math.min(
      selectedIndex.value + 1,
      suggestions.value.length - 1,
    );
    selectedIndex.value = newIndex;
    scrollToSuggestion(newIndex);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const newIndex = Math.max(selectedIndex.value - 1, 0);
    selectedIndex.value = newIndex;
    scrollToSuggestion(newIndex);
  } else if (e.key === "Escape") {
    showSuggestions.value = false;
    selectedIndex.value = -1;
    inputRef.value?.blur();
  }
}

function scrollToSuggestion(index: number) {
  if (!suggestionsRef.value) return;
  const el = suggestionsRef.value.children[index] as HTMLElement | undefined;
  el?.scrollIntoView({ behavior: "instant", block: "nearest" });
}

function handleFocus() {
  isFocused.value = true;
  if (suggestions.value.length > 0 || courseCode.value.trim()) {
    showSuggestions.value = true;
  }
}

function handleBlur() {
  setTimeout(() => {
    isFocused.value = false;
    showSuggestions.value = false;
    selectedIndex.value = -1;
  }, 150);
}

function handleClickOutside(e: MouseEvent) {
  if (inputRef.value && !inputRef.value.contains(e.target as Node)) {
    showSuggestions.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleGlobalKeyDown);
});

function handleGlobalKeyDown(e: KeyboardEvent) {
  if (
    e.key === "/" &&
    !isFocused.value &&
    document.activeElement !== inputRef.value
  ) {
    e.preventDefault();
    inputRef.value?.focus();
  }
}

const sizeClass = computed(
  () =>
    ({
      sm: "text-xs py-1.5 px-3",
      md: "text-sm py-2 px-3",
      lg: "text-base py-2.5 px-3",
    })[props.size ?? "md"],
);

const iconSize = computed(
  () =>
    ({
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    })[props.size ?? "md"],
);
</script>

<template>
  <div class="relative" :class="props.class">
    <div class="relative flex items-center">
      <LucideSearch
        class="absolute left-3 pointer-events-none text-muted-foreground z-10"
        :class="iconSize"
      />
      <input
        ref="inputRef"
        :value="courseCode.toUpperCase()"
        placeholder="Sök kurskod..."
        class="w-full rounded-full bg-transparent border-none outline-none pl-9 pr-9 text-foreground placeholder:text-muted-foreground"
        :class="sizeClass"
        @input="courseCode = ($event.target as HTMLInputElement).value"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div
        v-if="!courseCode"
        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex"
      >
        <kbd
          class="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground"
        >
          /
        </kbd>
      </div>
      <button
        v-else
        class="absolute right-3 top-1/2 -translate-y-1/2 z-10"
        aria-label="Rensa"
        @click="courseCode = ''"
      >
        <LucideX
          class="text-muted-foreground hover:text-foreground transition-colors"
          :class="iconSize"
        />
      </button>
    </div>

    <div
      v-if="showSuggestions && suggestions.length > 0"
      ref="suggestionsRef"
      class="absolute w-full left-0 mt-2 bg-background border border-border rounded-xl z-60 max-h-72 overflow-y-auto text-sm shadow-md"
    >
      <div class="px-3 pt-3 pb-1 text-xs text-muted-foreground">
        Alla kurser
      </div>
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion"
        class="flex items-center px-3 py-2 cursor-pointer transition-colors"
        :class="
          index === selectedIndex
            ? 'bg-muted text-foreground'
            : 'hover:bg-muted/50'
        "
        @mousedown="handleSelectCourse(suggestion)"
      >
        <span class="flex-1 font-normal">{{ suggestion }}</span>
        <LucideCornerDownLeft class="w-3.5 h-3.5 opacity-40" />
      </div>
    </div>
  </div>
</template>
