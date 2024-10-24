<script lang="ts" setup>
import { ref, computed } from 'vue';

const modelValue = ref<number>(0);
const STRIPE_COUNT: number = 8;

const stripes = computed(() => {
  const stripes = [];
  for (let i = 0; i < STRIPE_COUNT; i++) {
    stripes.push(i);
  }
  return stripes;
});

// Calculate the top position of the stripe dynamically based on the stripe count
const geTop = (stripe: number) => {
  const stripeHeight = 100 / STRIPE_COUNT; // Calculate the height percentage of each stripe
  const dynamicOffset = stripeHeight / 2; // Calculate the dynamic offset based on the stripe height
  return `${stripe * stripeHeight + dynamicOffset}%`; // Set the top position based on the stripe index
};
</script>

<template>
  <div class="relative flex h-full min-h-44 w-10 justify-center">
    <FaderThumb />
    <div class="flex flex-col items-center justify-center pt-0.5">
      <div class="absolute top-0 z-10 mx-auto h-full w-2 bg-black" />

      <div
        v-for="stripe in stripes"
        :key="stripe"
        :style="{ top: geTop(stripe) }"
        class="bg-muted absolute h-1 w-full  border border-black -translate-y-1/2" />
    </div>
  </div>
</template>

<style scoped>
/* Add your styles here if needed */
</style>
