<script setup lang="ts">
import { computed } from "vue";

interface Props {
  className?: string;
  width?: number;
  height?: number;
  isBlackAndWhite?: boolean;
}

const props = defineProps<Props>();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const src = computed(() => {
  if (props.isBlackAndWhite) {
    return isDark.value ? "/images/logo-white.svg" : "/images/logo-black.svg";
  }

  return isDark.value ? "/images/logo-dark.svg" : "/images/logo-light.svg";
});
</script>

<template>
  <ClientOnly>
    <img
      :key="src"
      :src="src"
      alt="Logo"
      :class="className"
      :style="{
        width: width ? width + 'px' : undefined,
        height: height ? height + 'px' : undefined,
      }"
    />
  </ClientOnly>
</template>
