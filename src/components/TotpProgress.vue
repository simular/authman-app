<script setup lang="ts">
// @ts-ignore
import CircleProgress from "vue3-circle-progress";
import "vue3-circle-progress/dist/circle-progress.css";

const props = withDefaults(
  defineProps<{
    progress: number;
    size?: number;
    width?: number;
    color?: string;
  }>(),
  {
    size: 48,
    width: 3,
  }
);
</script>

<template>
  <div class="c-totp-progress">
    <CircleProgress
      class="c-totp-progress__progress"
      :percent="progress"
      :size
      :border-width="width"
      :border-bg-width="width"
      :color="color"
    />
    <div class="c-totp-progress__text">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.c-totp-progress {
  display: inline-block;
  position: relative;

  &__text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
