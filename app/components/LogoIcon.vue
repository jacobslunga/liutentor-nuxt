<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  inheritAttrs: false,
});

interface Props {
  className?: string;
  width?: number;
  height?: number;
  isBlackAndWhite?: boolean;
}

const props = defineProps<Props>();
const attrs = useAttrs();

const lightSrc = computed(() =>
  props.isBlackAndWhite ? "/images/logo-black.svg" : "/images/logo-light.svg",
);

const darkSrc = computed(() =>
  props.isBlackAndWhite ? "/images/logo-white.svg" : "/images/logo-dark.svg",
);

const logoClass = computed(() => [attrs.class, props.className]);
const logoStyle = computed(() => ({
  width: props.width ? `${props.width}px` : undefined,
  height: props.height ? `${props.height}px` : undefined,
}));
</script>

<template>
  <img
    :src="lightSrc"
    alt="Logo"
    :class="['dark:hidden', logoClass]"
    :style="logoStyle"
  />
  <img
    :src="darkSrc"
    alt="Logo"
    :class="['hidden dark:block', logoClass]"
    :style="logoStyle"
  />
</template>
