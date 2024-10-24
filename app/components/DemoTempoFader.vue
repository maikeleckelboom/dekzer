<script lang="ts" setup>
const modelValue = ref<number>(0)

const stripes = computed(() => {
  const stripes = []
  for (let i = 0; i < 10; i++) {
    stripes.push(i)
  }
  return stripes
})

const geTop = (stripe: number) => {
  /* Calculate the top position of the stripe (make it align vertical centered) */
  return `${(stripe * 10) + 5}%`

}
</script>

<template>
  <div class="relative h-full min-h-44 w-8">
    <FaderThumb />
    <div class="flex flex-col items-center justify-center pt-0.5">
      <div class="w-2 h-full mx-auto bg-black absolute top-0 z-10" />

      <div
        v-for="stripe in stripes"
        :key="stripe"
        :style="{ top: geTop(stripe) }"
        class="bg-muted border border-black absolute h-1 w-full" />
    </div>
  </div>
</template>

<style scoped></style>
