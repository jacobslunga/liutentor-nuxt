<script setup lang="ts">
import { MAX_GUESSES, msUntilNextPuzzle, type GameStatus } from "#shared/utils/dailyCourse";
import type { DailyStats } from "~/lib/daily-storage";
import Button from "./ui/button/Button.vue";

const props = defineProps<{
  status: GameStatus;
  answer: string | null;
  courseName: string | null;
  attempts: number;
  stats: DailyStats;
}>();

const emit = defineEmits<{ share: [] }>();

const countdown = ref("");
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  const ms = msUntilNextPuzzle();
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  countdown.value = [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

onMounted(() => {
  tick();
  timer = setInterval(tick, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const winRate = computed(() =>
  props.stats.played ? Math.round((props.stats.wins / props.stats.played) * 100) : 0,
);

const maxInDistribution = computed(() =>
  Math.max(1, ...props.stats.distribution),
);
</script>

<template>
  <div class="flex w-full max-w-100 flex-col items-center gap-5 text-center">
    <div class="flex flex-col items-center gap-1">
      <p class="text-sm text-muted-foreground">
        {{ status === "won" ? "Snyggt!" : "Nästa gång!" }}
      </p>
      <NuxtLink
        v-if="answer"
        :to="`/search/${answer}`"
        class="font-mono text-3xl font-semibold tracking-tight text-foreground underline-offset-4 hover:underline"
      >
        {{ answer }}
      </NuxtLink>
      <p v-if="courseName" class="text-sm text-muted-foreground">
        {{ courseName }}
      </p>
    </div>

    <div class="grid w-full grid-cols-4 gap-2">
      <div v-for="stat in [
        { label: 'Spelade', value: stats.played },
        { label: 'Vinst %', value: winRate },
        { label: 'Svit', value: stats.currentStreak },
        { label: 'Bästa', value: stats.maxStreak },
      ]" :key="stat.label" class="flex flex-col items-center">
        <span class="font-mono text-xl font-semibold text-foreground">{{ stat.value }}</span>
        <span class="text-2xs text-muted-foreground">{{ stat.label }}</span>
      </div>
    </div>

    <div class="flex w-full flex-col gap-1">
      <div
        v-for="(count, i) in stats.distribution"
        :key="i"
        class="flex items-center gap-2 text-xs"
      >
        <span class="w-3 font-mono text-muted-foreground">{{ i + 1 }}</span>
        <div class="h-5 flex-1 overflow-hidden rounded-sm bg-secondary/60">
          <div
            class="flex h-full items-center justify-end rounded-sm px-1.5 font-mono text-2xs transition-[width] duration-300 ease-spring"
            :class="
              status === 'won' && attempts === i + 1
                ? 'bg-success text-success-foreground'
                : 'bg-muted-foreground/30 text-foreground'
            "
            :style="{ width: `${Math.max(count ? 8 : 0, (count / maxInDistribution) * 100)}%` }"
          >
            {{ count || "" }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-full flex-col items-center gap-2 border-t border-border pt-4">
      <p class="text-2xs uppercase tracking-wide text-muted-foreground">
        Nästa kurskod om
      </p>
      <p class="font-mono text-lg tabular-nums text-foreground">{{ countdown }}</p>
      <Button class="mt-1 w-full" @click="emit('share')">
        <LucideShare2 />
        Dela resultat
      </Button>
      <p class="text-2xs text-muted-foreground">
        {{ status === "won" ? `Klarad på ${attempts} av ${MAX_GUESSES}` : `Inte klarad på ${MAX_GUESSES} försök` }}
      </p>
    </div>
  </div>
</template>
