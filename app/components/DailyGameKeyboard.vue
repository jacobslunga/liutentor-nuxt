<script setup lang="ts">
import type { TileState } from "#shared/utils/dailyCourse";

defineProps<{
  keyStates: Map<string, TileState>;
  disabled: boolean;
}>();

const emit = defineEmits<{
  type: [char: string];
  backspace: [];
  submit: [];
}>();

// Course codes mix letters and digits, so the digit row sits above a normal
// QWERTY block rather than replacing it.
const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const KEY_CLASSES = {
  correct: "border-transparent bg-success text-success-foreground",
  present: "border-transparent bg-warning text-warning-foreground",
  // Ruled-out keys take the same fill as a ruled-out tile, so the board and the
  // keyboard read as one system.
  absent: "border-transparent bg-tile-absent text-tile-absent-foreground",
} as const;

function onKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (event.key === "Enter") {
    event.preventDefault();
    emit("submit");
  } else if (event.key === "Backspace") {
    event.preventDefault();
    emit("backspace");
  } else if (/^[a-z0-9]$/i.test(event.key)) {
    event.preventDefault();
    emit("type", event.key.toUpperCase());
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div
    class="flex w-full max-w-140 flex-col items-center gap-1.5 [--key:clamp(2.125rem,5.6vh,2.75rem)]"
  >
    <div v-for="(row, i) in ROWS" :key="i" class="flex w-full justify-center gap-1">
      <button
        v-for="key in row"
        :key="key"
        type="button"
        :disabled="disabled"
        class="min-w-0 flex-1 rounded-md border border-border bg-secondary/60 font-mono text-sm font-semibold text-foreground transition-colors duration-150 ease-spring active:scale-[0.96] disabled:opacity-50 sm:text-base"
        :style="{ height: 'var(--key)' }"
        :class="keyStates.get(key) ? KEY_CLASSES[keyStates.get(key)!] : 'hover:bg-secondary'"
        @click="emit('type', key)"
      >
        {{ key }}
      </button>
    </div>

    <div class="flex w-full justify-center gap-1">
      <button
        type="button"
        :disabled="disabled"
        class="flex-2 rounded-md border border-border bg-secondary/60 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors duration-150 ease-spring hover:bg-secondary active:scale-[0.96] disabled:opacity-50 sm:text-sm"
        :style="{ height: 'var(--key)' }"
        @click="emit('submit')"
      >
        Gissa
      </button>
      <button
        type="button"
        :disabled="disabled"
        aria-label="Radera"
        class="flex flex-1 items-center justify-center rounded-md border border-border bg-secondary/60 text-foreground transition-colors duration-150 ease-spring hover:bg-secondary active:scale-[0.96] disabled:opacity-50"
        :style="{ height: 'var(--key)' }"
        @click="emit('backspace')"
      >
        <LucideDelete class="size-5" />
      </button>
    </div>
  </div>
</template>
