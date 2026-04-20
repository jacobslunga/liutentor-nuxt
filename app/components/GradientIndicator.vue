<script setup lang="ts">
defineProps<{
  facitPdfUrl: string | null;
  label?: string;
}>();

const spring = ref(0);
let targetValue = 0;
let rafId: number | null = null;

function animateTo(target: number) {
  targetValue = target;
  if (rafId) return;
  function step() {
    const diff = targetValue - spring.value;
    if (Math.abs(diff) < 0.001) {
      spring.value = targetValue;
      rafId = null;
      return;
    }
    spring.value += diff * 0.18;
    rafId = requestAnimationFrame(step);
  }
  rafId = requestAnimationFrame(step);
}

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const gradientOpacity = computed(() => {
  const v = spring.value;
  return isDark.value ? 0.08 + v * 0.3 : 0.16 + v * 0.45;
});

const backgroundImage = computed(() => {
  const o = gradientOpacity.value;
  return `radial-gradient(ellipse 90px 42% at 100% 50%, oklch(0.6193 0.1154 172.06 / ${o}) 0%, oklch(0.6193 0.1154 172.06 / ${o * 0.7}) 22%, oklch(0.6193 0.1154 172.06 / ${o * 0.28}) 48%, transparent 72%)`;
});

const iconOpacity = computed(() => 0.5 + spring.value * 0.5);
const arrowX = computed(() => `${-10 + spring.value * -20}px`);

function handleMouseMove(e: MouseEvent) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const xTrigger = w * 0.7;
  const safeZoneY = h * 0.2;
  const inSafeZone = e.clientY < safeZoneY || e.clientY > h - safeZoneY;

  if (e.clientX > xTrigger && !inSafeZone) {
    const xRatio = (e.clientX - xTrigger) / (w - xTrigger);
    animateTo(Math.min(Math.max(xRatio, 0), 1));
  } else {
    animateTo(0);
  }
}

onMounted(() => window.addEventListener("mousemove", handleMouseMove));
onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    class="absolute right-0 top-0 h-full w-28 pointer-events-none"
    :style="{ backgroundImage }"
  >
    <div
      class="absolute right-0 flex items-center h-full pr-2"
      :style="{ opacity: iconOpacity, transform: `translateX(${arrowX})` }"
    >
      <div v-if="facitPdfUrl" class="flex items-center gap-2">
        <LucideArrowLeftToLine class="w-5 h-5 text-primary" />
        <span class="text-xs font-medium text-primary hidden md:block">
          {{ label ?? "Facit" }}
        </span>
      </div>
      <p v-else class="text-xs hidden md:flex text-muted-foreground">
        Ej tillgängligt
      </p>
    </div>
  </div>
</template>
