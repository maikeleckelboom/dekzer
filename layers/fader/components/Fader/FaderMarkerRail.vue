<script lang="ts" setup>
import {
  type FaderContext,
  injectFaderRootContext
} from '~~/layers/fader/components/Fader/FaderRoot.vue'

const { orientation } = injectFaderRootContext({
  orientation: shallowRef('horizontal')
} as FaderContext)

const { stripeCount = 5, nth = 2 } = defineProps<{ stripeCount: number, nth?:number }>()

const stripes = computed(() => {
  const stripes = []
  for (let i = 0; i < stripeCount; i++) {
    stripes.push(i)
  }
  return stripes
})

function getOffsetStyle(stripe: number) {
  const stripeSize = 100 / stripeCount
  const dynamicOffset = stripeSize / 2
  return `${stripe * stripeSize + dynamicOffset}%`
}

const everyNth = (index: number) => index % nth === 0
</script>

<template>
  <div
    :class="cn(orientation === 'horizontal' ? 'h-2/5 min-w-8' : 'min-h-8 w-2/5')"
    class="relative grid place-items-center">
    <div
      v-for="stripe in stripes"
      :key="stripe"
      :class="
        cn(
          'bg-muted absolute ',
          orientation === 'vertical' && 'h-0.5 w-3/4 -translate-y-1/2',
          orientation === 'horizontal' && 'h-3/4 w-0.5 -translate-x-1/2',
          everyNth(stripe) && orientation === 'vertical' ? 'h-1' : '',
          everyNth(stripe) && orientation === 'horizontal' ? 'w-1' : ''
        )
      "
      :style="{ [orientation === 'vertical' ? 'top' : 'left']: getOffsetStyle(stripe) }" />
  </div>
</template>

<style scoped></style>
