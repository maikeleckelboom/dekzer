<script lang="ts" setup>
const modelValue = ref<number>(0)

const STRIPE_COUNT: number = 13

const stripes = computed(() => {
  const stripes = []
  for (let i = 0; i < STRIPE_COUNT; i++) {
    stripes.push(i)
  }
  return stripes
})

function getTopStyle(stripe: number) {
  const stripeHeight = 100 / STRIPE_COUNT
  const dynamicOffset = stripeHeight / 2
  return `${stripe * stripeHeight + dynamicOffset}%`
}

const everyNth = (index, total) => index % total === 0
</script>

<template>
  <div class="relative grid h-full min-w-8 place-items-center">
    <FaderThumb />
    <div class="absolute top-0 z-10 mx-auto h-full w-2 overflow-clip rounded-[2px] bg-black" />
    <div
      v-for="stripe in stripes"
      :key="stripe"
      :class="
        cn(
          'bg-muted absolute -translate-y-1/2',
          everyNth(stripe, 6) ? 'bg-foreground/60 h-1 w-full' : 'bg-foreground/60 h-px w-full'
        )
      "
      :style="{ top: getTopStyle(stripe) }" />
  </div>
</template>
