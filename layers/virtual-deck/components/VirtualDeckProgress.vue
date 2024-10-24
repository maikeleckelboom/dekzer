<script lang="ts" setup>
import { injectVirtualDeckRootContext } from './VirtualDeckRoot.vue'
import type { VirtualDeckRootContext } from '~~/layers/virtual-deck/components/VirtualDeckRoot.vue'

const { progress,duration } = injectVirtualDeckRootContext() as VirtualDeckRootContext

const CIRCLE_SIZE = 100

const viewBox = `0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`
const cx = computed(() => CIRCLE_SIZE / 2)
const cy = computed(() => CIRCLE_SIZE / 2)
const r = computed(() => CIRCLE_SIZE / 2)
const strokeDasharray = computed(() => 2 * Math.PI * r.value)
const strokeDashoffset = computed(() => {
  if (toValue(duration) === 0) return strokeDasharray.value
  return strokeDasharray.value * (1 - progress.value)
})
const strokeWidth = 12
</script>

<template>
  <svg
    :viewBox="viewBox"
    class="absolute size-full"
    data-name="progress-circle">
    <circle
      :cx="cx"
      :cy="cy"
      :r="r"
      :stroke-dasharray="strokeDasharray"
      :stroke-dashoffset="strokeDashoffset"
      :stroke-width="strokeWidth"
      class="stroke-muted-foreground origin-center -rotate-90 transform fill-none" />
  </svg>
</template>