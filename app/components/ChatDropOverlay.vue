<template>
  <div class="pointer-events-none absolute inset-0 z-60 bg-background/90" role="status" aria-live="polite">
    <div class="flex h-full flex-col items-center justify-center p-8 text-center">
      <div class="drop-illustration relative mb-7 h-20 w-32" aria-hidden="true">
        <div
          class="drop-tile-back absolute left-4 top-3 flex size-14 -rotate-12 items-center justify-center rounded-2xl text-primary-foreground shadow-lg">
          <LucideImage class="size-7" />
        </div>
        <div
          class="drop-tile-middle absolute right-4 top-1 flex size-14 rotate-12 items-center justify-center rounded-2xl text-primary-foreground shadow-lg">
          <LucideFileText class="size-7" />
        </div>
        <div
          class="absolute bottom-0 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl">
          <LucideImagePlus class="size-7" />
        </div>
      </div>
      <p class="text-2xl font-semibold tracking-tight text-foreground">
        Lägg till vad som helst
      </p>
      <p class="mt-2 text-base text-muted-foreground">
        Släpp en fil här för att lägga till den i chatten
      </p>
    </div>
  </div>
</template>

<style scoped>
.drop-tile-back {
  background-color: color-mix(in oklab, var(--primary) 68%, white);
}

.drop-tile-middle {
  background-color: color-mix(in oklab, var(--primary) 84%, white);
}

.drop-overlay-enter-active,
.drop-overlay-leave-active {
  transition:
    opacity 130ms ease,
    transform 160ms var(--ease-spring);
}

.drop-overlay-enter-from,
.drop-overlay-leave-to {
  opacity: 0;
  transform: scale(0.985);
}

.drop-illustration {
  animation: drop-illustration-in 220ms var(--ease-spring) both;
}

@keyframes drop-illustration-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .drop-illustration {
    animation: none;
  }

  .drop-overlay-enter-active,
  .drop-overlay-leave-active {
    transition: none;
  }
}
</style>
